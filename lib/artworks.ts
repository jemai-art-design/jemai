import { prisma } from "@/lib/prisma";
import type { Artwork, ArtworkDetail, CuratedArtwork } from "@/lib/gallery";
import type { Prisma } from "@/lib/generated/prisma/client";
import { siteImageSrc } from "@/lib/site-images";
import { artworkMediumNames } from "@/lib/taxonomy";

/** Every read pulls the artist the work is attributed to. */
const withArtist = { artist: { select: { name: true } } } satisfies Prisma.ArtworkInclude;

type ArtworkRecord = Prisma.ArtworkGetPayload<{ include: typeof withArtist; }>;

/**
 * Stands in for a work whose photography has not been uploaded yet. A site
 * image rather than a constant: it is seen on the grid, on the Curator's Pick
 * and on the work's own page, so the plate is the studio's to choose.
 */
const placeholder = () => siteImageSrc("shared.artwork-placeholder");

/** Thumbnail first, then the gallery in its authored order, de-duplicated. */
const images = (plate: string, record: ArtworkRecord) => {
  const sources = [
    ...new Set([...(record.thumbnail ? [record.thumbnail] : []), ...record.gallery]),
  ];
  return sources.length ? sources : [plate];
};

/** The caption run: medium and dimensions, whichever of the two is filled in. */
const caption = (record: ArtworkRecord) =>
  [record.medium, record.dimensions].filter(Boolean).join(" · ");

const toArtwork = (plate: string, record: ArtworkRecord): Artwork => ({
  slug: record.slug,
  title: record.title,
  medium: caption(record),
  src: images(plate, record)[0],
});

/**
 * The header's Art menu, in the order the console arranges the mediums in, and
 * narrowed to the ones the gallery actually holds work under — a medium opened
 * ahead of the works that will fill it stays out of the storefront until one
 * arrives.
 */
export const listArtworkMediums = async (): Promise<string[]> => {
  const [names, rows] = await Promise.all([
    artworkMediumNames(),
    prisma.artwork.findMany({ distinct: ["medium"], select: { medium: true } }),
  ]);

  const exhibited = new Set(rows.map((row) => row.medium).filter(Boolean));
  return names.filter((name) => exhibited.has(name));
};

export const listArtworks = async (medium?: string): Promise<Artwork[]> => {
  const [records, plate] = await Promise.all([
    prisma.artwork.findMany({
      where: medium ? { medium } : undefined,
      include: withArtist,
      orderBy: { createdAt: "desc" },
    }),
    placeholder(),
  ]);
  return records.map(toArtwork.bind(null, plate));
};

export const curatedArtworks = async (
  limit = 3,
  medium?: string,
): Promise<CuratedArtwork[]> => {
  const [records, plate] = await Promise.all([
    prisma.artwork.findMany({
      where: medium ? { medium, curatorsPick: true } : undefined,
      include: withArtist,
      orderBy: [{ curatorsPick: "desc" }, { createdAt: "desc" }],
      take: limit,
    }),
    placeholder(),
  ]);

  return records.map((record) => ({
    slug: record.slug,
    title: record.title,
    artist: record.artist?.name ?? "",
    summary: record.summary,
    medium: record.medium,
    dimensions: record.dimensions,
    src: images(plate, record)[0],
  }));
};

export const getArtworkDetail = async (slug: string): Promise<ArtworkDetail | null> => {
  const [record, plate] = await Promise.all([
    prisma.artwork.findUnique({ where: { slug }, include: withArtist }),
    placeholder(),
  ]);
  if (!record) return null;

  const [hero, ...rest] = images(plate, record);

  return {
    slug: record.slug,
    title: record.title,
    medium: caption(record),
    src: hero,
    artist: record.artist?.name ?? "",
    lead: record.summary,
    story: record.story,
    hero,
    gallery: rest.slice(0, 6).map((src, index) => ({
      src,
      alt: `${record.title} — view ${index + 2}`,
    })),
  };
};
