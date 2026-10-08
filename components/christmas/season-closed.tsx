import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Ornament } from "@/components/christmas/ornament";
import { objectFit } from "@/lib/site-image-slots";
import { siteImage } from "@/lib/site-images";

type SeasonClosedProps = {
  eyebrow: string;
  heading: string;
  copy: string;
  cta: { label: string; href: string };
  footnote: string;
};

/**
 * Section 04 once the allocation is spent — the request form's band with the
 * form itself replaced by a single way onward. It keeps the garland strip, the
 * 800px measure and the full-width button, so the two states read as one page.
 */
export const SeasonClosed = async ({
  eyebrow,
  heading,
  copy,
  cta,
  footnote,
}: SeasonClosedProps) => {
  const [garland, reindeer] = await Promise.all([
    siteImage("christmas.garland"),
    siteImage("christmas.reindeer"),
  ]);

  return (
    <section className="bg-surface-subtle relative w-full overflow-hidden px-4 pb-20 sm:px-6 lg:pb-31.5">
      <Image
        src={garland.src}
        alt=""
        aria-hidden
        width={1440}
        height={254}
        unoptimized
        className={`pointer-events-none absolute top-0 left-1/2 w-full min-w-180 -translate-x-1/2 select-none ${objectFit(garland.fit)}`}
      />

      <Ornament
        image={reindeer}
        width={140}
        height={167}
        className="right-0 bottom-0"
      />

      <div className="relative mx-auto w-full max-w-200 pt-40 text-center sm:pt-60 lg:pt-85.25">
        <p className="text-eyebrow-lg text-text-secondary uppercase">{eyebrow}</p>

        <h2 className="font-heading text-text-primary mt-4 text-3xl leading-snug sm:text-4xl lg:text-5xl lg:leading-none">
          {heading}
        </h2>

        <p className="text-body text-text-secondary mt-4.5">{copy}</p>

        <Button
          asChild
          variant="jemai"
          size="cta"
          className="mt-14.5 h-12.25 w-full"
        >
          <Link href={cta.href}>{cta.label}</Link>
        </Button>

        <p className="text-body-xs text-text-secondary mx-auto mt-7 max-w-160">
          {footnote}
        </p>
      </div>
    </section>
  );
};
