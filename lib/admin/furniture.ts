import { Prisma } from "@/lib/generated/prisma/client";
import { naira, slugify, uniqueSlug } from "@/lib/admin/content";
import { searchAcross } from "@/lib/admin/table-query";
import { prisma } from "@/lib/prisma";

// Prices are formatted the same way in every catalogue, so `naira` lives in the
// shared module. Re-exported here because the furniture screens reach for it
// through this store.
export { naira };

/**
 * One buyable combination. The frames drew variants as two free-text tag rails
 * (sizes, then colors); stock is tracked per combination instead, so a row
 * carries its own count and the product's total is their sum.
 */
export type FurnitureVariant = {
  id: string;
  size: string;
  colour: string;
  /** Whole naira, or null when the row sells at the product's own price. */
  price: number | null;
  quantity: number;
  /**
   * The combination's own shots, in the order the detail rail draws them —
   * between one and three. The first is the one the frame swaps to when this
   * combination is picked.
   */
  images: string[];
};

export type Furniture = {
  id: string;
  slug: string;
  name: string;
  category: string;
  /** Whole naira. Formatting happens at the edge so sorting stays numeric. */
  price: number;
  /** Total units. Derived from the variant rows whenever there are any. */
  stock: number;
  summary: string;
  variants: FurnitureVariant[];
  description: string;
  timeline: string;
  customization: string;
  /** Source of the single thumbnail shot, or null before one is uploaded. */
  thumbnail: string | null;
  /** ISO string; the index sorts on it and renders it as "15 May 2020 9:00 pm". */
  updatedAt: string;
};

/** The product's stock: the sum of its variant counts, or its own field if bare. */
export const totalStock = (item: Pick<Furniture, "stock" | "variants">) =>
  item.variants.length
    ? item.variants.reduce((sum, variant) => sum + variant.quantity, 0)
    : item.stock;

/** "2 colors · 1 size · custom pricing" — the index's Options column. */
export const describeVariants = (variants: FurnitureVariant[]) => {
  const count = (values: string[]) => new Set(values.filter(Boolean)).size;
  const colors = count(variants.map((variant) => variant.colour));
  const sizes = count(variants.map((variant) => variant.size));
  const priced = variants.some((variant) => variant.price !== null);
  const parts = [
    colors ? `${colors} ${colors === 1 ? "colour" : "colors"}` : "",
    sizes ? `${sizes} ${sizes === 1 ? "size" : "sizes"}` : "",
    priced ? "custom pricing" : "",
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : "No variants";
};

/** Variants come back in authoring order, which Prisma has to be told. */
const withRelations = {
  variants: { orderBy: { position: "asc" } },
} satisfies Prisma.FurnitureInclude;

type FurnitureRecord = Prisma.FurnitureGetPayload<{ include: typeof withRelations; }>;

/** The row and its relations as the console's one furniture shape. */
const toFurniture = (record: FurnitureRecord): Furniture => ({
  id: record.id,
  slug: record.slug,
  name: record.name,
  category: record.category,
  price: record.price,
  stock: record.stock,
  summary: record.summary,
  variants: record.variants.map((variant) => ({
    id: variant.id,
    size: variant.size,
    colour: variant.colour,
    price: variant.price,
    quantity: variant.quantity,
    images: variant.images,
  })),
  description: record.description,
  timeline: record.timeline,
  customization: record.customization,
  thumbnail: record.thumbnail,
  updatedAt: record.updatedAt.toISOString(),
});

/** Newest first — the order the index draws. */
export type FurnitureQuery = { search?: string; category?: string; };

/**
 * Newest first — the order the index draws — narrowed by the index's search box
 * and category filter, in the query rather than over rows already sent.
 */
export const listFurniture = async ({ search, category }: FurnitureQuery = {}) => {
  const records = await prisma.furniture.findMany({
    where: {
      ...(category ? { category } : {}),
      ...searchAcross(["name"], search),
    },
    include: withRelations,
    orderBy: { updatedAt: "desc" },
  });
  return records.map(toFurniture);
};

/** The overview's counter. A count query, not a fetch of the whole catalogue. */
export const countFurniture = () => prisma.furniture.count();

export const getFurniture = async (slug: string) => {
  const record = await prisma.furniture.findUnique({
    where: { slug },
    include: withRelations,
  });
  return record ? toFurniture(record) : null;
};

export type FurnitureInput = Omit<Furniture, "id" | "slug" | "updatedAt"> & {
  slug: string;
};

/**
 * A slug no other product holds, suffixed `-2`, `-3`, … if one does. Only the
 * candidate's own family is fetched rather than the whole catalogue, and
 * `ignore` is the record's current slug so re-saving it unchanged does not push
 * it to `-2`.
 */
const availableSlug = async (candidate: string, name: string, ignore?: string) => {
  const base = slugify(candidate || name) || "furniture";
  const taken = await prisma.furniture.findMany({
    where: { slug: { startsWith: base } },
    select: { slug: true },
  });
  return uniqueSlug(
    taken.map((row) => row.slug),
    base,
    "furniture",
    ignore,
  );
};

/** The variant rows as Prisma create input, carrying their authoring order. */
const variantRows = (variants: FurnitureVariant[]) =>
  variants.map((variant, position) => ({
    size: variant.size,
    colour: variant.colour,
    price: variant.price,
    quantity: variant.quantity,
    images: variant.images,
    position,
  }));

export const createFurniture = async (input: FurnitureInput) => {
  const record = await prisma.furniture.create({
    data: {
      slug: await availableSlug(input.slug, input.name),
      name: input.name,
      category: input.category,
      price: input.price,
      stock: input.stock,
      summary: input.summary,
      description: input.description,
      timeline: input.timeline,
      customization: input.customization,
      thumbnail: input.thumbnail,
      variants: { create: variantRows(input.variants) },
    },
    include: withRelations,
  });
  return toFurniture(record);
};

/**
 * The variant rows are replaced wholesale rather than reconciled one by one:
 * the form posts the complete list every time, and a row's identity is its
 * position in that list, not an id the client ever held.
 */
export const updateFurniture = async (slug: string, input: FurnitureInput) => {
  const existing = await prisma.furniture.findUnique({ where: { slug }, select: { id: true } });
  if (!existing) return null;

  const record = await prisma.furniture.update({
    where: { id: existing.id },
    data: {
      slug: await availableSlug(input.slug, input.name, slug),
      name: input.name,
      category: input.category,
      price: input.price,
      stock: input.stock,
      summary: input.summary,
      description: input.description,
      timeline: input.timeline,
      customization: input.customization,
      thumbnail: input.thumbnail,
      variants: { deleteMany: {}, create: variantRows(input.variants) },
    },
    include: withRelations,
  });
  return toFurniture(record);
};

/** Cascades to the variant rows — the relation carries `onDelete: Cascade`. */
export const deleteFurniture = async (slug: string) => {
  const { count } = await prisma.furniture.deleteMany({ where: { slug } });
  return count > 0;
};
