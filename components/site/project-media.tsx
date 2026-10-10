"use client";

import Image from "next/image";
import { Film, Play } from "lucide-react";

import {
  embedPlayerSrc,
  mediaPoster,
  videoPoster,
  type ProjectMedia,
} from "@/lib/project-media";
import { cn } from "@/lib/utils";

type ProjectPosterProps = {
  media: ProjectMedia;
  /** `next/image` sizes — a card and a 64px thumbnail are not the same request. */
  sizes: string;
  /** Larger on a card than on a thumbnail, so the caller sets it. */
  badgeClassName?: string;
  className?: string;
};

/**
 * The still that stands for an entry before it is played — the carousel's card,
 * the lightbox's thumbnail strip.
 *
 * Nothing autoplays on a card. A rail of six projects would be six videos
 * fetching at once, over connections that cannot afford it, for a page nobody
 * came to watch — so the still is what the rail costs, and pressing it is what
 * loads the player.
 */
export const ProjectPoster = ({
  media,
  sizes,
  badgeClassName,
  className,
}: ProjectPosterProps) => {
  const poster = mediaPoster(media);

  return (
    <>
      {poster ? (
        <Image
          src={poster}
          alt={media.alt}
          fill
          sizes={sizes}
          className={cn("object-cover", className)}
        />
      ) : (
        /* A Vimeo embed, which publishes no still we can guess at. The tile is
           deliberately plain: a wrong photograph would be worse than none. */
        <span className="absolute inset-0 flex items-center justify-center bg-[#2a2724] text-white/70">
          <Film aria-hidden className="w-1/4 max-w-10" />
          <span className="sr-only">{media.alt}</span>
        </span>
      )}

      {media.type === "image" ? null : (
        <span
          aria-hidden
          className="absolute inset-0 flex items-center justify-center"
        >
          <span
            className={cn(
              "flex items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-[2px]",
              badgeClassName ?? "size-12",
            )}
          >
            <Play className="size-2/5 fill-current" />
          </span>
        </span>
      )}
    </>
  );
};

/**
 * One entry at full size, in the lightbox: a photograph, a film off our own
 * cloud, or a provider's player.
 *
 * `object-cover` on a photograph and `object-contain` on anything that plays.
 * A room photographed for the frame is cropped to it; a film is not — its own
 * framing is the work, and cropping a walkthrough's edges away is the one thing
 * a lightbox must not do.
 *
 * The caller keys this on the index it is showing, so moving along the strip
 * unmounts the player rather than re-pointing it. That is what stops a film
 * carrying on in the background after the visitor has moved to the next shot.
 */
export const ProjectMediaFrame = ({ media }: { media: ProjectMedia; }) => {
  if (media.type === "image")
    return (
      <Image
        src={media.src}
        alt={media.alt}
        fill
        sizes="(min-width: 1024px) 60vw, 100vw"
        className="animate-in fade-in object-cover duration-300"
      />
    );

  if (media.type === "video")
    return (
      <video
        controls
        playsInline
        preload="metadata"
        src={media.src}
        poster={videoPoster(media.src) ?? undefined}
        aria-label={media.alt}
        className="animate-in fade-in absolute inset-0 size-full bg-black object-contain duration-300"
      />
    );

  return (
    <iframe
      src={embedPlayerSrc(media.src)}
      title={media.alt}
      loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
      allowFullScreen
      className="animate-in fade-in absolute inset-0 size-full border-0 bg-black duration-300"
    />
  );
};
