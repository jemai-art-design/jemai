import Image from "next/image";
import { SectionIntro } from "@/components/site/section-intro";
import {
  CuratorCarousel,
  type CuratorPick,
} from "@/components/site/curator-carousel";
import { curatedArtworks } from "@/lib/artworks";
import type { CuratedArtwork } from "@/lib/gallery";
import { objectFit } from "@/lib/site-image-slots";
import { siteImage } from "@/lib/site-images";

const toPick = (artwork: CuratedArtwork): CuratorPick => ({
  title: artwork.title,
  copy: artwork.summary,
  href: `/artworks/${artwork.slug}`,
  image: { src: artwork.src, alt: artwork.title },
  medium: artwork.medium,
  dimensions: artwork.dimensions,
});

export const ArtworksSection = async () => {
  const [picks, backdrop] = await Promise.all([
    curatedArtworks(3).then((artworks) => artworks.map(toPick)),
    siteImage("home.art-backdrop"),
  ]);

  return (
    <section className="flex w-full flex-col items-center">
      <div className="flex w-full max-w-432 flex-col gap-stack-loose px-4 sm:px-6 lg:px-page-gutter">
        <hr className="border-border-strong w-full border-t-3" />
        <div className="flex w-full flex-col items-center py-8">
          <SectionIntro
            className="max-w-270"
            eyebrow="03 / JEMAI Art"
            heading="Art That Changes the Feeling of a Space"
            copy="Explore contemporary works selected for their material, emotion and ability to bring a distinct point of view into the spaces around them."
            cta={{ label: "Explore Artworks", href: "/artworks" }}
          />
        </div>
      </div>

      {/* Curator's pick — copy panel over a gallery photograph, with the framed work alongside */}
      <div className="relative w-full bg-white">
        <div className="relative flex min-h-130 w-full flex-col justify-center px-4 sm:px-6 lg:h-155.25 lg:px-page-gutter">
          <Image
            src={backdrop.src}
            alt={backdrop.alt}
            fill
            sizes="100vw"
            className={objectFit(backdrop.fit)}
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-linear-to-b from-[rgba(121,121,121,0.1)] to-[rgba(19,19,19,0.5)]"
          />

          {picks.length ? <CuratorCarousel picks={picks} /> : null}
        </div>
      </div>
    </section>
  );
};
