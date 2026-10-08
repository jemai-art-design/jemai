import { prisma } from "@/lib/prisma";
import { destroySiteImage } from "@/lib/cloudinary";
import type { SiteImage } from "@/lib/site-image-slots";

/**
 * The write side of the storefront's static photography. The reads — what a
 * location is drawing, with the shipped defaults laid under it — stay in
 * `lib/site-images`; what is here is the two things the manage screen does to a
 * location, and the media-library tidying each one owes.
 */

const readStored = async (slot: string): Promise<SiteImage[]> => {
  const row = await prisma.siteImageSlot.findUnique({
    where: { slot },
    select: { images: true },
  });
  return row?.images ?? [];
};

/**
 * Which keys were being drawn before this save and are not any more. Their
 * assets are the ones the save orphans: a key that survives has just been
 * written over in place, and one that is new has nothing behind it yet.
 */
const dropped = (before: SiteImage[], after: SiteImage[]) => {
  const kept = new Set(after.map((image) => image.key));
  return before
    .filter((image) => !kept.has(image.key))
    .map((image) => image.key);
};

/**
 * Saves what a location draws, then drops the assets it has stopped drawing.
 *
 * The row is written first and the media library tidied after, in that order:
 * the site drawing the right pictures is the thing that matters, and an asset
 * left behind because Cloudinary was unreachable is a tidy-up, not a failure.
 */
export const writeSiteImages = async (slot: string, images: SiteImage[]) => {
  const before = await readStored(slot);

  const row = await prisma.siteImageSlot.upsert({
    where: { slot },
    create: { slot, images },
    update: { images },
  });

  await Promise.all(
    dropped(before, images).map((key) => destroySiteImage(slot, key)),
  );

  return row;
};

/**
 * Puts a location back to the photography the site shipped with.
 *
 * The row is deleted rather than rewritten with the defaults: a location with
 * no row *is* a location drawing its defaults, so there is one representation
 * of that state rather than two that can disagree. Everything the studio had
 * uploaded here is dropped from the media library on the way out — it is no
 * longer reachable from the console, so leaving it would only grow the folder.
 */
export const resetSiteImages = async (slot: string) => {
  const before = await readStored(slot);

  const deleted = await prisma.siteImageSlot.deleteMany({ where: { slot } });
  if (!deleted.count) return false;

  await Promise.all(
    before.map((image) => destroySiteImage(slot, image.key)),
  );

  return true;
};
