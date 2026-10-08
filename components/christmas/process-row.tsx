import { Eyebrow } from "@/components/site/eyebrow";
import { AssuranceRow, type Assurance } from "@/components/site/assurance-row";
import { Ornament } from "@/components/christmas/ornament";
import { siteImage } from "@/lib/site-images";

type Step = { title: string; copy: string };

type ProcessRowProps = {
  eyebrow: string;
  heading: string;
  steps: Step[];
};

/**
 * Section 03 — the assurance row with the campaign's numerals where the trio of
 * icons normally sits. The numeral fills its 48px icon box (`w-full`) so it
 * ranges left with the column rather than centring inside the box.
 */
export const ProcessRow = async ({ eyebrow, heading, steps }: ProcessRowProps) => {
  const baubles = await siteImage("christmas.baubles");

  const items: Assurance[] = steps.map((step, index) => ({
    icon: (
      <span className="font-heading text-action-primary text-h3 w-full font-normal leading-none">
        {String(index + 1).padStart(2, "0")}
      </span>
    ),
    title: step.title,
    copy: step.copy,
  }));

  return (
    <section className="border-border-strong relative w-full overflow-hidden border-t pt-14 pb-16 lg:pt-19 lg:pb-23.5">
      <div className="relative w-full px-4 sm:px-6 lg:px-20">
        <Ornament
          image={baubles}
          width={155}
          height={135}
          className="-top-6 right-4"
        />

        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="font-heading text-text-primary mt-2.5 max-w-200 text-3xl sm:text-h2">
          {heading}
        </h2>
      </div>

      <AssuranceRow
        items={items}
        className="border-0 px-4 pt-12 pb-0 sm:px-6 lg:pt-21.25"
      />
    </section>
  );
};
