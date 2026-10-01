import { upsertArtistByName } from "@/lib/admin/artists";
import { sanitizeRichText, slugify, uniqueSlug } from "@/lib/admin/content";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";

/**
 * A gallery record. Deliberately without a price or any purchase field: the
 * storefront never sells artwork, it takes enquiries, and the index copy says
 * so out loud ("never display price or purchase actions"). Adding one here is
 * how that promise would quietly get broken.
 */
export type Artwork = {
  id: string;
  slug: string;
  title: string;
  artist: string;
  medium: string;
  /** Four-digit year, as a string — it comes off a select, never arithmetic. */
  year: string;
  /** Free text, e.g. "180 × 240 cm". */
  dimensions: string;
  summary: string;
  /** Authored HTML from the story editor, sanitised on the way in. */
  story: string;
  curatorsPick: boolean;
  /** Source of the single thumbnail shot, or null before one is uploaded. */
  thumbnail: string | null;
  /** Gallery sources, in the order the detail frame's grid draws them. */
  media: string[];
  /** ISO string; the index sorts on it and renders it as "15 May 2020 9:00 pm". */
  updatedAt: string;
};

/**
 * The year select's options, newest first, so a work made this year is the top
 * of the list. Called per request rather than captured once at module load, so a
 * long-running server rolls over to the new year on its own. Pass a work's own
 * `year` and it is folded in even when it predates the 30-year window.
 */
export const getArtworkYears = (include?: string): string[] => {
  const years = Array.from({ length: 30 }, (_, i) =>
    String(new Date().getUTCFullYear() - i)
  );
  if (include && !years.includes(include)) years.push(include);
  return years;
};

/** Every read pulls the artist the work is attributed to. */
const withArtist = { artist: { select: { name: true } } } satisfies Prisma.ArtworkInclude;

type ArtworkRecord = Prisma.ArtworkGetPayload<{ include: typeof withArtist; }>;

/** The row as the console's one artwork shape. */
const toArtwork = (record: ArtworkRecord): Artwork => ({
  id: record.id,
  slug: record.slug,
  title: record.title,
  artist: record.artist?.name ?? "",
  medium: record.medium,
  year: record.year,
  dimensions: record.dimensions,
  summary: record.summary,
  story: record.story,
  curatorsPick: record.curatorsPick,
  thumbnail: record.thumbnail,
  media: record.gallery,
  updatedAt: record.updatedAt.toISOString(),
});

export type ArtworkQuery = { search?: string; medium?: string; };

/**
 * Newest first — the order the index draws — narrowed by whatever the index's
 * search box and medium filter are set to. The narrowing runs here rather than
 * over rows already sent, so the catalogue does not have to arrive in full for
 * the reader to look at one artist.
 */
export const listArtworks = async ({ search, medium }: ArtworkQuery = {}) => {
  const records = await prisma.artwork.findMany({
    where: {
      ...(medium ? { medium } : {}),
      // The artist is a record now, so searching for one searches their name
      // through the relation rather than a column on the work.
      ...(search
        ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { artist: { name: { contains: search, mode: "insensitive" as const } } },
          ],
        }
        : {}),
    },
    include: withArtist,
    orderBy: { updatedAt: "desc" },
  });
  return records.map(toArtwork);
};

/** The overview's counter. A count query, not a fetch of the whole catalogue. */
export const countArtworks = () => prisma.artwork.count();

export const getArtwork = async (slug: string) => {
  const record = await prisma.artwork.findUnique({
    where: { slug },
    include: withArtist,
  });
  return record ? toArtwork(record) : null;
};

export type ArtworkInput = Omit<Artwork, "id" | "slug" | "updatedAt"> & {
  slug: string;
  /**
   * The artist's own copy, authored on the work's form beside their name. It is
   * written onto the artist rather than onto the work — the same biography the
   * exhibition form edits.
   */
  artistBio: string;
  artistPortrait: string | null;
};

/**
 * A slug no other work holds, suffixed `-2`, `-3`, … if one does. Only the
 * candidate's own family is fetched rather than the whole catalogue, and
 * `ignore` is the record's current slug so re-saving it unchanged does not push
 * it to `-2`.
 */
const availableSlug = async (candidate: string, title: string, ignore?: string) => {
  const base = slugify(candidate || title) || "artwork";
  const taken = await prisma.artwork.findMany({
    where: { slug: { startsWith: base } },
    select: { slug: true },
  });
  return uniqueSlug(
    taken.map((row) => row.slug),
    base,
    "artwork",
    ignore,
  );
};

/**
 * The artist a work is attributed to, created the first time the name is used.
 * The form asks for a name and, once one is settled, the biography and portrait
 * held against them — so this is where the two meet. Blanks are left alone by
 * the upsert, which is what stops a work saved without that copy from wiping
 * what was written elsewhere.
 */
const artistLink = async (input: ArtworkInput) => {
  const artist = await upsertArtistByName({
    name: input.artist,
    bio: input.artistBio,
    portrait: input.artistPortrait,
  });
  return artist ? { connect: { id: artist.id } } : { disconnect: true };
};

/**
 * The columns both writes set. The story is sanitised here rather than in the
 * action, so every write goes through the same filter whatever calls it.
 */
const columns = (input: ArtworkInput) => ({
  title: input.title,
  medium: input.medium,
  year: input.year,
  dimensions: input.dimensions,
  summary: input.summary,
  story: sanitizeRichText(input.story),
  curatorsPick: input.curatorsPick,
  thumbnail: input.thumbnail,
  gallery: input.media,
});

export const createArtwork = async (input: ArtworkInput) => {
  const record = await prisma.artwork.create({
    data: {
      slug: await availableSlug(input.slug, input.title),
      ...columns(input),
      artist: await artistLink(input),
    },
    include: withArtist,
  });
  return toArtwork(record);
};

export const updateArtwork = async (slug: string, input: ArtworkInput) => {
  const existing = await prisma.artwork.findUnique({ where: { slug }, select: { id: true } });
  if (!existing) return null;

  const record = await prisma.artwork.update({
    where: { id: existing.id },
    data: {
      slug: await availableSlug(input.slug, input.title, slug),
      ...columns(input),
      artist: await artistLink(input),
    },
    include: withArtist,
  });
  return toArtwork(record);
};

export const deleteArtwork = async (slug: string) => {
  const { count } = await prisma.artwork.deleteMany({ where: { slug } });
  return count > 0;
};
