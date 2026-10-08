import {
  formatDateShort,
  formatDateSpan,
  naira,
} from "@/lib/admin/content";
import {
  exhibitionStatus,
  isArchived,
  startOfToday,
  toDateField,
} from "@/lib/admin/exhibitions";
import { prisma } from "@/lib/prisma";
import { siteImages, siteImageSrc } from "@/lib/site-images";
import type { Prisma } from "@/lib/generated/prisma/client";

export type ExhibitionStatus = "upcoming" | "past";

/** A photograph and the line a screen reader gets for it. */
export type Shot = { src: string; alt: string; };

/** One work in the past-detail rail. */
export type ExhibitionWork = Shot & { title: string; year: string; href: string; };

/** One exhibition as either index draws it, in its card. */
export type ExhibitionSummary = {
  slug: string;
  title: string;
  /** The card's second line: the artist for upcoming, the run for past. */
  cardMeta: string;
  card: Shot;
  href: string;
};

export type Exhibition = {
  slug: string;
  title: string;
  artist: string;
  status: ExhibitionStatus;
  dates: string;
  hero: string;
  lead: string;
  body: string[];
  ticket?: { label: string; price: string; };
};

export type ArtistNote = {
  name: string;
  portrait: Shot | null;
  paragraphs: string[];
};

export type ExhibitionDetail = Exhibition & {
  /** The opening date on its own, which the register modal draws. */
  opensOn: string;
  /** Installation views — the past frame's rail. */
  installShots: Shot[];
  /** The linked catalogue works, in the order the console arranged them. */
  works: ExhibitionWork[];
  /** Only the artists with something to say; empty draws no block at all. */
  artistNotes: ArtistNote[];
};

export type UpNext = Pick<Exhibition, "slug" | "title" | "artist" | "ticket"> & {
  eyebrow: string;
  copy: string;
  image: Shot;
  venue: string;
  dates: string;
  rows: { label: string; value: string; }[];
  opensOn: string;
};

/**
 * Stands in for a show whose photography has not been uploaded yet.
 *
 * A site image rather than a constant: the plate is seen on the indexes, on a
 * show's own page and against the works listed on it, so which photograph it is
 * belongs to the studio. Read once per request, since four of the reads below
 * want it.
 */
const placeholderHero = () => siteImageSrc("exhibitions.fallback-hero");

/** Where a show runs when the console left the field empty. */
const DEFAULT_VENUE = "JEMAI Gallery, Lagos";

/**
 * The slides behind the two index heroes. No exhibition owns the band — it is
 * the gallery's own photography, so it is a site image location rather than
 * programme data, and it does not change as the programme does.
 */
export const upcomingHero = () => siteImages("exhibitions.upcoming-hero");

const HIGHLIGHT_STILLS: Shot[] = [
  { src: "/figma/home/ex-slide-1.jpg", alt: "Visitor viewing a painted figure study" },
  { src: "/figma/home/ex-slide-2.jpg", alt: "A guest studying a portrait in the gallery" },
  { src: "/figma/home/ex-slide-3.jpg", alt: "Bronze figures on a plinth" },
  { src: "/figma/home/ex-slide-4.jpg", alt: "Painted works hung salon style" },
];

export const highlightShots = async (limit = 8): Promise<Shot[]> => {
  const records = await prisma.exhibition.findMany({
    where: { NOT: { gallery: { isEmpty: true } } },
    orderBy: { startDate: "desc" },
    select: { name: true, gallery: true },
    take: limit,
  });

  const shots: Shot[] = [];
  const seen = new Set<string>();
  const deepest = Math.max(0, ...records.map((record) => record.gallery.length));

  for (let view = 0; view < deepest; view += 1) {
    for (const record of records) {
      const src = record.gallery[view];
      if (!src || seen.has(src)) continue;
      seen.add(src);
      shots.push({ src, alt: `${record.name} — installation view ${view + 1}` });
    }
  }

  const filler = HIGHLIGHT_STILLS.filter((shot) => !seen.has(shot.src));

  return [...shots, ...filler].slice(0, limit);
};

export const pastHero = () => siteImages("exhibitions.past-hero");

/** The console stores the long copy as plain text; blank lines are paragraphs. */
const paragraphs = (copy: string) =>
  copy
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

/** The two trees the storefront draws, out of the three states a run has. */
const status = (start: Date, end: Date): ExhibitionStatus =>
  isArchived(exhibitionStatus(start, end)) ? "past" : "upcoming";

/**
 * Still to end — everything the upcoming index lists, running shows included —
 * and its opposite, the archive.
 *
 * Both are functions, not constants: a module stays loaded for as long as the
 * server runs, so a boundary computed once at import would still be yesterday's
 * midnight tomorrow, and a show that ended overnight would never move.
 */
const live = () => ({ endDate: { gte: startOfToday() } });

const ended = () => ({ endDate: { lt: startOfToday() } });

/** Where a show's own pages live, which its status decides. */
export const exhibitionHref = (slug: string, state: ExhibitionStatus) =>
  state === "past" ? `/exhibitions/past/${slug}` : `/exhibitions/${slug}`;

const withDetail = {
  artists: {
    orderBy: { position: "asc" },
    select: { artist: { select: { name: true, bio: true, portrait: true } } },
  },
  featured: {
    orderBy: { position: "asc" },
    select: {
      artwork: {
        select: { slug: true, title: true, year: true, thumbnail: true, gallery: true },
      },
    },
  },
} satisfies Prisma.ExhibitionInclude;

type DetailRecord = Prisma.ExhibitionGetPayload<{ include: typeof withDetail; }>;
type CardRecord = Pick<
  DetailRecord,
  "slug" | "name" | "artists" | "startDate" | "endDate" | "thumbnail"
>;

const credit = (artists: { artist: { name: string; }; }[]) => {
  const names = artists.map(({ artist }) => artist.name).filter(Boolean);
  if (names.length < 2) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}`;
};

const ticketFor = (record: Pick<DetailRecord, "paid" | "price">) =>
  record.paid
    ? { label: "General admission", price: naira(record.price) }
    : undefined;

const toCard = (placeholder: string, record: CardRecord): ExhibitionSummary => {
  const state = status(record.startDate, record.endDate);
  const run = formatDateSpan(toDateField(record.startDate), toDateField(record.endDate));

  return {
    slug: record.slug,
    title: record.name,
    cardMeta: state === "past" ? run : credit(record.artists) || run,
    card: { src: record.thumbnail ?? placeholder, alt: record.name },
    href: exhibitionHref(record.slug, state),
  };
};

const cardColumns = {
  slug: true,
  name: true,
  artists: withDetail.artists,
  startDate: true,
  endDate: true,
  thumbnail: true,
} satisfies Prisma.ExhibitionSelect;

/**
 * The programme still to run, soonest first — the upcoming index's cards. A
 * show that opened last week has not ended, so it is still here rather than in
 * the archive.
 */
export const listUpcomingExhibitions = async (): Promise<ExhibitionSummary[]> => {
  const [records, placeholder] = await Promise.all([
    prisma.exhibition.findMany({
      where: live(),
      orderBy: { startDate: "asc" },
      select: cardColumns,
    }),
    placeholderHero(),
  ]);
  return records.map(toCard.bind(null, placeholder));
};

/** The archive, most recently closed first. */
export const listPastExhibitions = async (): Promise<ExhibitionSummary[]> => {
  const [records, placeholder] = await Promise.all([
    prisma.exhibition.findMany({
      where: ended(),
      orderBy: { endDate: "desc" },
      select: cardColumns,
    }),
    placeholderHero(),
  ]);
  return records.map(toCard.bind(null, placeholder));
};

const toDetail = (placeholder: string, record: DetailRecord): ExhibitionDetail => {
  const startDate = toDateField(record.startDate);
  const [lead, ...body] = paragraphs(record.summary);

  return {
    slug: record.slug,
    title: record.name,
    artist: credit(record.artists),
    status: status(record.startDate, record.endDate),
    dates: formatDateSpan(startDate, toDateField(record.endDate)),
    hero: record.thumbnail ?? placeholder,
    lead: lead ?? "",
    // The summary is one paragraph in practice, so the detail copy is the body;
    // anything the summary carried beyond its first paragraph leads it.
    body: [...body, ...paragraphs(record.content)],
    ticket: ticketFor(record),
    opensOn: formatDateShort(startDate),
    installShots: record.gallery.map((src, index) => ({
      src,
      alt: `${record.name} — installation view ${index + 1}`,
    })),
    works: record.featured.map(({ artwork }) => ({
      src: artwork.thumbnail ?? artwork.gallery[0] ?? placeholder,
      alt: `${artwork.title}, ${artwork.year}`,
      title: artwork.title,
      year: artwork.year,
      href: `/artworks/${artwork.slug}`,
    })),
    // Only the artists somebody has actually written about. An artist with no
    // biography and no portrait contributes nothing, and an exhibition whose
    // artists are all like that draws no "About the Artist" section at all —
    // which is the whole point of the list being filtered here rather than in
    // the component.
    artistNotes: record.artists
      .map(({ artist }) => ({
        name: artist.name,
        portrait: artist.portrait
          ? { src: artist.portrait, alt: `${artist.name} photographed in their studio` }
          : null,
        paragraphs: paragraphs(artist.bio),
      }))
      .filter((note) => note.portrait || note.paragraphs.length),
  };
};

/**
 * One exhibition, for the detail page of the tree that asked. `state` is the
 * tree, so an archived show does not answer on `/exhibitions/[slug]` and an
 * upcoming one does not answer in the archive — each has one canonical URL.
 */
export const getExhibition = async (
  slug: string,
  state: ExhibitionStatus,
): Promise<ExhibitionDetail | null> => {
  const [record, placeholder] = await Promise.all([
    prisma.exhibition.findUnique({ where: { slug }, include: withDetail }),
    placeholderHero(),
  ]);
  if (!record || status(record.startDate, record.endDate) !== state) return null;

  return toDetail(placeholder, record);
};

/**
 * The next show to open, which the upcoming index features above its cards.
 *
 * The frame's third row is an opening time; the console records a run and a
 * venue but no opening hour, so admission takes that row rather than inventing
 * a time the gallery never entered.
 */
export const getUpNext = async (): Promise<UpNext | null> => {
  const [record, placeholder] = await Promise.all([
    prisma.exhibition.findFirst({
      where: live(),
      orderBy: { startDate: "asc" },
      include: withDetail,
    }),
    placeholderHero(),
  ]);
  if (!record) return null;

  const detail = toDetail(placeholder, record);
  const venue = record.venue || DEFAULT_VENUE;

  return {
    slug: detail.slug,
    title: detail.title,
    artist: detail.artist,
    ticket: detail.ticket,
    eyebrow: "Up next",
    copy: detail.lead,
    image: {
      src: record.thumbnail ?? placeholder,
      alt: detail.title,
    },
    venue,
    dates: detail.dates,
    rows: [
      { label: "Date", value: detail.dates },
      { label: "Venue", value: venue },
      {
        label: "Admission",
        value: detail.ticket ? `${detail.ticket.label} · ${detail.ticket.price}` : "Free",
      },
    ],
    opensOn: detail.opensOn,
  };
};
