import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { objectFit } from "@/lib/site-image-slots";
import { siteImage } from "@/lib/site-images";

type ChristmasHeroProps = {
  eyebrow: string;
  heading: string;
  copy: string;
  /** Absent once the season is closed — the frame drops the button entirely. */
  cta?: { label: string; href: string };
};

/**
 * The opening 1440 × 501 band. The photograph carries its own scrim in the
 * export, so nothing is layered over it here; the copy block is centred on both
 * axes and holds the frame's 48px Classico line.
 *
 * `min-h` is a derived-responsive call, as on the other heroes: 1440/501 leaves
 * the band 136px tall at 390, and the frame carries no mobile layout.
 */
export const ChristmasHero = async ({
  eyebrow,
  heading,
  copy,
  cta,
}: ChristmasHeroProps) => {
  const photograph = await siteImage("christmas.hero");

  return (
    <section className="relative isolate flex aspect-1440/501 min-h-112.5 w-full items-center justify-center overflow-hidden">
      <Image
        src={photograph.src}
        alt={photograph.alt}
        fill
        priority
        sizes="100vw"
        className={`-z-10 ${objectFit(photograph.fit)}`}
      />

      <div className="flex w-full max-w-240 flex-col items-center px-4 text-center sm:px-6">
        <p className="text-eyebrow-lg text-text-inverse/85 uppercase">
          {eyebrow}
        </p>

        <h1 className="font-heading text-text-inverse mt-5.5 text-3xl leading-snug sm:text-4xl lg:text-5xl lg:leading-none">
          {heading}
        </h1>

        <p className="text-body text-text-inverse/85 mt-4 max-w-172.5 lg:text-body-lg">
          {copy}
        </p>

        {cta && (
          <Button
            asChild
            variant="quiet"
            size="cta"
            className="border-border-inverse text-text-inverse hover:bg-text-inverse hover:text-text-primary mt-7 h-12.5 w-full max-w-97.5 border"
          >
            <Link href={cta.href}>{cta.label}</Link>
          </Button>
        )}
      </div>
    </section>
  );
};
