import Image from "next/image";
import Link from "next/link";
import { RegisterButton } from "@/components/exhibitions/register-button";
import type { UpNext as UpNextExhibition } from "@/lib/exhibitions";

/**
 * The featured block on the upcoming index: a 512px copy column beside a 720px
 * `surface-tint` mat holding the work with 16px of clearance.
 *
 * **The block starts 40px right of the page gutter** (x=104 against a 64px
 * gutter) while closing flush on it, so the row is 104 → 1376. Reproduced as
 * an `lg:pl-10` on the block rather than a second measure.
 */
export const UpNext = ({ exhibition }: { exhibition: UpNextExhibition; }) => (
  <section className="w-full px-4 sm:px-6 lg:px-page-gutter">
    <div className="mx-auto w-full max-w-432 lg:pl-10">
      <div className="grid items-start gap-8 lg:grid-cols-[512fr_720fr] lg:gap-10">
        <div className="lg:pt-18.25">
          <p className="text-eyebrow-lg text-text-secondary uppercase">
            {exhibition.eyebrow}
          </p>
          <h2 className="font-heading text-text-primary mt-1.5 text-3xl font-bold sm:text-h2">
            {exhibition.title}
          </h2>
          <p className="text-body text-text-primary mt-3.25 max-w-lg">
            {exhibition.copy}
          </p>

          <dl className="mt-4.25">
            {exhibition.rows.map((row, index) => (
              <div
                key={row.label}
                className={`border-border-default flex gap-4 border-t py-3 ${index === exhibition.rows.length - 1 ? "border-b-0" : ""
                  }`}
              >
                <dt className="text-body text-text-secondary w-25.75 shrink-0">
                  {row.label}
                </dt>
                <dd className="text-body text-text-primary">{row.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-7.75 flex flex-wrap items-center gap-6">
            <RegisterButton
              exhibition={{
                slug: exhibition.slug,
                title: exhibition.title,
                artist: exhibition.artist,
                when: exhibition.opensOn,
                image: exhibition.image.src,
                ticket: exhibition.ticket,
              }}
            />
            <Link
              href={`/exhibitions/${exhibition.slug}`}
              className="text-body text-text-primary underline-offset-4 hover:underline"
            >
              View Exhibition
            </Link>
          </div>
        </div>

        {/* The frame's photograph is 688 × 516 inside a 16px mat. Uploaded
            photography arrives at any size, so the mat keeps the frame's box
            and the shot fills it. */}
        <div className="bg-surface-tint p-4">
          <div className="relative aspect-688/516 w-full">
            <Image
              src={exhibition.image.src}
              alt={exhibition.image.alt}
              fill
              priority
              sizes="(min-width: 1024px) 688px, 100vw"
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
);
