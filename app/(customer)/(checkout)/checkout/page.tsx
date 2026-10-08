import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutView } from "@/components/checkout/checkout-view";
import { siteImageSrc } from "@/lib/site-images";

export const metadata: Metadata = {
  title: "Checkout — JEMAI",
  description:
    "Confirm your delivery details and place your JEMAI order. All transactions are secure and encrypted.",
};

const CheckoutPage = async () => (
  <Suspense>
    <CheckoutView placeholder={await siteImageSrc("shared.furniture-placeholder")} />
  </Suspense>
);

export default CheckoutPage;
