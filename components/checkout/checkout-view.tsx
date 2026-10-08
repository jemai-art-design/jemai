"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { FormProvider, useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import {
  confirmOrderAction,
  placeOrderAction,
} from "@/app/(customer)/(checkout)/checkout/actions";
import { Button } from "@/components/ui/button";
import {
  CheckoutModal,
  type CheckoutStatus,
} from "@/components/checkout/checkout-modal";
import {
  DeliveryForm,
  emptyCheckout,
  type CheckoutFormValues,
} from "@/components/checkout/delivery-form";
import { OrderSummary } from "@/components/checkout/order-summary";
import { useCart } from "@/lib/cart";
import { bagTotals } from "@/lib/orders";

type Placed = {
  pieceCount: number;
  item: { name: string; image: string; };
};

type Outcome = {
  reference: string;
  status: Exclude<CheckoutStatus, "pending">;
  /** The house number, once the order behind the reference has been read. */
  number: string;
};

/**
 * `placeholder` is the furniture fallback plate, read on the page and handed
 * down: the confirmation panel features one line of the bag, and a piece with
 * no photography of its own has to show something.
 */
export const CheckoutView = ({ placeholder }: { placeholder: string; }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const { lines, count, subtotal, setOpen, clear, consented } = useCart();

  const form = useForm<CheckoutFormValues>({
    defaultValues: emptyCheckout,
    mode: "onChange",
  });

  const [paying, startPaying] = useTransition();
  const [placed, setPlaced] = useState<Placed | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  const settled = outcome?.reference === reference ? outcome : null;
  const status: CheckoutStatus | null = reference ? (settled?.status ?? "pending") : null;

  /**
   * The buyer is back from the payment page with a reference, so the payment is
   * verified. The modal sits on `pending` for as long as this runs and settles
   * on whichever way it answers.
   *
   * The bag is still whole at this point — nothing was cleared on the way out,
   * because a payment that never completes has to leave the buyer their cart —
   * so the piece the modal features is taken from it before it is emptied.
   */
  useEffect(() => {
    if (!reference) return;

    // The bag as it stands on the way back in, held before anything empties it
    // so the outcome modal keeps the piece it is about. It is read once, on the
    // render the buyer returned on, which is why `lines` is not a dependency —
    // re-running this on a cart change would re-verify the same payment.
    const featured = lines[0]
      ? { pieceCount: count, item: { name: lines[0].name, image: lines[0].image } }
      : null;

    let cancelled = false;
    confirmOrderAction(reference).then((result) => {
      if (cancelled) return;

      if (result.error) {
        setOutcome({ reference, status: "failed", number: reference });
        return;
      }

      setOutcome({
        reference,
        status: result.data.paid ? "success" : "failed",
        number: result.data.number,
      });

      // The order is paid for, so the bag it came from is spent.
      if (result.data.paid) {
        if (featured) setPlaced(featured);
        clear();
      }
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference, clear]);

  /** Drops `?reference=…` so the outcome modal doesn't re-open on a reload. */
  const dismiss = useCallback(() => {
    setOutcome(null);
    router.replace("/checkout");
  }, [router]);

  const totals = bagTotals(subtotal);

  const canPay =
    form.formState.isValid && lines.length > 0 && consented && !paying;

  const submit = (values: CheckoutFormValues) => {
    if (lines.length === 0 || !consented || paying) return;

    startPaying(async () => {
      const result = await placeOrderAction({
        ...values,
        items: lines.map((line) => ({
          slug: line.slug,
          colour: line.colour,
          size: line.size ?? "",
          quantity: line.quantity,
        })),
      });

      if (result.error) {
        toast.error(result.message);
        return;
      }

      // The order is not an order until Paystack says so, so the page hands the
      // browser over rather than congratulating anyone. Paystack returns the
      // buyer to this screen, where the effect above picks the reference up.
      window.location.href = result.data.authorizationUrl;
    });
  };

  if (lines.length === 0 && !reference)
    return (
      <div className="mx-auto w-full max-w-243 px-4 pt-2.5 pb-20 sm:px-6 lg:px-0">
        <h1 className="font-heading text-text-primary text-h3">Checkout</h1>
        <p className="text-body text-text-secondary mt-6">
          There is nothing in your bag yet, so there is nothing to check out.
        </p>
        <Button asChild variant="jemai" size="cta" className="mt-6">
          <Link href="/furniture">Browse furniture</Link>
        </Button>
      </div>
    );

  const feature = placed?.item ?? lines[0];

  return (
    <div className="mx-auto w-full max-w-243 px-4 pt-2.5 pb-20 sm:px-6 lg:px-0">
      <h1 className="font-heading text-text-primary text-h3">Checkout</h1>

      <FormProvider {...form}>
        <form
          id="checkout-form"
          onSubmit={(event) => form.handleSubmit(submit)(event)}
          className="mt-6.75 flex flex-col gap-12 lg:flex-row lg:gap-8"
        >
          <div className="lg:flex-1">
            <DeliveryForm />
          </div>
          <div className="lg:flex-1">
            <OrderSummary
              lines={lines}
              totals={totals}
              canPay={canPay}
              paying={paying}
            />
          </div>
        </form>
      </FormProvider>

      <CheckoutModal
        status={status}
        onOpenChange={(open) => !open && dismiss()}
        feature={{
          name: feature?.name ?? "Your order",
          image: feature?.image ?? placeholder,
        }}
        orderReference={settled?.number ?? reference ?? ""}
        pieceCount={placed?.pieceCount ?? count}
        onContinueShopping={() => router.push("/furniture")}
        onReturnToPayment={dismiss}
        onReviewOrder={() => {
          dismiss();
          setOpen(true);
        }}
      />
    </div>
  );
};
