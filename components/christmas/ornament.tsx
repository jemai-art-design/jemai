import Image from "next/image";
import { objectFit, type SiteImage } from "@/lib/site-image-slots";
import { cn } from "@/lib/utils";

type OrnamentProps = {
  image: SiteImage;
  width: number;
  height: number;
  /** Absolute placement against the nearest positioned ancestor. */
  className?: string;
};

/**
 * A decorative festive cut-out — the hanging wreath, the pair of baubles, the
 * reindeer. Every one of them is presentational, so each is `aria-hidden` with
 * an empty alt and sits outside the flow; none of them may take a hit area from
 * the control underneath.
 *
 * They are hidden below `lg`. The Figma file draws desktop frames only, and at
 * phone widths these cut-outs would land on top of the copy rather than beside
 * it.
 *
 * The box is the frame's, so a cut-out the studio has replaced with a picture
 * of another shape would be stretched into it — which is why the fit the
 * console holds is applied here and why these locations default to "contain".
 */
export const Ornament = ({ image, width, height, className }: OrnamentProps) => (
  <Image
    src={image.src}
    alt=""
    aria-hidden
    width={width}
    height={height}
    unoptimized
    className={cn(
      "pointer-events-none absolute hidden select-none lg:block",
      objectFit(image.fit),
      className,
    )}
  />
);
