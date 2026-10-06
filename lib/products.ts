import type { Product } from "@/components/site/product-card";

export type CatalogueProduct = Product & {
  id: string;
  collection: string;
  colors: string[];
  inStock: boolean;
  amount: number;
};

/** Hand-rolled so server and client always agree, whatever ICU data is around. */
export const naira = (amount: number) =>
  `₦${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

export const nairaExact = (amount: number) => {
  const [whole, fraction] = amount.toFixed(2).split(".");
  return `₦${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${fraction}`;
};

/* ---------------------------------------------------------------------------
   Product detail
   --------------------------------------------------------------------------- */

export type ProductColour = {
  name: string;
  /** Swatch fill; the variant's own hex, or the named-colour fallback. */
  hex: string;
};

export type ProductVariant = {
  colour: string;
  size: string;
  /** Whole naira — the variant's own price, or the product's where it has none. */
  amount: number;
  stock: number;
  /**
   * What the gallery swaps to the moment this combination is picked: the
   * variant's own one to three shots, main image first.
   */
  images: string[];
};

export type ProductSection = {
  title: string;
  body: string;
};

export type ProductDetail = {
  slug: string;
  name: string;
  category: string;
  /** The headline price before a combination is picked — "From ₦x" when the
   *  variants disagree, the single formatted price when they don't. */
  price: string;
  /** The lowest of those, so the stepper and the cart have a number to start on. */
  amount: number;
  summary: string;
  /**
   * Every shot the piece can be seen in, as one carousel: the thumbnail, then
   * each variant's own images in authoring order. Picking a combination slides
   * the rail to that variant rather than replacing what it holds, so the rest
   * of the range stays browsable.
   */
  gallery: string[];
  colourway: ProductColour[];
  sizes: string[];
  variants: ProductVariant[];
  sections: ProductSection[];
};

/**
 * The shots belonging to the current selection. Colour is what changes how a
 * piece looks, so it is what picks them out; a size narrows that down further
 * when its rows carry their own.
 *
 * Falls back to the whole rail rather than to nothing, so a variant saved before
 * imagery moved onto the rows still answers with something.
 */
export const variantImages = (
  product: ProductDetail,
  colour: string,
  size: string,
): string[] => {
  if (!colour) return product.gallery;

  const inColour = product.variants.filter((variant) => variant.colour === colour);
  const sized = size ? inColour.filter((variant) => variant.size === size) : [];
  const matches = sized.length ? sized : inColour;

  const images = [...new Set(matches.flatMap((variant) => variant.images))];
  return images.length ? images : product.gallery;
};

/**
 * Where the current selection sits in the rail, so the carousel can slide to it
 * instead of swapping its contents. `-1` before a colour is picked — clearing a
 * selection leaves the shopper where they were rather than yanking them back.
 */
export const variantSlide = (
  product: ProductDetail,
  colour: string,
  size: string,
): number => {
  if (!colour) return -1;
  const [lead] = variantImages(product, colour, size);
  return lead ? product.gallery.indexOf(lead) : -1;
};
