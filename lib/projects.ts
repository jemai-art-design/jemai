import { cache } from "react";

import { prisma } from "@/lib/prisma";
import type { ProjectKind } from "@/lib/project-kinds";

/**
 * One photograph of a project. The alt text is authored alongside the upload
 * rather than derived, because a room is not described by its file name.
 */
export type ProjectImage = {
  src: string;
  alt: string;
};

/** A project as the storefront draws it — no kind, no visibility, no ordering. */
export type Project = {
  slug: string;
  name: string;
  /** "Residential · Lagos", above the name on the card. */
  meta: string;
  /** The one line under the name. Most projects carry none. */
  summary: string;
  /** The paragraph the lightbox prints beside the photographs. */
  description: string;
  /** First is the card's shot; the rest are the lightbox's. Never empty here. */
  images: ProjectImage[];
};

/**
 * One carousel's projects, in the order the console arranged them.
 *
 * A project with no photographs is left out rather than drawn empty: the card
 * is its first shot, so there would be nothing to click. That is the shape a
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
      images: true,
    },
  });

  return records
    .map((record) => ({ ...record, images: record.images ?? [] }))
    .filter((project) => project.images.length > 0);
});
