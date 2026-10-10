import { Film, Play } from "lucide-react";

import { mediaPoster, type ProjectMedia } from "@/lib/project-media";
import { cn } from "@/lib/utils";

type MediaThumbProps = {
  media: Pick<ProjectMedia, "type" | "src">;
  alt?: string;
  /** The box: the console's rows size it, so only the shape is set here. */
  className?: string;
};

/**
 * One entry in a project's media list, drawn small — an upload row, the alt
 * text column, the record screen's grid.
 *
 * Every kind reduces to a still and a badge, which is the only way a list
 * mixing photographs, films and embeds stays readable at 40px. The still is
 * derived, never stored: Cloudinary renders a film's opening frame, and YouTube
 * publishes one per video. A Vimeo embed has neither without a request per
 * video, so it falls back to a plain tile — the badge and the name beside it
 * are what identify it.
 *
 * A plain `img` rather than `next/image`: these are Cloudinary URLs at a size
 * where a list of a dozen would be a dozen optimiser round trips, which is the
 * same call every other upload row in the console makes.
 */
export const MediaThumb = ({ media, alt = "", className }: MediaThumbProps) => {
  const poster = mediaPoster(media);

  return (
    <span
      className={cn(
        "bg-surface-subtle relative block shrink-0 overflow-hidden rounded-md",
        className,
      )}
    >
      {poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt={alt} className="size-full object-cover" />
      ) : (
        <span className="text-text-secondary flex size-full items-center justify-center">
          <Film aria-hidden className="w-[40%] max-w-6" />
        </span>
      )}

      {/* Sized as a share of the box, so one badge reads at 36px and at 120px. */}
      {media.type === "image" ? null : (
        <span
          aria-hidden
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="flex aspect-square w-[34%] min-w-4 items-center justify-center rounded-full bg-black/55 text-white">
            <Play className="w-[45%] fill-current" />
          </span>
        </span>
      )}
    </span>
  );
};
