import { notFound } from "next/navigation";

import { updateArtworkAction } from "@/app/admin/(dashboard)/artworks/actions";
import { ArtworkForm, type ArtworkFormValues } from "@/components/admin/artwork-form";
import { listArtists } from "@/lib/admin/artists";
import { getArtwork, getArtworkYears } from "@/lib/admin/artworks";
import { toContentAsset } from "@/lib/admin/content";
import { artworkMediumNames } from "@/lib/taxonomy";

/**
 * Edit — the same form, handed the artwork as defaults. The action is the update
 * one with the current slug bound to it, so a renamed work still resolves.
 */
const AdminArtworkEditPage = async ({ params }: PageProps<"/admin/artworks/[slug]/edit">) => {
  const { slug } = await params;
  const artwork = await getArtwork(slug);
  if (!artwork) notFound();

  const artists = await listArtists();
  // The work holds a name; the copy beside it belongs to the artist record that
  // name resolves to, so the form opens on what is actually held against them.
  const attributed = artists.find((artist) => artist.name === artwork.artist);

  const values: ArtworkFormValues = {
    title: artwork.title,
    slug: artwork.slug,
    artist: artwork.artist,
    artistBio: attributed?.bio ?? "",
    artistPortrait: attributed?.portrait ? [toContentAsset(attributed.portrait)] : [],
    medium: artwork.medium,
    year: artwork.year,
    dimensions: artwork.dimensions,
    summary: artwork.summary,
    story: artwork.story,
    curatorsPick: artwork.curatorsPick,
    thumbnail: artwork.thumbnail ? [toContentAsset(artwork.thumbnail)] : [],
    media: artwork.media.map(toContentAsset),
  };

  return (
    <ArtworkForm
      artwork={values}
      artists={artists}
      mediums={await artworkMediumNames()}
      years={getArtworkYears(artwork.year)}
      action={updateArtworkAction.bind(null, artwork.slug)}
      cancelHref={`/admin/artworks/${artwork.slug}`}
      heading={`Edit ${artwork.title}`}
      submitLabel="Save changes"
    />
  );
};

export default AdminArtworkEditPage;
