import { colornames } from "color-name-list";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  naira,
  nairaExact,
  type CatalogueProduct,
  type ProductColour,
  type ProductDetail,
  type ProductSection,
  type ProductVariant,
} from "@/lib/products";
import { MAX_VARIANT_IMAGES } from "@/lib/constants";
import { siteImageSrc } from "@/lib/site-images";
import { furnitureCategoryNames } from "@/lib/taxonomy";
import { cleanText } from "@/lib/utils";
import type { Product } from "@/components/site/product-card";

/**
 * Stands in for a product whose imagery has not been uploaded yet. A site image
 * rather than a constant: it is seen on the catalogue, the home rail, the
 * product page and the cart, so the plate is the studio's to choose.
 */
const placeholder = () => siteImageSrc("shared.furniture-placeholder");

const SWATCHES: Record<string, string> = {
  cream: "#efe7db",
  tan: "#d1a97f",
  amber: "#cc5500",
  olive: "#3c4c24",
  white: "#f4f2ee",
  charcoal: "#3a3a3a",
  black: "#1c1c1c",
  green: "#3c4c24",
  red: "#8c2f24",
  blue: "#2f4a6d",
  oak: "#c8a978",
  walnut: "#6b4a30",
};

const NAMED = new Map(colornames.map(({ name, hex }) => [name.toLowerCase(), hex]));

const swatch = (colour: string) => {
  // `trim()` alone leaves a pasted word joiner in place, and "\u2060beige"
  // matches nothing — the fill would silently fall through to cream.
  const name = cleanText(colour).toLowerCase();
  if (SWATCHES[name]) return SWATCHES[name];

  const named = NAMED.get(name);
  if (named) return named;

  for (const word of name.split(/[\s/-]+/))
    if (SWATCHES[word]) return SWATCHES[word];

  return SWATCHES.cream;
};

/** Shipping and returns is policy, not product copy, so it is written here. */
const SHIPPING_SECTION: ProductSection = {
  title: "Shipping/Returns",
  body: "Nationwide delivery is included on orders over ₦1,818,510. Stocked pieces can be returned within 30 days in their original condition for a full refund; made-to-order and customised pieces are final sale.",
};

const withRelations = {
  variants: { orderBy: { position: "asc" } },
} satisfies Prisma.FurnitureInclude;

type FurnitureRecord = Prisma.FurnitureGetPayload<{ include: typeof withRelations; }>;

/**
 * Everything the piece can be shown as: its thumbnail first, then each variant's
 * own shots in authoring order, de-duplicated — sibling rows that share a colour
 * usually carry the same pictures.
 */
const images = (plate: string, record: FurnitureRecord) => {
  const sources = [
    ...new Set([
      ...(record.thumbnail ? [record.thumbnail] : []),
      ...record.variants.flatMap((variant) => variant.images),
    ]),
  ];
  return sources.length ? sources : [plate];
};

/**
 * The prices a piece can actually be bought at: one per variant, falling back to
 * the product's own price for a row that carries none, and just the product's
 * price when it has no variants at all.
 */
const priceRange = (record: FurnitureRecord) => {
  const amounts = record.variants.map((variant) => variant.price ?? record.price);
  if (!amounts.length) return { low: record.price, high: record.price };
  return { low: Math.min(...amounts), high: Math.max(...amounts) };
};

/**
 * What a card and the detail heading lead with. Variants that disagree on price
 * cannot be reduced to one number before a combination is picked, so the lowest
 * is shown as a "From".
 */
const headline = (record: FurnitureRecord, format: (amount: number) => string) => {
  const { low, high } = priceRange(record);
  return low === high ? format(low) : `From ${format(low)}`;
};

/** Anything with a variant in stock, or — for a product with none — its own count. */
const inStock = (record: FurnitureRecord) =>
  record.variants.length
    ? record.variants.some((variant) => variant.quantity > 0)
    : record.stock > 0;

const toCatalogueProduct = (plate: string, record: FurnitureRecord): CatalogueProduct => ({
  id: record.id,
  name: record.name,
  category: record.category,
  collection: record.category,
  colors: [...new Set(record.variants.map((variant) => cleanText(variant.colour)).filter(Boolean))],
  inStock: inStock(record),
  amount: priceRange(record).low,
  price: headline(record, naira),
  image: images(plate, record)[0],
  href: `/furniture/${record.slug}`,
});

/** The card shape the home rail and the related row draw. */
const toCard = (plate: string, record: FurnitureRecord): Product => ({
  name: record.name,
  category: record.category,
  price: headline(record, naira),
  image: images(plate, record)[0],
  href: `/furniture/${record.slug}`,
});

/**
 * The catalogue grid and the filter options it offers, in one trip. The tabs and
 * the colour list are drawn from the products on the page rather than from a
 * fixed vocabulary, so a filter can never come up empty.
 */
export const loadCatalogue = async () => {
  const [records, plate] = await Promise.all([
    prisma.furniture.findMany({
      include: withRelations,
      orderBy: { createdAt: "desc" },
    }),
    placeholder(),
  ]);
  const products = records.map(toCatalogueProduct.bind(null, plate));

  return {
    products,
    collections: [...new Set(products.map((product) => product.collection))].sort(),
  };
};

/**
 * The header's Furniture menu, in the order the console arranges the categories
 * in. Same rule as the Art menu's mediums: only the ones the catalogue actually
 * holds pieces under, so the menu can never lead to an empty grid — a category
 * opened ahead of the products that will fill it stays out of the storefront
 * until one arrives.
 */
export const listFurnitureCategories = async (): Promise<string[]> => {
  const [names, rows] = await Promise.all([
    furnitureCategoryNames(),
    prisma.furniture.findMany({
      distinct: ["category"],
      select: { category: true },
    }),
  ]);

  const stocked = new Set(rows.map((row) => row.category).filter(Boolean));
  return names.filter((name) => stocked.has(name));
};

/** The four pieces the home page leads with — the newest in the catalogue. */
export const featuredFurniture = async (limit = 4): Promise<Product[]> => {
  const [records, plate] = await Promise.all([
    prisma.furniture.findMany({
      include: withRelations,
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    placeholder(),
  ]);
  return records.map(toCard.bind(null, plate));
};

export const getFurnitureDetail = async (slug: string): Promise<ProductDetail | null> => {
  const [record, plate] = await Promise.all([
    prisma.furniture.findUnique({ where: { slug }, include: withRelations }),
    placeholder(),
  ]);
  if (!record) return null;

  // Both axes come off the variant rows in authoring order, de-duplicated: the
  // detail frame draws one swatch per colour and one chip per size, and crosses
  // them against the stock table below.
  const colourway: ProductColour[] = [];
  const sizes: string[] = [];

  // Cleaned once, here: a row whose colour carries an invisible character would
  // otherwise draw its own swatch and then match nothing in the stock table.
  const rows = record.variants.map((variant) => ({
    ...variant,
    colour: cleanText(variant.colour),
    size: cleanText(variant.size),
  }));

  for (const variant of rows) {
    if (variant.colour && !colourway.some((colour) => colour.name === variant.colour))
      colourway.push({
        name: variant.colour,
        hex: swatch(variant.colour),
      });
    if (variant.size && !sizes.includes(variant.size)) sizes.push(variant.size);
  }

  /**
   * A product whose variants only vary by colour still needs one size for the
   * picker to complete on, since the frame requires both axes before it will
   * add to the cart. "One size" is that single chip.
   */
  const axes = sizes.length ? sizes : ["One size"];

  const variants: ProductVariant[] = colourway.flatMap((colour) =>
    axes.map((size) => {
      const matches = rows.filter(
        (variant) =>
          variant.colour === colour.name &&
          (sizes.length ? variant.size === size : true),
      );

      // The shots the gallery swaps to. A cell backed by more than one row —
      // only possible on a colour-only product — pools them, and the rail is
      // capped at what a variant is allowed to carry either way.
      const shots = [...new Set(matches.flatMap((variant) => variant.images))];

      return {
        colour: colour.name,
        size,
        // The combination's own price when one of its rows sets one, the
        // product's otherwise. Two rows collapsing into one cell is only
        // possible on a colour-only product, where the first row wins.
        amount: matches.find((variant) => variant.price !== null)?.price ?? record.price,
        stock: matches.reduce((total, variant) => total + variant.quantity, 0),
        // Falls back to the piece's own rail for a row saved before imagery
        // moved onto the variants, so no combination draws an empty frame.
        images: (shots.length ? shots : images(plate, record)).slice(0, MAX_VARIANT_IMAGES),
      };
    }),
  );

  return {
    slug: record.slug,
    name: record.name,
    category: record.category,
    price: headline(record, nairaExact),
    amount: priceRange(record).low,
    summary: record.summary,
    // The whole carousel, not just the opening shot: every variant's imagery in
    // authoring order behind the thumbnail. Picking a combination slides to its
    // own shots, so the rest of the range has to still be in the rail to slide
    // through. Never empty — `images` falls back to the placeholder.
    gallery: images(plate, record),
    colourway,
    sizes: axes,
    variants,
    sections: [
      { title: "Description", body: record.description },
      { title: "Production/Delivery Timeline", body: record.timeline },
      { title: "Customization", body: record.customization },
      SHIPPING_SECTION,
    ],
  };
};

/**
 * The "You May Also Like" rail: the rest of the piece's own category first,
 * topped up from the wider catalogue when that category is thin.
 */
export const relatedFurniture = async (slug: string, limit = 4): Promise<Product[]> => {
  const record = await prisma.furniture.findUnique({
    where: { slug },
    select: { category: true },
  });

  const [records, plate] = await Promise.all([
    prisma.furniture.findMany({
      where: { slug: { not: slug } },
      include: withRelations,
      orderBy: { createdAt: "desc" },
      take: limit * 3,
    }),
    placeholder(),
  ]);

  const sameCategory = records.filter((item) => item.category === record?.category);
  const rest = records.filter((item) => item.category !== record?.category);

  return [...sameCategory, ...rest].slice(0, limit).map(toCard.bind(null, plate));
};
