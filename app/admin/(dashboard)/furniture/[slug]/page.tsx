import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteFurnitureAction } from "@/app/admin/(dashboard)/furniture/actions";
import { ContentActionsMenu } from "@/components/admin/content-actions-menu";
import { CopyPanel, DetailRow } from "@/components/admin/record-panels";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getFurniture, naira, totalStock } from "@/lib/admin/furniture";
import { cn } from "@/lib/utils";

/**
 * A product's detail screen: the record on the left, its imagery on the right.
 * This is where a create or an edit lands.
 */
const AdminFurnitureDetailPage = async ({ params }: PageProps<"/admin/furniture/[slug]">) => {
  const { slug } = await params;
  const furniture = await getFurniture(slug);
  if (!furniture) notFound();

  // Rows saved before imagery moved onto the variants, and rows an import left
  // bare. Called out here rather than only in the form, which has to be opened.
  const missingMedia = furniture.variants
    .filter((variant) => !variant.images.length)
    .map((variant) => [variant.colour, variant.size].filter(Boolean).join(" · "));

  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_420px]">
      <Card className="ring-border-default py-6">
        <CardHeader className="gap-3">
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-text-primary font-sans text-xl font-semibold">
              {furniture.name}
            </CardTitle>
            <ContentActionsMenu
              name={furniture.name}
              editHref={`/admin/furniture/${furniture.slug}/edit`}
              deleteLabel="Delete product"
              deletedHref="/admin/furniture"
              onDelete={deleteFurnitureAction.bind(null, furniture.slug)}
            />
          </div>
          <p className="text-text-secondary max-w-[60ch] text-sm">{furniture.summary}</p>
        </CardHeader>

        <CardContent className="flex flex-col gap-8">
          <section className="flex flex-col gap-1">
            <h2 className="text-text-primary mb-1 text-sm font-semibold">Details</h2>
            <dl className="divide-border-default/60 flex flex-col divide-y">
              <DetailRow label="slug" value={furniture.slug} />
              <DetailRow label="Category" value={furniture.category} />
              <DetailRow label="Price" value={naira(furniture.price)} />
              <DetailRow label="Stock Quantity" value={String(totalStock(furniture))} />
            </dl>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-text-primary text-sm font-semibold">Variants</h2>
            {furniture.variants.length ? (
              <div className="border-border-default overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border-default hover:bg-transparent">
                      <TableHead className="text-text-secondary h-10 px-3 text-xs font-normal">
                        Size
                      </TableHead>
                      <TableHead className="text-text-secondary h-10 px-3 text-xs font-normal">
                        Colour
                      </TableHead>
                      <TableHead className="text-text-secondary h-10 px-3 text-xs font-normal">
                        Images
                      </TableHead>
                      <TableHead className="text-text-secondary h-10 px-3 text-right text-xs font-normal">
                        Price
                      </TableHead>
                      <TableHead className="text-text-secondary h-10 px-3 text-right text-xs font-normal">
                        Quantity
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {furniture.variants.map((variant) => (
                      <TableRow key={variant.id} className="border-border-default">
                        <TableCell className="text-text-primary px-3 py-2.5 text-sm">
                          {variant.size || "—"}
                        </TableCell>
                        <TableCell className="text-text-primary px-3 py-2.5 text-sm">
                          {variant.colour || "—"}
                        </TableCell>
                        {/* The shots the storefront swaps to when this
                            combination is picked, in the order it draws them. */}
                        <TableCell className="px-3 py-2.5">
                          {variant.images.length ? (
                            <ul className="flex items-center gap-1.5">
                              {variant.images.map((src, index) => (
                                <li key={`${src}-${index}`}>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={src}
                                    alt={`${furniture.name} — ${variant.colour}${variant.size ? `, ${variant.size}` : ""
                                      } view ${index + 1}`}
                                    className="bg-surface-subtle size-9 rounded-md object-cover"
                                  />
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-[#e11d48] text-xs">None yet</span>
                          )}
                        </TableCell>
                        {/* A row without its own price sells at the product's,
                            so that is what it shows, muted to say so. */}
                        <TableCell
                          className={cn(
                            "px-3 py-2.5 text-right text-sm",
                            variant.price === null ? "text-text-secondary" : "text-text-primary"
                          )}
                        >
                          {naira(variant.price ?? furniture.price)}
                        </TableCell>
                        <TableCell className="text-text-primary px-3 py-2.5 text-right text-sm">
                          {variant.quantity}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-text-secondary text-sm">No variants on this product.</p>
            )}
          </section>

          <Accordion
            type="multiple"
            defaultValue={["description", "timeline", "customization"]}
            className="gap-3"
          >
            <CopyPanel value="description" label="Description*" body={furniture.description} />
            <CopyPanel
              value="timeline"
              label="Production / delivery timeline*"
              body={furniture.timeline}
            />
            <CopyPanel
              value="customization"
              label="Customization*"
              body={furniture.customization}
            />
          </Accordion>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <Card className="ring-border-default py-6">
          <CardHeader>
            <CardTitle className="text-text-primary font-sans text-xl font-semibold">
              Thumbnail
            </CardTitle>
            <div className="col-start-2 row-start-1 flex items-center gap-2 justify-self-end">
              <Button
                variant="outline"
                size="lg"
                asChild
                className="border-border-default h-9 text-sm"
              >
                <Link href={`/admin/furniture/${furniture.slug}/edit`}>Upload</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {furniture.thumbnail ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={furniture.thumbnail}
                alt={furniture.name}
                className="bg-surface-subtle aspect-3/4 w-24 rounded-md object-cover"
              />
            ) : (
              <p className="text-text-secondary text-sm">No thumbnail yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="ring-border-default py-6">
          <CardHeader>
            <CardTitle className="text-text-primary font-sans text-xl font-semibold">
              Media
            </CardTitle>
            <div className="col-start-2 row-start-1 justify-self-end">
              <Button
                variant="outline"
                size="lg"
                asChild
                className="border-border-default h-9 text-sm"
              >
                <Link href={`/admin/furniture/${furniture.slug}/edit`}>Edit media</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <p className="text-text-secondary text-sm">
              Imagery belongs to the variants — the storefront swaps the gallery
              to whichever combination a shopper picks. Each row&rsquo;s shots are
              in the Variants table.
            </p>
            {missingMedia.length ? (
              <p className="text-[#e11d48] text-sm">
                {`${missingMedia.length} ${missingMedia.length === 1 ? "variant has" : "variants have"} no images yet: `}
                {missingMedia.join(", ")}.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminFurnitureDetailPage;
