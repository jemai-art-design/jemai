import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { objectFit, type SiteImage } from "@/lib/site-image-slots";

export type Capacity = {
  /** Slots still open. Zero is what closes the season across the page. */
  available: number;
  total: number;
};

type CapacityCardProps = {
  capacity: Capacity;
  copy: string;
  cta: { label: string; href: string };
  /** The gift-wrap ground. Only its border is seen, behind the inset panel. */
  plate: SiteImage;
};

/**
 * The framed capacity panel: a 548 × 605 gift-wrap plate with the count on a
 * 40px-inset page-ground panel. The plate is decoration, so it carries an empty
 * alt and the count is read from the text.
 */
export const CapacityCard = ({ capacity, copy, cta, plate }: CapacityCardProps) => {
  const open = capacity.available > 0;

  return (
    /* The panel sits in the flow and the plate fills behind it, so the card is
       as tall as its own copy. Pinning the frame's 548 x 605 instead would clip
       the panel wherever the count or the copy runs longer than the export. */
    <div className="relative w-full max-w-137 lg:min-h-151.25">
      <Image
        src={plate.src}
        alt=""
        aria-hidden
        fill
        sizes="(min-width: 1024px) 548px, 100vw"
        className={objectFit(plate.fit)}
      />

      <div className="bg-surface-page relative m-7 flex flex-col items-center px-6 pt-8 pb-8 text-center sm:m-10 sm:px-12 lg:pt-15.25 lg:pb-14.75">
        <p className="text-eyebrow-lg text-text-primary uppercase">
          Limited seasonal capacity
        </p>

        <p className="text-text-primary mt-6 text-6xl leading-[0.9] lg:mt-10.5 lg:text-[88px]">
          {capacity.available}
        </p>

        <p className="text-body-lg text-text-primary mt-3 lg:mt-0">
          {open
            ? `of ${capacity.total} consultation slots available`
            : "consultation spaces remaining"}
        </p>

        <p className="text-body-lg text-text-secondary mt-6 lg:mt-8.25">
          {copy}
        </p>

        <Button
          asChild
          variant="jemai"
          size="cta"
          className="mt-8 h-12 w-full max-w-50 lg:mt-8.75 lg:h-15.25"
        >
          <Link href={cta.href}>{cta.label}</Link>
        </Button>
      </div>
    </div>
  );
};
