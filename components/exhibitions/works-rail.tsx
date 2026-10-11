import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { ExhibitionWork } from "@/lib/exhibitions";

/**
 * The four works the past-detail frame rails below its copy — 300px columns on
 * a 24px gutter, each image at its own natural height, so the row is
 * top-aligned and every caption and button sits directly under its own image.
 *
 * The rail runs its own 1272px measure (x 84 → 1356), 20px inside the page
 * gutter on both sides.
 */
export const WorksRail = ({ works }: { works: ExhibitionWork[]; }) => (
  <section
    aria-label="Works in this exhibition"
    className="w-full px-4 sm:px-6 lg:px-page-gutter"
  >
    <ul className="mx-auto grid w-full max-w-318 grid-cols-2 items-start gap-x-6 gap-y-10 lg:grid-cols-4">
      {works.map((work) => (
        <li key={work.src}>
          {/* The frame runs each work at its own natural height. Catalogue
              photography arrives at any size, so the columns share one 3:4 box
              and the row stays top-aligned. */}
          <div className="relative aspect-3/4 w-full">
            <Image
              src={work.src}
              alt={work.alt}
              fill
              sizes="(min-width: 1024px) 300px, 50vw"
              className="object-contain"
            />
          </div>
          <p className="text-body-sm text-text-primary mt-2.75">
            {work.title}, {work.year}
          </p>
          <Button asChild size="cta" className="mt-3.5 h-10.25 rounded-none border border-border-strong bg-transparent px-4 text-action-primary hover:bg-transparent">
            <Link href={work.href}>View Artwork</Link>
          </Button>
        </li>
      ))}
    </ul>
  </section>
);
