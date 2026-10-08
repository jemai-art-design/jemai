import { Eyebrow } from "@/components/site/eyebrow";
import {
  CapacityCard,
  type Capacity,
} from "@/components/christmas/capacity-card";
import { Ornament } from "@/components/christmas/ornament";
import { siteImage } from "@/lib/site-images";

type SeasonIntroProps = {
  eyebrow: string;
  /** One line per element — the frame breaks the display heading by hand. */
  heading: string[];
  paragraphs: string[];
  capacity: Capacity;
  cardCopy: string;
  cardCta: { label: string; href: string };
};

/**
 * Section 01 — the editorial column beside the capacity plate, on the frame's
 * 1080px measure: a 466px column, a 67px gutter and the 548px card, both halves
 * centred against each other.
 */
export const SeasonIntro = async ({
  eyebrow,
  heading,
  paragraphs,
  capacity,
  cardCopy,
  cardCta,
}: SeasonIntroProps) => {
  const [wreath, plate] = await Promise.all([
    siteImage("christmas.wreath"),
    siteImage("christmas.capacity-frame"),
  ]);

  return (
    <section className="w-full overflow-hidden px-4 py-16 sm:px-6 lg:px-page-gutter lg:py-0">
      <div className="relative mx-auto flex w-full max-w-270 flex-col items-center gap-10 lg:min-h-188 lg:flex-row lg:gap-16.75">
        <Ornament
          image={wreath}
          width={180}
          height={126}
          className="top-0 -right-45"
        />

        <div className="flex w-full flex-col lg:max-w-116.5 lg:flex-1">
          <Eyebrow>{eyebrow}</Eyebrow>

          <h2 className="font-heading text-text-primary mt-2.5 text-4xl sm:text-5xl lg:text-display">
            {heading.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>

          {paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-body text-text-secondary mt-3">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="flex w-full justify-center lg:w-137 lg:shrink-0">
          <CapacityCard
            capacity={capacity}
            copy={cardCopy}
            cta={cardCta}
            plate={plate}
          />
        </div>
      </div>
    </section>
  );
};
