/**
 * What the furniture, artwork and exhibition stores have in common: the asset
 * shape the uploader produces, the display formatters the indexes and upload
 * rows use, slugging, and the unique-slug rule. Every store imports from here
 * rather than from each other.
 */

import { mediaName, type ProjectMediaType } from "@/lib/project-media";

/** A media entry — thumbnail, portrait or gallery slot. `size` is what the uploader reported. */
export type ContentAsset = {
  id: string;
  name: string;
  /** Bytes, as the picker reported them. Formatted for display, never summed. */
  size: number;
  src: string;
  /**
   * What the entry is, where the picker takes more than photographs. Only the
   * project form does — the catalogue and exhibition pickers produce images and
   * nothing else — so it is optional and reads as `image` when absent, and a
   * video-less picker needs no changes to keep working.
   */
  type?: ProjectMediaType;
};

/**
 * The uploader works in `ContentAsset`s, but only their `src` and kind are
 * worth keeping: a record carries one thumbnail and an ordered list of sources
 * on its own row. This turns a stored source back into the shape the picker
 * draws, naming it as `mediaName` does — a re-opened edit form shows the file
 * name a photograph or a film was uploaded under, and the provider and id of an
 * embed, which has no file name to show.
 */
export const toContentAsset = (
  src: string,
  type: ProjectMediaType = "image",
  // Always set here, however `ContentAsset` declares it, so a project form's
  // values — which require a kind — can be spread straight out of this.
): ContentAsset & { type: ProjectMediaType; } => ({
  id: src,
  name: src.startsWith("data:") ? "Uploaded image" : mediaName({ type, src }),
  size: 0,
  src,
  type,
});

/** Naira, whole units, hand-grouped so server and client always agree. */
export const naira = (amount: number) =>
  `₦${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

/**
 * "15 May 2020 9:00 pm" — the index's Updated column. Built by hand rather than
 * through `Intl` so a server render and a client re-render cannot disagree about
 * locale data.
 */
const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const formatUpdatedAt = (iso: string) => {
  const date = new Date(iso);
  const hour = date.getUTCHours();
  const meridiem = hour < 12 ? "am" : "pm";
  const twelve = hour % 12 === 0 ? 12 : hour % 12;
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  return `${date.getUTCDate()} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()} ${twelve}:${minutes} ${meridiem}`;
};

/**
 * "18 Aug · 07:56" — the newsletter index's Date column, which drops the year
 * and prints a 24-hour clock. Built off UTC for the same reason as
 * `formatUpdatedAt`: a locale-dependent render would not survive hydration.
 */
export const formatDateTimeShort = (iso: string) => {
  const date = new Date(iso);
  const hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  return `${date.getUTCDate()} ${months[date.getUTCMonth()]} · ${hours}:${minutes}`;
};

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * "2 September 2026 · 09:42" — the long stamp with a 24-hour clock, which the
 * Christmas request sheet prints under its title. UTC, like the others here, so
 * the server render and the client re-render cannot disagree.
 */
export const formatDateTimeLong = (iso: string) => {
  const date = new Date(iso);
  const hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  return `${date.getUTCDate()} ${monthNames[date.getUTCMonth()]} ${date.getUTCFullYear()} · ${hours}:${minutes}`;
};

/**
 * A `yyyy-mm-dd` field value as its parts, without going through `Date` — a
 * bare date string parses as UTC midnight and prints as the day before in any
 * negative offset, which is exactly the bug a date-only field must not have.
 */
const parts = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return { year, month: month - 1, day };
};

/** "15 Aug – 14 Sep", collapsing the month when both ends share one. */
export const formatDateRange = (start: string, end: string) => {
  const from = parts(start);
  const to = parts(end);
  if (!from && !to) return "—";
  if (!from || !to) {
    const only = (from ?? to)!;
    return `${only.day} ${months[only.month]}`;
  }
  return from.month === to.month && from.year === to.year
    ? `${from.day} – ${to.day} ${months[to.month]}`
    : `${from.day} ${months[from.month]} – ${to.day} ${months[to.month]}`;
};

/** "12 September–4 October 2026" — the long form the detail record prints. */
export const formatDateSpan = (start: string, end: string) => {
  const from = parts(start);
  const to = parts(end);
  if (!from || !to) return "—";
  return `${from.day} ${monthNames[from.month]}–${to.day} ${monthNames[to.month]} ${to.year}`;
};

/** "15 Aug 2026" — one end of a run, as the register modal draws it. */
export const formatDateShort = (value: string) => {
  const date = parts(value);
  if (!date) return "—";
  return `${date.day} ${months[date.month]} ${date.year}`;
};

/** File sizes as the upload rows draw them: "163.38 KB". */
export const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(2)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
};

/** Lowercase, hyphenated, punctuation dropped — what the slug field suggests. */
export const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * A slug the store does not already hold, suffixed `-2`, `-3`, … if it does.
 * `ignore` is the record's own current slug, so re-saving it unchanged does not
 * push it to `-2`.
 */
export const uniqueSlug = (
  taken: string[],
  candidate: string,
  fallback: string,
  ignore?: string
) => {
  const base = candidate || fallback;
  let slug = base;
  for (let n = 2; taken.some((value) => value === slug && value !== ignore); n += 1)
    slug = `${base}-${n}`;
  return slug;
};

/**
 * The Artwork Story is authored as HTML in a contenteditable, so it is written
 * back to the page with `dangerouslySetInnerHTML`. Everything outside these two
 * allowlists is dropped on save — the editor only ever produces this much, so
 * anything else arrived by paste or by a hand-made request.
 */
const ALLOWED_TAGS = ["p", "br", "b", "strong", "i", "em", "u", "ul", "ol", "li", "div", "span"];

/**
 * The toolbar's colour and alignment controls emit inline styles, so `style` is
 * the one attribute that survives — and only these two declarations within it,
 * only with a literal hex colour or a keyword. That rules out `url(...)`,
 * `expression(...)` and every other value that can reach outside the string.
 */
// Browsers normalise `foreColor` to `rgb(...)` on the way into the DOM, so both
// spellings have to pass. Numeric components only — that admits no `url(...)`,
// no `var(...)` and no `expression(...)`.
const COLOUR = /^(#[0-9a-f]{3}([0-9a-f]{3})?|rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*(0|1|0?\.\d+)\s*)?\))$/i;
const ALIGNMENT = /^(left|center|right|justify)$/i;

const safeStyle = (style: string) => {
  const kept = style
    .split(";")
    .map((declaration) => declaration.split(":").map((part) => part.trim()))
    .filter(([property, value]) =>
      value && ((property?.toLowerCase() === "color" && COLOUR.test(value)) ||
        (property?.toLowerCase() === "text-align" && ALIGNMENT.test(value)))
    )
    .map(([property, value]) => `${property.toLowerCase()}: ${value.toLowerCase()}`);
  return kept.length ? ` style="${kept.join("; ")}"` : "";
};

export const sanitizeRichText = (html: string) =>
  html
    // Drop whole elements that can execute or load, contents and all.
    .replace(/<(script|style|iframe|object|embed|svg|math)\b[\s\S]*?<\/\1>/gi, "")
    // Then rebuild every remaining tag from scratch, so no attribute survives
    // that was not explicitly re-added.
    .replace(/<(\/?)([a-z][a-z0-9]*)\b([^>]*)>/gi, (_tag, closing: string, name: string, attrs: string) => {
      const tag = name.toLowerCase();
      if (!ALLOWED_TAGS.includes(tag)) return "";
      if (closing) return `</${tag}>`;
      const style = /style\s*=\s*"([^"]*)"/i.exec(attrs) ?? /style\s*=\s*'([^']*)'/i.exec(attrs);
      return `<${tag}${style ? safeStyle(style[1]) : ""}>`;
    })
    .trim();
