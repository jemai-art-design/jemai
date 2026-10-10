/**
 * What a project's media list holds, and the reading of it both sides share.
 *
 * A project used to be photography alone. It now carries three kinds of thing:
 * a photograph, a film uploaded to our own cloud, and a video hosted somewhere
 * else and embedded — a walkthrough already on the studio's YouTube channel is
 * not worth re-uploading, and a 200MB film is not worth serving ourselves.
 *
 * They sit in one ordered list rather than three, because the order is the
 * point: the first entry is the card and the lightbox walks them as they are
 * arranged. A separate video list would mean deciding, somewhere else, how the
 * two interleave.
 *
 * This module carries no Prisma and no Cloudinary SDK, so the console's pickers
 * and the storefront's lightbox can both import it — `lib/projects` is the
 * server-side read of the same shape.
 */

export const projectMediaTypes = ["image", "video", "embed"] as const;

export type ProjectMediaType = (typeof projectMediaTypes)[number];

/**
 * One entry in a project's media list.
 *
 * Flat rather than a discriminated union on purpose: this is what a form field
 * array holds and what a Json column stores, and both are far easier to write
 * when every entry has the same three keys. Everything else about an entry —
 * its poster, its player, what to call it — is derived here from `type` and
 * `src` rather than stored.
 */
export type ProjectMedia = {
  type: ProjectMediaType;
  /**
   * A Cloudinary URL for an image or a film; the provider's player URL for an
   * embed, in the canonical form `videoEmbed` returns.
   */
  src: string;
  /** Alt text for a photograph, the accessible name for a film or an embed. */
  alt: string;
};

/**
 * A stored entry as this module's shape.
 *
 * Rows written before video existed carry `{ src, alt }` and nothing else, and
 * they are photographs — so a missing or unrecognised `type` reads as `image`
 * rather than throwing. The migration backfills the key, but a Json column is
 * not a schema and this is the one place that has to hold either way.
 */
export const toProjectMedia = (entry: Partial<ProjectMedia>): ProjectMedia => ({
  type: projectMediaTypes.includes(entry.type as ProjectMediaType)
    ? (entry.type as ProjectMediaType)
    : "image",
  src: entry.src ?? "",
  alt: entry.alt ?? "",
});

/** The two video hosts an embed may come from, as the console names them. */
export const embedProviders = {
  youtube: "YouTube",
  vimeo: "Vimeo",
} as const;

export type EmbedProvider = keyof typeof embedProviders;

export type VideoEmbed = {
  provider: EmbedProvider;
  /** The video's own id on that provider — the whole key to its player. */
  id: string;
  /** The player URL stored as the entry's `src`. */
  src: string;
};

const YOUTUBE_HOSTS = [
  "youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "youtu.be",
];

const VIMEO_HOSTS = ["vimeo.com", "player.vimeo.com"];

/** Eleven characters of the YouTube alphabet, and Vimeo's bare integer. */
const YOUTUBE_ID = /^[\w-]{11}$/;
const VIMEO_ID = /^\d+$/;
/** The token on an unlisted Vimeo video, without which its player 404s. */
const VIMEO_HASH = /^[0-9a-f]{6,16}$/i;

/** `www.` is noise on every host either provider answers on. */
const host = (url: URL) => url.hostname.replace(/^www\./, "").toLowerCase();

const segments = (url: URL) => url.pathname.split("/").filter(Boolean);

/**
 * The video id in any of the shapes a YouTube link is copied in: a watch URL, a
 * share URL, an embed URL, a Short, a live stream.
 */
const youtubeId = (url: URL) => {
  const path = segments(url);

  if (host(url) === "youtu.be") return path[0];
  if (path[0] === "watch") return url.searchParams.get("v") ?? undefined;
  if (["embed", "shorts", "live", "v"].includes(path[0])) return path[1];
  return undefined;
};

/**
 * The id and, where the link carries one, the unlisted token. Vimeo's own
 * copied links come in several shapes too — a bare `vimeo.com/76979871`, a
 * channel or group path, a player URL, and the `vimeo.com/<id>/<hash>` form an
 * unlisted video is shared as.
 */
const vimeoParts = (url: URL) => {
  const path = segments(url);
  const index = path.findIndex((segment) => VIMEO_ID.test(segment));
  if (index === -1) return undefined;

  const next = path[index + 1];
  return {
    id: path[index],
    hash: url.searchParams.get("h") ?? (next && VIMEO_HASH.test(next) ? next : undefined),
  };
};

/**
 * A pasted link as the entry we store, or null if it is not a video link we can
 * play.
 *
 * Idempotent: the URL it returns parses back to the same embed, so the stored
 * `src` can be re-read by the validator and by the player without a second
 * shape to handle. YouTube goes through the no-cookie host — the lightbox opens
 * on a page a visitor did not ask a video of, so the embed should not set
 * tracking cookies before they press play.
 */
export const videoEmbed = (value: string): VideoEmbed | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  let url: URL;
  try {
    // A link copied out of a browser bar often arrives without its scheme.
    url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }

  if (YOUTUBE_HOSTS.includes(host(url))) {
    const id = youtubeId(url);
    if (!id || !YOUTUBE_ID.test(id)) return null;
    return {
      provider: "youtube",
      id,
      src: `https://www.youtube-nocookie.com/embed/${id}`,
    };
  }

  if (VIMEO_HOSTS.includes(host(url))) {
    const parts = vimeoParts(url);
    if (!parts) return null;
    return {
      provider: "vimeo",
      id: parts.id,
      src: `https://player.vimeo.com/video/${parts.id}${parts.hash ? `?h=${parts.hash}` : ""}`,
    };
  }

  return null;
};

/**
 * The still Cloudinary renders from a film's first frame, as an image URL on the
 * same asset.
 *
 * Derived rather than stored: the poster is the film, so a second upload for it
 * would be one more thing to keep in step and one more thing to forget. `so_0`
 * is the frame offset — the opening frame, which is the one a card wants.
 */
export const videoPoster = (src: string) => {
  if (!src.includes("/video/upload/")) return null;
  return src
    .replace("/video/upload/", "/video/upload/so_0/")
    .replace(/\.[a-z0-9]+(\?.*)?$/i, ".jpg");
};

/**
 * A still for an embed, where the provider publishes one at a guessable URL.
 *
 * YouTube does: `hqdefault` exists for every video, under a host that serves it
 * without an API key. Vimeo does not — its thumbnails are behind oEmbed, which
 * is a request per video on a page that draws a dozen — so a Vimeo entry draws
 * a plain tile and its name instead.
 */
export const embedThumbnail = (src: string) => {
  const embed = videoEmbed(src);
  if (embed?.provider !== "youtube") return null;
  return `https://i.ytimg.com/vi/${embed.id}/hqdefault.jpg`;
};

/**
 * The still that stands in for an entry — in a card, in a thumbnail strip, in
 * the console's upload rows. Null means there is no picture to draw and the
 * caller should fall back to a tile.
 */
export const mediaPoster = (media: Pick<ProjectMedia, "type" | "src">) => {
  if (media.type === "image") return media.src;
  if (media.type === "video") return videoPoster(media.src);
  return embedThumbnail(media.src);
};

/** What one entry is called in a label, a hint or an aria-label. */
export const mediaNoun = (type: ProjectMediaType) =>
  type === "image" ? "photograph" : "video";

/**
 * How an entry is named in a list when it has no file name of its own — which
 * is every embed, and every stored source a re-opened edit form has rebuilt.
 */
export const mediaName = (media: Pick<ProjectMedia, "type" | "src">) => {
  if (media.type === "embed") {
    const embed = videoEmbed(media.src);
    return embed ? `${embedProviders[embed.provider]} · ${embed.id}` : "Embedded video";
  }
  const file = media.src.split("?")[0].split("/").pop();
  return file || (media.type === "video" ? "Uploaded video" : "Uploaded image");
};

/**
 * An embed's player URL with the parameters the lightbox wants: no related
 * videos from other channels, no provider chrome competing with ours. The id
 * is already in `src`, so this only ever appends.
 */
export const embedPlayerSrc = (src: string) => {
  const embed = videoEmbed(src);
  if (!embed) return src;

  const url = new URL(embed.src);
  if (embed.provider === "youtube") {
    url.searchParams.set("rel", "0");
    url.searchParams.set("modestbranding", "1");
  } else {
    url.searchParams.set("dnt", "1");
  }
  return url.toString();
};

/**
 * "12 photographs · 2 videos" — what a record screen and an index row say of a
 * project's media without drawing any of it.
 *
 * Uploaded films and embeds are counted together as videos. The distinction
 * matters to the uploader and to the player, but not to the studio reading how
 * much a project has: both are a video on the page.
 */
export const mediaCount = (media: Pick<ProjectMedia, "type">[]) => {
  const photographs = media.filter((entry) => entry.type === "image").length;
  const videos = media.length - photographs;

  const counted = [
    photographs && `${photographs} ${photographs === 1 ? "photograph" : "photographs"}`,
    videos && `${videos} ${videos === 1 ? "video" : "videos"}`,
  ].filter(Boolean);

  return counted.length ? counted.join(" · ") : "—";
};
