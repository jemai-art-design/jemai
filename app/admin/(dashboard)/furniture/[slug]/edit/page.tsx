import { notFound } from "next/navigation";

import { updateFurnitureAction } from "@/app/admin/(dashboard)/furniture/actions";
import { FurnitureForm, type FurnitureFormValues } from "@/components/admin/furniture-form";
import { getFurniture } from "@/lib/admin/furniture";
import { toContentAsset } from "@/lib/admin/content";
import { furnitureCategoryNames } from "@/lib/taxonomy";

/**
 * Edit — the same form, handed the product as defaults. The action is the update
 * one with the current slug bound to it, so a renamed product still resolves.
 */
const AdminFurnitureEditPage = async ({ params }: PageProps<"/admin/furniture/[slug]/edit">) => {
  const { slug } = await params;
  const furniture = await getFurniture(slug);
  if (!furniture) notFound();

  const values: FurnitureFormValues = {
    name: furniture.name,
    slug: furniture.slug,
    category: furniture.category,
    price: String(furniture.price),
    stock: String(furniture.stock),
    summary: furniture.summary,
    variants: furniture.variants.length
      ? furniture.variants.map((variant) => ({
        size: variant.size,
        colour: variant.colour,
        price: variant.price === null ? "" : String(variant.price),
        quantity: String(variant.quantity),
        images: variant.images.map((src) => toContentAsset(src)),
      }))
      : [{ size: "", colour: "", price: "", quantity: "", images: [] }],
    description: furniture.description,
    timeline: furniture.timeline,
    customization: furniture.customization,
    thumbnail: furniture.thumbnail ? [toContentAsset(furniture.thumbnail)] : [],
  };

  return (
    <FurnitureForm
      furniture={values}
      categories={await furnitureCategoryNames()}
      action={updateFurnitureAction.bind(null, furniture.slug)}
      cancelHref={`/admin/furniture/${furniture.slug}`}
      heading={`Edit ${furniture.name}`}
      submitLabel="Save changes"
    />
  );
};

export default AdminFurnitureEditPage;
