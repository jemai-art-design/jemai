import Image from "next/image";
import Link from "next/link";
import { ArtworkEnquiry } from "@/components/artworks/artwork-enquiry";

type CuratorPickProps = {
  eyebrow: string;
  heading: string[];
  copy: string;
  cta: { label: string; };
  /** The piece the enquiry modal opens on — the pick itself. */
  artwork: { slug: string; title: string; artist: string; image: string; };
  secondaryCta: { label: string; href: string; };
  image: { src: string; alt: string; };
};

export const CuratorPick = ({
  eyebrow,
  heading,
  copy,
  cta,
  artwork,
  secondaryCta,
  image,
}: CuratorPickProps) => (
  <div className="w-full px-4 sm:px-6 lg:px-page-gutter">
    <div className="mx-auto w-full max-w-432">
      <div className="grid items-center gap-10 lg:grid-cols-[528fr_784fr] lg:gap-0">
        <div className="lg:pr-10 lg:pl-26">
          <p className="text-eyebrow text-text-secondary uppercase">
            {eyebrow}
          </p>
          <h2 className="font-heading text-text-primary mt-4.5 text-3xl leading-11.75 tracking-[0.02em] uppercase sm:text-[34px]">
            {heading.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
          <p className="text-body text-text-secondary mt-7.25 max-w-95.75">
            {copy}
          </p>
          <div className="mt-7.5 flex items-center gap-6">
            <ArtworkEnquiry
              artwork={artwork}
              label={cta.label}
              variant="default"
              className="h-12 w-auto px-8"
            />
            <Link
              href={secondaryCta.href}
              className="text-label text-action-link whitespace-nowrap"
            >
              {secondaryCta.label}
            </Link>
          </div>
        </div>

        {/* The track is wider than the photo: the frame runs it 592 → 1311 and
            leaves the remaining 65px of the measure empty on the right. */}
        <div className="relative aspect-720/537 w-full max-w-180">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 1024px) 720px, 100vw"
            className="object-contain"
          />
        </div>
      </div>

      <hr className="border-border-default mt-15.75 border-t" />
    </div>
  </div>
);
