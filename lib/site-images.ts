import { cache } from "react";

import { prisma } from "@/lib/prisma";
import {
  findSiteImageSlot,
  siteImageSlots,
  type SiteImage,
  type SiteImageSlotMeta,
} from "@/lib/site-image-slots";

/**
 * The read side of the storefront's static photography: what a location is
 * actually drawing right now.
 *
 * Every caller goes through `siteImages` or `siteImage`, and both always answer
 * with something — a location with no override, or one whose override has
 * drifted from the composition, falls back to the picture the site shipped
 * with. There is deliberately no "missing image" state for a page to handle.
 *
 * One query serves a whole render: the table is a couple of dozen small rows,
 * and a page can draw half a dozen locations, so the whole of it is read once
 * and cached for the request rather than queried per location.
 */

const readOverrides = cache(async (): Promise<Map<string, SiteImage[]>> => {
  const rows = await prisma.siteImageSlot.findMany({
    select: { slot: true, images: true },
  });
  return new Map(rows.map((row) => [row.slot, row.images]));
});

/**
 * Lays an override over the composition.
 *
 * A fixed location is walked by the registry's keys rather than by the stored
 * order, so a mosaic keeps its four holes and the right picture stays in each
 * one even if the stored list is short, long or out of order — which is what it
 * will be the first time a hole is added to the design. An open carousel is the
 * stored order, since there it is the author's arrangement.
 */
export const resolveSiteImages = (
  meta: SiteImageSlotMeta,
  stored: SiteImage[] | undefined,
): SiteImage[] => {
  const overrides = new Map((stored ?? []).map((image) => [image.key, image]));

  if (meta.fixed || !meta.multiple)
    return meta.defaults.map((image) => overrides.get(image.key) ?? image);

  return stored?.length ? stored : meta.defaults;
};

/** Every picture a location draws, in draw order. Never empty. */
export const siteImages = async (slot: string): Promise<SiteImage[]> => {
  const meta = findSiteImageSlot(slot);
  // A typo in a slot name would otherwise reach the page as an empty carousel.
  if (!meta) throw new Error(`Unknown site image slot: ${slot}`);

  const overrides = await readOverrides();
  return resolveSiteImages(meta, overrides.get(slot));
};

/** The one picture a single location draws, or the first of a list. */
export const siteImage = async (slot: string): Promise<SiteImage> =>
  (await siteImages(slot))[0];

/** Just the source — what the catalogue fallbacks need. */
export const siteImageSrc = async (slot: string): Promise<string> =>
  (await siteImage(slot)).src;

/** Every location with its override, for the manage screen. */
export const listSiteImageSlots = async () => {
  const overrides = await readOverrides();

  return siteImageSlots.map((meta) => ({
    meta,
    images: resolveSiteImages(meta, overrides.get(meta.slot)),
    /** Whether anything has been put here in place of what shipped. */
    isCustom: overrides.has(meta.slot),
  }));
};

export type SiteImageSlotView = Awaited<ReturnType<typeof listSiteImageSlots>>[number];
