import Image from "next/image";
import { objectFit, type SiteImage } from "@/lib/site-image-slots";

type FounderNoteProps = {
  heading: string;
  paragraphs: string[];
  closing: string;
  signature: string;
  photograph: SiteImage;
};

/**
 * "A Note From Our Founder" — the one full-bleed band on this page, running the
 * whole 1440 rather than sitting inside the page gutter like everything above
 * and below it. Measured off `design-reference/1.png`:
 *
 * - The scrim panel is x 64 → 742 (678 wide), top y=64, flush to the bottom of
 *   the 565px band. Its fill is **`surface-inverse` at 87%**: un-scrimming the
 *   region with those two values recovers the photograph underneath cleanly,
 *   which is what fixes both the colour and the alpha.
 * - 48px of padding all round, so the copy measure is 582px. Ink starts at
 *   x=112/113 against a panel edge of 64, and the longest line ends at 690
 *   against a content edge of 694.
 * - Type, pinned by matching ink extents: the heading is `text-h2` — Classico
 *   **Bold** at 40 measures 418.3 against the frame's 418, where Regular
 *   measures 452. Body copy is `text-body`; its two longest lines measure
 *   573/542 against 572/540, and the 24px line pitch reads straight off the
 *   bands. The signature is `text-label` (15px semibold, 107.4 against 108).
 * - Copy is `text-inverse`; the peak un-antialiased pixel is 247,245,243 =
 *   #f7f5f3. The signature is the same ink at ~72% — solving its 182,177,177
 *   peak against the panel gives 0.716 / 0.717 / 0.723 across the channels,
 *   which is consistent enough to be real transparency rather than a second
 *   colour.
 * - Paragraph gaps are 12px; the signature sits 44px below "With warmth,".
 *
 * **The photograph was a stand-in.** The frame's own image is only available
 * inside the export with the scrim *and the baked text* over it, and the text
 * crosses a brightly lit painting, so it could not be recovered without leaving
 * a smear. It is the `about.founder` site-image location now, so the real one
 * goes in through the console rather than through a commit.
 */
export const FounderNote = ({
  heading,
  paragraphs,
  closing,
  signature,
  photograph,
}: FounderNoteProps) => (
  <section className="relative w-full overflow-hidden lg:h-141.25">
    <Image
      src={photograph.src}
      alt={photograph.alt}
      fill
      sizes="100vw"
      className={objectFit(photograph.fit)}
    />

    <div className="bg-surface-inverse/87 relative mt-40 flex flex-col gap-3 px-4 py-10 sm:mt-56 sm:px-6 lg:absolute lg:top-16 lg:bottom-0 lg:left-page-gutter lg:mt-0 lg:w-169.5 lg:p-12">
      <h2 className="font-heading text-text-inverse text-3xl font-bold sm:text-h2">
        {heading}
      </h2>
      {paragraphs.map((paragraph) => (
        <p key={paragraph.slice(0, 32)} className="text-body text-text-inverse">
          {paragraph}
        </p>
      ))}
      <p className="text-body text-text-inverse">{closing}</p>
      <p className="text-label text-text-inverse/70 mt-8">{signature}</p>
    </div>
  </section>
);
