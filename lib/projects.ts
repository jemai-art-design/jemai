import { cache } from "react";

import { prisma } from "@/lib/prisma";
import { toProjectMedia, type ProjectMedia } from "@/lib/project-media";
import type { ProjectKind } from "@/lib/project-kinds";

/** A project as the storefront draws it — no kind, no visibility, no ordering. */
export type Project = {
  slug: string;
  name: string;
  /** "Residential · Lagos", above the name on the card. */
  meta: string;
  /** The one line under the name. Most projects carry none. */
  summary: string;
  /** The paragraph the lightbox prints beside the media. */
  description: string;
  /**
   * First is the card; the rest are the lightbox's. Photographs, uploaded films
   * and embeds in one arranged order — see `lib/project-media`. Never empty
   * here.
   */
  media: ProjectMedia[];
};

/**
 * A stored list as the pages read it: every entry normalised, and anything
 * without a source dropped. A Json column cannot be trusted to hold only what
 * the form last wrote into it, and a card with no source is a dead tile.
 */
export const readProjectMedia = (stored: ProjectMedia[] | null) =>
  (stored ?? []).map(toProjectMedia).filter((media) => Boolean(media.src));

/**
 * One carousel's projects, in the order the console arranged them.
 *
 * A project with nothing attached is left out rather than drawn empty: the card
 * is its first entry, so there would be nothing to click. That is the shape a
 * half-written project is saved in, which is why this filters rather than
 * trusting every visible row to be complete.
 */
export const listActiveProjects = cache(async (kind: ProjectKind): Promise<Project[]> => {
  const records = await prisma.project.findMany({
    where: { kind, isActive: true },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    select: {
      slug: true,
      name: true,
      meta: true,
      summary: true,
      description: true,
      media: true,
    },
  });

  return records
    .map((record) => ({ ...record, media: readProjectMedia(record.media) }))
    .filter((project) => project.media.length > 0);
});
