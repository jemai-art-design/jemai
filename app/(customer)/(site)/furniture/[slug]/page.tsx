import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/furniture/product-gallery";
import { ProductPurchase } from "@/components/furniture/product-purchase";
import { ProductSections } from "@/components/furniture/product-sections";
import { ProductSelectionProvider } from "@/components/furniture/product-selection";
import { RelatedProducts } from "@/components/site/related-products";
import { getFurnitureDetail, relatedFurniture } from "@/lib/furniture";

export const generateMetadata = async ({
  params,
}: PageProps<"/furniture/[slug]">): Promise<Metadata> => {
  const { slug } = await params;
  const product = await getFurnitureDetail(slug);
  if (!product) return { title: "Not found | JEMAI" };

  return {
    title: `${product.name} | JEMAI`,
    description: product.summary,
  };
};

/** This frame separates the crumbs with a slash, not the catalogue's chevron. */
const Slash = () => (
  <span aria-hidden className="text-text-secondary text-body-xs">
    /
  </span>
);

const Breadcrumb = ({ name }: { name: string; }) => (
  <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2">
    <Link
      href="/"
      className="text-body-xs text-text-secondary underline-offset-4 hover:underline"
    >
      Home
    </Link>
    <Slash />
    <Link
      href="/furniture"
      className="text-body-xs text-text-secondary underline-offset-4 hover:underline"
    >
      Furniture
    </Link>
    <Slash />
    <span className="text-body-xs text-text-primary" aria-current="page">
      {name}
    </span>
  </nav>
);

const ProductDetailPage = async ({ params }: PageProps<"/furniture/[slug]">) => {
  const { slug } = await params;
  const product = await getFurnitureDetail(slug);
  if (!product) notFound();

  return (
    <>
      <section className="flex w-full flex-col pt-3 pb-10 lg:pb-10.25">
        <div className="w-full px-4 sm:px-6 lg:px-page-gutter">
          <hr className="border-border-strong mx-auto w-full max-w-432 border-t-3" />
        </div>

        <div className="w-full px-4 sm:px-6 lg:px-page-gutter mt-12">
          <div className="mx-auto w-full max-w-432">
            <Breadcrumb name={product.name} />
          </div>
        </div>

        <div className="mt-3.5 w-full px-4 sm:px-6 lg:px-page-gutter">
          <ProductSelectionProvider>
            <div className="mx-auto grid w-full max-w-432 grid-cols-1 items-start lg:grid-cols-[660fr_652fr]">
              <div className="border-border-default border p-6 sm:p-8 lg:p-10">
                <ProductGallery product={product} />
              </div>

              <div className="border-t-border-strong lg:border-l-border-default flex flex-col border-t pt-8 lg:border-l lg:pt-10.5 lg:pr-5 lg:pl-10">
                <h1 className="font-heading text-text-primary text-2xl sm:text-h3">
                  {product.name}
                </h1>

                <ProductPurchase product={product} />

                <div className="mt-14 lg:mr-5">
                  <ProductSections sections={product.sections} />
                </div>
              </div>
            </div>
          </ProductSelectionProvider>
        </div>
      </section>

      <RelatedProducts products={await relatedFurniture(product.slug)} />
    </>
  );
};

export default ProductDetailPage;
