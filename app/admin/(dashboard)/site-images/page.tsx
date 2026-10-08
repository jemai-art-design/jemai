import { SiteImagesPanel } from "@/components/admin/site-images-panel";
import { listSiteImageSlots } from "@/lib/site-images";

/**
 * Site images — the storefront's static photography, which used to be files in
 * the repository and is now a location the studio can put a picture in.
 *
 * The locations are declared in `lib/site-image-slots`, one per place a
 * component draws a fixed picture, and grouped by the page that draws them.
 * What is read here is the override laid over each one, so a location nobody
 * has touched arrives showing the photograph the site shipped with rather than
 * an empty frame.
 */
const AdminSiteImagesPage = async () => {
  const slots = await listSiteImageSlots();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-text-primary text-2xl font-semibold">Site images</h1>
        <p className="text-text-secondary max-w-[70ch] text-sm">
          The photography that is part of the pages themselves rather than of a
          product, a work or a show &mdash; heroes, tile sets, mosaics and the
          plates that stand in before a record has its own pictures. Pick the
          page, then the location on it. Replacing a picture replaces the file
          behind it, so the media library holds one photograph per location
          rather than every one that has ever been in it.
        </p>
      </header>

      <SiteImagesPanel slots={slots} />
    </div>
  );
};

export default AdminSiteImagesPage;
