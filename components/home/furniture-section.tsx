import { SectionIntro } from "@/components/site/section-intro";
import { ProductCard, type Product } from "@/components/site/product-card";
import { AssuranceRow } from "@/components/site/assurance-row";

/** The four newest pieces, read on the server by the page that renders this. */
export const FurnitureSection = ({ products }: { products: Product[]; }) => (
  <section className="flex w-full flex-col items-center gap-section-gap-editorial">
    <div className="flex w-full max-w-432 flex-col gap-stack-loose px-4 sm:px-6 lg:px-page-gutter">
      <hr className="border-border-strong w-full border-t-3" />

      <div className="flex w-full flex-col items-center gap-stack-loose py-8">
        <SectionIntro
          className="max-w-270"
          eyebrow="05 / JEMAI Furniture"
          heading="New Pieces For The Way You Live Now"
          copy="Meet the latest additions to JEMAI, selected to bring comfort, character and a presence to everyday living."
          cta={{ label: "Discover The Collection", href: "/furniture" }}
        />

        <div className="grid w-full grid-cols-1 gap-grid-gutter-compact sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.href} product={product} />
          ))}
        </div>
      </div>

      <AssuranceRow />
    </div>
  </section>
);
