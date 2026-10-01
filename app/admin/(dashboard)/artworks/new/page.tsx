import { createArtworkAction } from "@/app/admin/(dashboard)/artworks/actions";
import { ArtworkForm } from "@/components/admin/artwork-form";
import { listArtists } from "@/lib/admin/artists";
import { getArtworkYears } from "@/lib/admin/artworks";
import { artworkMediumNames } from "@/lib/taxonomy";

/** Add new Artwork — the create half of the shared artwork form. */
const AdminArtworkNewPage = async () => (
  <ArtworkForm
    artists={await listArtists()}
    mediums={await artworkMediumNames()}
    years={getArtworkYears()}
    action={createArtworkAction}
    cancelHref="/admin/artworks"
    heading="Add new Artwork"
    submitLabel="Add artwork"
  />
);

export default AdminArtworkNewPage;
