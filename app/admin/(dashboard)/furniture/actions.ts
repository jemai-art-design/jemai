"use server";

import { revalidatePath } from "next/cache";
import * as Yup from "yup";

import { failWith, ok, validate, fail, type ActionResult } from "@/lib/action-result";
import { readActiveAdmin } from "@/lib/admin/auth/session";
import { hasPermission } from "@/lib/admin/auth/permissions";
import {
  createFurniture,
  deleteFurniture,
  updateFurniture,
  type FurnitureInput,
} from "@/lib/admin/furniture";
import { imageAssetSchema } from "@/lib/cloudinary";
import { furnitureCategoryNames } from "@/lib/taxonomy";
import { cleanText } from "@/lib/utils";

/**
 * The console's own layout already turns an unauthenticated visitor away, but a
 * server action is its own entry point — a signed-out or unprivileged caller can
 * post to one directly, so each write checks for itself.
 */
const requireFurnitureAccess = async (): Promise<ActionResult<string>> => {
  const session = await readActiveAdmin();
  if (!session) return fail("Your session has expired. Sign in again.");
  if (!hasPermission(session.permissions, "furniture"))
    return fail("You do not have access to the furniture catalogue.");
  return ok(session.id);
};

const cleanLabel = (value: string | undefined) =>
  value == null ? value : cleanText(value);

/**
 * The payload both writes accept. Declared once here rather than inline in each
 * action because the create and the edit are the same form posting the same
 * shape — it stays in this file, next to its only two callers.
 *
 * `categories` is read per call rather than closed over: the vocabulary is
 * managed at /admin/taxonomy, so a category added a moment ago has to be
 * acceptable to the very next save.
 */
const furniturePayload = (categories: string[]) =>
  Yup.object({
    name: Yup.string().trim().required("A product name is required."),
    slug: Yup.string().trim().default(""),
    category: Yup
      .string()
      .trim()
      // The select opens on its placeholder, so an untouched form posts "" —
      // which is the same as the author not having narrowed it down.
      .transform((value: string) => value || categories[0])
      .oneOf(categories, "Pick a category from the list.")
      .required("Pick a category from the list."),
    price: Yup
      .number()
      .typeError("Enter a price in whole naira.")
      .integer("Enter a price in whole naira.")
      .moreThan(0, "Enter a price in whole naira.")
      .required("A price is required."),
    // Only consulted when a product has no variants; with variants it is
    // recomputed from their quantities below, whatever the form posted.
    stock: Yup.number().typeError("Enter a stock quantity.").integer().min(0).default(0),
    summary: Yup.string().trim().required("A product summary is required."),
    description: Yup.string().trim().required("A description is required."),
    timeline: Yup.string().trim().required("A timeline is required."),
    customization: Yup.string().trim().required("A customization note is required."),
    variants: Yup
      .array(
        Yup.object({
          // Pasted colour lists carry word joiners and non-breaking spaces,
          // which survive a trim and then match no swatch and no other row.
          size: Yup.string().transform(cleanLabel).default(""),
          colour: Yup
            .string()
            .transform(cleanLabel)
            .required("Every variant needs a colour."),
          // Left blank, the row sells at the product's price — which is what
          // the empty string an untouched input posts has to become.
          price: Yup
            .number()
            .typeError("Enter a variant price in whole naira.")
            .transform((value: number, original: unknown) =>
              String(original ?? "").trim() === "" ? null : value,
            )
            .integer("Enter a variant price in whole naira.")
            .moreThan(0, "Enter a variant price in whole naira.")
            .nullable()
            .default(null),
          quantity: Yup
            .number()
            .typeError("Variant quantities must be whole numbers.")
            .integer("Variant quantities must be whole numbers.")
            .min(0, "Variant quantities must be whole numbers.")
            .default(0),
        }),
      )
      .default([]),
    thumbnail: Yup.array(imageAssetSchema).max(1, "A product has one thumbnail.").default([]),
    media: Yup.array(imageAssetSchema).default([]),
  });

type FurniturePayload = Yup.InferType<ReturnType<typeof furniturePayload>>;

/** The one place the form's strings become the store's numbers. */
const toInput = (values: FurniturePayload): FurnitureInput => {
  // A row the author left entirely blank is not a variant; the form seeds one
  // empty row on a product that has none.
  const variants = values.variants
    .filter((variant) => variant.colour || variant.size)
    .map((variant) => ({
      id: "",
      size: variant.size,
      colour: variant.colour,
      price: variant.price ?? null,
      quantity: variant.quantity,
    }));

  return {
    slug: values.slug,
    name: values.name,
    category: values.category,
    price: values.price,
    stock: variants.length
      ? variants.reduce((sum, variant) => sum + variant.quantity, 0)
      : values.stock,
    summary: values.summary,
    variants,
    description: values.description,
    timeline: values.timeline,
    customization: values.customization,
    thumbnail: values.thumbnail[0]?.src ?? null,
    media: values.media.map((asset) => asset.src),
  };
};

/**
 * The screens a written product shows up on. The storefront pages are rendered
 * from the same rows, so they are revalidated alongside the console rather than
 * waiting for their own cache to lapse.
 */
const revalidateFurniture = (slug?: string) => {
  revalidatePath("/admin/furniture");
  revalidatePath("/admin");
  revalidatePath("/furniture");
  revalidatePath("/");
  if (slug) {
    revalidatePath(`/admin/furniture/${slug}`);
    revalidatePath(`/furniture/${slug}`);
  }
};

/** Creates the product. The caller navigates to the slug that comes back. */
export const createFurnitureAction = async (
  values: unknown,
): Promise<ActionResult<{ slug: string; name: string; }>> => {
  const access = await requireFurnitureAccess();
  if (access.error) return access;

  const categories = await furnitureCategoryNames();
  if (!categories.length)
    return fail("Add a furniture category before saving a product.");

  const parsed = await validate(furniturePayload(categories), values);
  if (parsed.error) return parsed;

  try {
    const created = await createFurniture(toInput(parsed.data));
    revalidateFurniture(created.slug);
    return ok({ slug: created.slug, name: created.name });
  } catch (error) {
    return failWith("Could not save this product. Try again.", error);
  }
};

/** Same trip for an edit — the slug can change, so the new one comes back. */
export const updateFurnitureAction = async (
  slug: string,
  values: unknown,
): Promise<ActionResult<{ slug: string; name: string; }>> => {
  const access = await requireFurnitureAccess();
  if (access.error) return access;

  const categories = await furnitureCategoryNames();
  if (!categories.length)
    return fail("Add a furniture category before saving a product.");

  const parsed = await validate(furniturePayload(categories), values);
  if (parsed.error) return parsed;

  try {
    const updated = await updateFurniture(slug, toInput(parsed.data));
    if (!updated) return fail("That product no longer exists.");

    revalidateFurniture(updated.slug);
    // The old slug's pages have to go too, or a renamed product keeps serving
    // from the path it used to live at.
    if (updated.slug !== slug) revalidateFurniture(slug);

    return ok({ slug: updated.slug, name: updated.name });
  } catch (error) {
    return failWith("Could not save this product. Try again.", error);
  }
};

export const deleteFurnitureAction = async (
  slug: string,
): Promise<ActionResult<string>> => {
  const access = await requireFurnitureAccess();
  if (access.error) return access;

  try {
    const deleted = await deleteFurniture(slug);
    if (!deleted) return fail("That product no longer exists.");

    revalidateFurniture(slug);
    return ok("Product deleted");
  } catch (error) {
    return failWith("Could not delete this product. Try again.", error);
  }
};
