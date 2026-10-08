import { Eyebrow } from "@/components/site/eyebrow";
import { PhotoRail } from "@/components/site/photo-rail";
import { decorationAreas } from "@/lib/christmas";
import { siteImages } from "@/lib/site-images";

type FestiveRailProps = {
  eyebrow: string;
  /** One line per element — the frame breaks the heading by hand. */
  heading: string[];
  copy: string;
};

/**
 * Section 02 — the same snap rail the home page's intro slideshow uses, on the
 * frame's captioned 330 × 331 slide with a 28px gutter.
 *
 * The rail runs off the right edge rather than sitting inside the page gutter:
 * that overhang is the affordance, which is why the frame draws no dash picker
 * under it and closes the section on a short rule instead.
 */
export const FestiveRail = async ({ eyebrow, heading, copy }: FestiveRailProps) => {
  /* One picture per area, in the same order — the location is fixed, so the
     console cannot hand back a list of another length. */
  const photographs = await siteImages("christmas.spaces");

  return (
    <section className="border-border-strong w-full overflow-hidden border-t pt-14 pb-16 lg:pt-19 lg:pb-22.5">
      <div className="px-4 sm:px-6 lg:px-page-gutter">
        <div className="mx-auto grid w-full max-w-432 gap-6 lg:grid-cols-[720fr_556fr] lg:gap-5 lg:px-4">
          <div>
            <Eyebrow>{eyebrow}</Eyebrow>
            <h2 className="font-heading text-text-primary mt-2.5 text-3xl sm:text-h2">
              {heading.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>
          </div>
          <p className="text-body text-text-secondary lg:pt-6.25">{copy}</p>
        </div>
      </div>

      <div className="mt-10 pl-4 sm:pl-6 lg:mt-18.5 lg:pl-page-gutter">
        <PhotoRail
          label="Festive settings"
          picker={false}
          gapClassName="gap-7"
          slideClassName="w-[70%] sm:w-82.5"
          mediaClassName="h-60 lg:h-82.75"
          photos={decorationAreas.map((area, index) => ({
            src: photographs[index].src,
            alt: photographs[index].alt || area.name,
            fit: photographs[index].fit,
            title: area.name,
            caption: area.caption,
          }))}
        />
      </div>

      <div className="mt-10 px-4 sm:px-6 lg:mt-14.25 lg:px-page-gutter">
        <div className="border-border-default w-full max-w-238 border-t" />
      </div>
    </section>
  );
};
