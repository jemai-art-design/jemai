"use server";

import { revalidatePath } from "next/cache";
import { Country, State } from "country-state-city";
import * as Yup from "yup";

import { failWith, fail, ok, validate, type ActionResult } from "@/lib/action-result";
import { createOrder, settleOrder, type OrderItemInput } from "@/lib/admin/orders";
import env from "@/lib/env";
import { SHIPPING } from "@/lib/orders";
import { initializePayment, paymentReference } from "@/lib/paystack";
import { prisma } from "@/lib/prisma";
import { cleanText } from "@/lib/utils";

const cleanLabel = (value: string | undefined) =>
  value == null ? value : cleanText(value);

const orderPayload = () =>
  Yup.object({
    fullName: Yup.string().trim().required("Enter your full name."),
    email: Yup
      .string()
      .trim()
      .email("Enter a valid email address.")
      .required("Enter the email address your receipt should go to."),
    phone: Yup.string().trim().required("Enter a phone number we can reach you on."),
    country: Yup.string().trim().required("Pick your country."),
    address: Yup.string().trim().required("Enter your delivery address."),
    city: Yup.string().trim().required("Enter your city."),
    postalCode: Yup.string().trim().default(""),
    state: Yup.string().trim().default(""),
    notes: Yup.string().trim().default(""),
    items: Yup
      .array()
      .of(
        Yup.object({
          slug: Yup.string().trim().required(),
          colour: Yup.string().transform(cleanLabel).default(""),
          size: Yup.string().transform(cleanLabel).default(""),
          quantity: Yup.number().integer().min(1).max(99).required(),
        }),
      )
      .min(1, "There is nothing in your bag to check out.")
      .required("There is nothing in your bag to check out."),
  });

type OrderLine = Yup.InferType<ReturnType<typeof orderPayload>>["items"][number];

type PricedBag =
  | { error: string; }
  | { items: OrderItemInput[]; subtotal: number; shipping: number; total: number; };

const priceBag = async (lines: OrderLine[]): Promise<PricedBag> => {
  const records = await prisma.furniture.findMany({
    where: { slug: { in: lines.map((line) => line.slug) } },
    include: { variants: { orderBy: { position: "asc" } } },
  });

  const items: OrderItemInput[] = [];

  for (const line of lines) {
    const piece = records.find((record) => record.slug === line.slug);
    if (!piece) return { error: `${line.slug.replace(/-/g, " ")} is no longer available.` };

    // Matched on the cleaned values rather than byte-for-byte: the storefront
    // sends the colour as it drew it, which is not the stored string when the
    // row was pasted in carrying invisible characters.
    const colourway = piece.variants.filter(
      (variant) => !line.colour || cleanText(variant.colour) === line.colour,
    );
    const sized = colourway.filter((variant) => cleanText(variant.size) === line.size);
    const variant = (sized.length ? sized : colourway)[0] ?? null;

    if (piece.variants.length && !variant)
      return { error: `The ${piece.name} you chose is no longer made in that colour or size.` };

    // A piece with no variant rows at all carries its count on itself.
    const available = variant ? variant.quantity : piece.stock;

    if (available <= 0) return { error: `${piece.name} has just gone out of stock.` };
    if (available < line.quantity)
      return {
        error: `Only ${available} of the ${piece.name} you chose ${available === 1 ? "is" : "are"
          } left.`,
      };

    items.push({
      furnitureId: piece.id,
      variantId: variant?.id ?? null,
      name: piece.name,
      slug: piece.slug,
      image: piece.thumbnail ?? piece.gallery[0] ?? "",
      colour: variant?.colour ?? line.colour,
      size: variant?.size ?? line.size,
      // The variant's own price is what the storefront quoted; a row without
      // one sells at the product's, as does a piece with no variants at all.
      unitPrice: variant?.price ?? piece.price,
      quantity: line.quantity,
    });
  }

  const subtotal = items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
  return { items, subtotal, shipping: SHIPPING, total: subtotal + SHIPPING };
};

export type OrderPlaced = {
  reference: string;
  number: string;
  authorizationUrl: string;
};

export const placeOrderAction = async (
  values: unknown,
): Promise<ActionResult<OrderPlaced>> => {
  const parsed = await validate(orderPayload(), values);
  if (parsed.error) return parsed;

  const { fullName, email, phone, country, state, items, ...delivery } = parsed.data;

  try {
    const priced = await priceBag(items);
    if ("error" in priced) return fail(priced.error);

    // The form keys its pickers off ISO codes; the console reads addresses, so
    // the names are resolved here and the codes are not stored.
    const countryName = Country.getCountryByCode(country)?.name ?? country;
    const stateName = state
      ? (State.getStateByCodeAndCountry(state, country)?.name ?? state)
      : "";

    const reference = paymentReference("JEM-ORD");

    const order = await createOrder({
      reference,
      name: fullName,
      email,
      phone,
      country: countryName,
      state: stateName,
      ...delivery,
      ...priced,
    });

    const { authorizationUrl } = await initializePayment({
      email,
      amount: order.total,
      reference,
      callbackUrl: `${env.APP_URL}/checkout`,
      metadata: { order: order.number, name: fullName, phone },
    });

    revalidatePath("/admin/orders");
    revalidatePath("/admin");

    return ok({ reference, number: order.number, authorizationUrl });
  } catch (error) {
    return failWith("Could not start your payment just now. Try again.", error);
  }
};

export type OrderOutcome = {
  paid: boolean;
  number: string;
  message: string;
};

export const confirmOrderAction = async (
  reference: string,
): Promise<ActionResult<OrderOutcome>> => {
  if (!reference.trim()) return fail("That payment reference is missing.");

  try {
    const order = await settleOrder(reference);
    if (!order) return fail("We have no order under that reference.");

    revalidatePath("/admin/orders");
    revalidatePath("/admin");

    if (order.payment === "Paid")
      return ok({
        paid: true,
        number: order.number,
        message: `Payment received — order ${order.number} is confirmed and in production.`,
      });

    if (order.payment === "Pending payment")
      return ok({
        paid: false,
        number: order.number,
        message: "Your payment is still processing. We will email you once it clears.",
      });

    return ok({
      paid: false,
      number: order.number,
      message: "That payment did not go through, so nothing was charged. You can try again.",
    });
  } catch (error) {
    return failWith("Could not confirm that payment just now. Try again.", error);
  }
};
