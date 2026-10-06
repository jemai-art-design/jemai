import type { Metadata } from "next";
import { ArtworksHero } from "@/components/artworks/artworks-hero";
import { ArtworkGrid } from "@/components/artworks/artwork-grid";
import { CuratorPick } from "@/components/artworks/curator-pick";
import { ExhibitionCta } from "@/components/artworks/exhibition-cta";
import { ArtworkFilter } from "@/components/artworks/artwork-filter";
import { curatedArtworks, listArtworkMediums, listArtworks } from "@/lib/artworks";
import { getUpNext } from "@/lib/exhibitions";

export const metadata: Metadata = {
  title: "Artworks | JEMAI",
  description:
    "Explore a curated collection of contemporary works chosen for their material, emotion and ability to bring a distinct point of view into the spaces around them.",
};

const ArtworksPage = async ({ searchParams }: PageProps<"/artworks">) => {
  const { medium: raw } = await searchParams;
  const requested = typeof raw === "string" ? raw : undefined;

  const mediums = await listArtworkMediums();
  const medium = requested && mediums.includes(requested) ? requested : undefined;

  const [artworks, [pick], upNext] = await Promise.all([
    listArtworks(medium),
    curatedArtworks(1),
    getUpNext(),
  ]);

  return (
    <div className="flex w-full flex-col gap-16 pt-16">
      <ArtworksHero
        eyebrow="JEMAI Art"
        heading={["Works With A Presence", "Of Their Own."]}
        copy="Explore a curated collection of contemporary works chosen for their material, emotion and ability to bring a distinct point of view into the spaces around them."
      />

      {pick ? (
        <CuratorPick
          eyebrow="Curator’s Pick"
          heading={[pick.title]}
          copy={pick.summary}
          cta={{ label: "Enquire" }}
          artwork={{
            slug: pick.slug,
            title: pick.title,
            artist: pick.artist,
            image: pick.src,
          }}
          secondaryCta={{ label: "View Artwork", href: `/artworks/${pick.slug}` }}
          image={{ src: pick.src, alt: pick.title }}
        />
      ) : null}

      <ArtworkFilter mediums={mediums} active={medium} total={artworks.length} />

      <ArtworkGrid artworks={artworks} />

      {upNext ? <ExhibitionCta exhibition={upNext} /> : null}
    </div>
  );
};

export default ArtworksPage;
