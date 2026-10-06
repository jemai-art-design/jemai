"use client";

import { useMemo, useState } from "react";
import { CheckCheck, CreditCard, RefreshCw, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { QuantityStepper } from "@/components/shared/quantity-stepper";
import { useProductSelection } from "@/components/furniture/product-selection";
import { useCart } from "@/lib/cart";
import { nairaExact, variantImages, type ProductDetail } from "@/lib/products";

type ProductPurchaseProps = {
  product: ProductDetail;
};

const assurances = [
  { icon: Truck, copy: "Nationwide shipping" },
  { icon: CreditCard, copy: "Pay in your local currency — secure checkout" },
  { icon: RefreshCw, copy: "30-day free returns and exchanges" },
];

/** Green of the stock pill, sampled off the frame. No JEMAI token comes close. */
const stockGreen = "#74aa5b";

export const ProductPurchase = ({ product }: ProductPurchaseProps) => {
  const { colourway, sizes, variants } = product;
  const { add } = useCart();
  // The gallery beside this panel draws whichever variant is picked here, so the
  // selection is held above both of them.
  const { colour, size, setColour, setSize, clear: clearSelection } = useProductSelection();
  const [quantity, setQuantity] = useState(1);

  const table = useMemo(() => {
    const rows = new Map<string, (typeof variants)[number]>();
    for (const variant of variants) rows.set(`${variant.colour}/${variant.size}`, variant);
    return rows;
  }, [variants]);

  const stockOf = (c: string, s: string) => table.get(`${c}/${s}`)?.stock ?? 0;

  const colourInStock = (name: string) =>
    size
      ? stockOf(name, size) > 0
      : variants.some((v) => v.colour === name && v.stock > 0);

  const sizeInStock = (name: string) =>
    colour
      ? stockOf(colour, name) > 0
      : variants.some((v) => v.size === name && v.stock > 0);

  /** Stock for the current selection, or everything still buyable. */
  const available =
    colour && size
      ? stockOf(colour, size)
      : variants
        .filter((v) => (colour ? v.colour === colour : true))
        .filter((v) => (size ? v.size === size : true))
        .reduce((total, v) => total + v.stock, 0);

  const complete = Boolean(colour && size);

  /**
   * A picked combination sells at its own price; before then the product's
   * headline stands, which already reads "From …" when the variants disagree.
   */
  const chosen = complete ? table.get(`${colour}/${size}`) : undefined;
  const amount = chosen?.amount ?? product.amount;

  const choose = (set: (value: string) => void) => (value: string) => {
    set(value);
    setQuantity(1);
  };

  const clear = () => {
    clearSelection();
    setQuantity(1);
  };

  return (
    <>
      <p className="text-body-lg text-text-primary mt-5">
        {chosen ? nairaExact(chosen.amount) : product.price}
      </p>
      <p className="text-body-lg text-text-secondary mt-4 max-w-135">
        {product.summary}
      </p>

      {/* Reads the current selection, so it lives with the chips rather than
          with the static copy above it. */}
      <span
        className="border-border-default bg-surface-page text-body-sm mt-2.5 inline-flex h-8.75 w-fit items-center gap-3 border px-4"
        style={{ color: stockGreen }}
      >
        <CheckCheck aria-hidden className="size-4" strokeWidth={1.75} />
        {available > 0
          ? `${available} Item${available === 1 ? "" : "s"} In Stock`
          : "Out of stock"}
      </span>

      {/* Radix deselects a chip when you click the active one, so this is the
          discoverable way out of a selection — and the only obvious one for the
          colour swatches, which carry no visible label. It heads the block
          because it resets both axes, not the colour it sits beside. */}
      <div className="mt-11 flex items-center justify-between gap-3">
        <p className="text-eyebrow-lg text-text-secondary uppercase" id="product-colour">
          Select Color
        </p>
        {(colour || size) && (
          <Button
            type="button"
            variant="quiet"
            size="xs"
            aria-label="Clear selected colour and size"
            onClick={clear}
            className="text-eyebrow-lg text-[10px] text-text-secondary hover:text-action-link h-auto p-0 uppercase underline underline-offset-4"
          >
            Clear
          </Button>
        )}
      </div>
      <ToggleGroup
        type="single"
        variant="chip"
        size="swatch"
        spacing={3}
        value={colour}
        onValueChange={choose(setColour)}
        aria-labelledby="product-colour"
        className="mt-4 w-full flex-wrap"
      >
        {colourway.map((option) => {
          const enabled = colourInStock(option.name);
          return (
            <ToggleGroupItem
              key={option.name}
              value={option.name}
              disabled={!enabled}
              aria-label={`${option.name}${enabled ? "" : " — unavailable"}`}
              title={option.name}
            >
              <span
                className="block size-full"
                style={{ backgroundColor: option.hex }}
              />
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>

      <p className="text-eyebrow-lg text-text-secondary mt-5 uppercase" id="product-size">
        Select size
      </p>
      <ToggleGroup
        type="single"
        variant="chip"
        size="chip"
        value={size}
        onValueChange={choose(setSize)}
        aria-labelledby="product-size"
        className="mt-4 w-full flex-wrap"
      >
        {sizes.map((option) => (
          <ToggleGroupItem
            key={option}
            value={option}
            disabled={!sizeInStock(option)}
            className="w-fit px-4"
          >
            {option}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <Separator className="bg-border-default mt-4" />

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <QuantityStepper
          size="lg"
          label={product.name}
          value={quantity}
          onChange={setQuantity}
          max={available || 1}
        />

        <Button
          type="button"
          size="cta"
          variant="jemai"
          disabled={!complete || available === 0}
          aria-label={
            complete ? undefined : "Add to cart — choose a colour and size first"
          }
          onClick={() =>
            add({
              slug: product.slug,
              name: product.name,
              // The bag shows the combination that was bought, so it carries
              // that variant's own shot rather than the product's thumbnail.
              image: variantImages(product, colour, size)[0],
              colour,
              size: size || null,
              amount,
              quantity,
            })
          }
          className="h-14.25 w-full sm:w-auto sm:flex-1"
        >
          Add To Cart
        </Button>
      </div>

      <ul className="mt-10 flex flex-col gap-3">
        {assurances.map(({ icon: Icon, copy }) => (
          <li key={copy} className="flex items-center gap-3">
            <Icon
              aria-hidden
              className="text-text-secondary size-4 shrink-0"
              strokeWidth={1.5}
            />
            <span className="text-body-xs text-text-secondary">{copy}</span>
          </li>
        ))}
      </ul>
    </>
  );
};
