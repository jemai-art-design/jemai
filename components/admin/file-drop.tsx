"use client";

import { useId, useRef, useState, useTransition } from "react";
import { GripVertical, X } from "lucide-react";

import {
  signVideoUploadAction,
  uploadImageAction,
} from "@/app/admin/(dashboard)/actions";
import { fieldChrome } from "@/components/admin/form-section";
import { MediaThumb } from "@/components/admin/media-thumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatFileSize, type ContentAsset } from "@/lib/admin/content";
import {
  ALLOWED_IMAGE_ACCEPT,
  ALLOWED_IMAGE_LABEL,
  ALLOWED_VIDEO_ACCEPT,
  ALLOWED_VIDEO_LABEL,
  MAX_GALLERY_IMAGES,
  MAX_IMAGE_SIZE_MB,
  MAX_VIDEO_SIZE_MB,
} from "@/lib/constants";
import { validateImageBatch } from "@/lib/image-upload";
import { embedProviders, videoEmbed } from "@/lib/project-media";
import {
  isVideoFile,
  uploadVideo,
  validateVideoBatch,
  type SignedVideoUpload,
} from "@/lib/video-upload";
import { cn } from "@/lib/utils";

/** "Plays from YouTube" — what an embed row says in place of a file size. */
const embedHost = (src: string) => {
  const embed = videoEmbed(src);
  return embed ? `Plays from ${embedProviders[embed.provider]}` : "Embedded video";
};

/** Distinguishes two pictures with the same name picked in the same second. */
const assetId = (file: File) =>
  `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

type FileDropProps = {
  assets: ContentAsset[];
  onChange: (assets: ContentAsset[]) => void;
  /** Single-slot (thumbnail) replaces on pick; multiple (media) appends. */
  multiple?: boolean;
  /** Only the media list is ordered, so only it draws grip handles. */
  reorderable?: boolean;
  max?: number;
  dense?: boolean;
  label: string;
  /**
   * Whether this picker also takes film: an uploaded video, or a YouTube or
   * Vimeo link. Only the project form sets it — the catalogue and exhibition
   * galleries are photography, and a product shot that silently became a video
   * would break every frame that draws one.
   */
  allowVideo?: boolean;
};

export const FileDrop = ({
  assets,
  onChange,
  multiple = false,
  reorderable = false,
  max = MAX_GALLERY_IMAGES,
  dense = false,
  label,
  allowVideo = false,
}: FileDropProps) => {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  /** What the drop zone says while a film is going up — a film takes minutes. */
  const [note, setNote] = useState<string | null>(null);
  const [link, setLink] = useState("");
  const [uploading, startUpload] = useTransition();

  /** A single slot holds one picture; a gallery holds whatever it was given. */
  const capacity = multiple ? max - assets.length : 1;

  /** "images" where that is all it takes; "items" where films share the count. */
  const noun = allowVideo ? "item" : "image";

  const atCapacity = () => {
    setProblem(
      multiple
        ? `You can only add a maximum of ${max} ${max === 1 ? noun : `${noun}s`}.`
        : "This slot holds one image.",
    );
  };

  /**
   * Puts one picture on Cloudinary through the upload action, which answers with
   * the URL. The form itself only ever carries those URLs.
   */
  const putImage = async (file: File) => {
    const body = new FormData();
    body.append("file", file);
    return uploadImageAction(body);
  };

  /**
   * Picked files are checked before anything leaves the browser, then uploaded —
   * photographs through the action, films straight to Cloudinary on a signature
   * the server hands out, since a server action's body cannot carry one.
   *
   * The batch is all or nothing on validation: a rejected file means nothing is
   * uploaded and the author is told which one, rather than half a gallery
   * landing and the rest disappearing silently.
   */
  const accept = (files: FileList | null) => {
    if (!files?.length) return;
    setProblem(null);

    const picked = Array.from(files);

    if (picked.length > capacity) return atCapacity();

    const films = allowVideo ? picked.filter(isVideoFile) : [];
    const photographs = picked.filter((file) => !films.includes(file));

    startUpload(async () => {
      const invalid =
        (await validateImageBatch(photographs, capacity)) ??
        (await validateVideoBatch(films));
      if (invalid) {
        setProblem(invalid);
        return;
      }

      /* One signature covers the whole pick: it is an hour's permission, and
         asking per film would be a round trip per film for nothing. */
      let signed: SignedVideoUpload | null = null;
      if (films.length) {
        const signature = await signVideoUploadAction();
        if (signature.error) {
          setProblem(signature.message);
          return;
        }
        signed = signature.data;
      }

      /* Photographs go up at once, as they always have — a dozen of them is a
         dozen small parallel requests. The films then go one at a time, because
         four 80MB uploads sharing a connection is four that all crawl. */
      const sources = new Map<File, string>();

      const results = await Promise.all(
        photographs.map(async (file) => ({ file, result: await putImage(file) })),
      );
      for (const { file, result } of results) {
        // One failure fails the pick: the author sees why, and no half-added
        // gallery is left behind to work out.
        if (result.error) {
          setProblem(result.message);
          return;
        }
        sources.set(file, result.data);
      }

      for (const [index, file] of films.entries()) {
        const counted = films.length > 1 ? ` (${index + 1} of ${films.length})` : "";
        try {
          sources.set(
            file,
            await uploadVideo(file, signed!, (percent) =>
              setNote(`Uploading ${file.name} — ${percent}%${counted}`),
            ),
          );
        } catch (error) {
          setProblem(
            error instanceof Error
              ? error.message
              : "Could not upload that video. Try again.",
          );
          setNote(null);
          return;
        }
      }

      setNote(null);

      // Rebuilt from `picked` rather than from the two halves, so the list keeps
      // the order the author chose the files in.
      const uploaded = picked.map((file) => ({
        id: assetId(file),
        name: file.name,
        size: file.size,
        src: sources.get(file)!,
        type: isVideoFile(file) ? ("video" as const) : ("image" as const),
      }));

      onChange(multiple ? [...assets, ...uploaded] : uploaded.slice(0, 1));
    });
  };

  /**
   * A pasted link becomes an entry without an upload: nothing of the video is
   * ours, only the id we play it by. It joins the same list as the uploads, so
   * it reorders and removes with them and can be the card.
   */
  const addEmbed = () => {
    setProblem(null);

    const embed = videoEmbed(link);
    if (!embed) {
      setProblem("Paste a YouTube or Vimeo link — those are the two we can play.");
      return;
    }
    if (!capacity) return atCapacity();
    if (assets.some((asset) => asset.src === embed.src)) {
      setProblem("That video is already on this project.");
      return;
    }

    onChange([
      ...assets,
      {
        id: embed.src,
        name: `${embedProviders[embed.provider]} · ${embed.id}`,
        // Nothing of it is hosted here, so there are no bytes to report.
        size: 0,
        src: embed.src,
        type: "embed" as const,
      },
    ]);
    setLink("");
  };

  const remove = (id: string) => onChange(assets.filter((asset) => asset.id !== id));

  /** Moves the dragged row to the position of the row it was dropped on. */
  const reorder = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    const from = assets.findIndex((asset) => asset.id === fromId);
    const to = assets.findIndex((asset) => asset.id === toId);
    if (from === -1 || to === -1) return;
    const next = [...assets];
    next.splice(to, 0, ...next.splice(from, 1));
    onChange(next);
  };

  return (
    <div className="flex flex-col">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setOver(false);
          accept(event.dataTransfer.files);
        }}
        className={cn(
          "border-border-strong/40 flex flex-col items-center gap-1 rounded-lg border border-dashed text-center transition-colors",
          dense ? "px-3 py-3" : "px-6 py-6",
          over && "border-action-primary bg-admin-field"
        )}
      >
        <p className={cn("text-text-secondary", dense ? "text-xs" : "text-sm")}>
          {uploading ? (
            (note ?? "Uploading…")
          ) : (
            <>
              Drop your file here, or{" "}
              <label
                htmlFor={inputId}
                className="cursor-pointer text-[#6d28d9] underline-offset-2 hover:underline"
              >
                click to browse
              </label>
            </>
          )}
        </p>
        {/* Inside a variant row the format line would repeat once per
            combination, so the dense picker leaves it to the section above. */}
        {dense ? null : (
          <p className="text-text-secondary text-xs">
            {ALLOWED_IMAGE_LABEL}, up to {MAX_IMAGE_SIZE_MB}MB · 1200 × 1600 (3:4) recommended
            {allowVideo ? (
              <>
                <br />
                {ALLOWED_VIDEO_LABEL} video, up to {MAX_VIDEO_SIZE_MB}MB
              </>
            ) : null}
          </p>
        )}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          disabled={uploading}
          accept={
            allowVideo
              ? `${ALLOWED_IMAGE_ACCEPT},${ALLOWED_VIDEO_ACCEPT}`
              : ALLOWED_IMAGE_ACCEPT
          }
          multiple={multiple}
          aria-label={label}
          className="sr-only"
          onChange={(event) => {
            accept(event.target.files);
            // Let the same file be picked again after it has been removed.
            event.target.value = "";
          }}
        />
      </div>

      {/* A video already on the studio's channel is not worth re-uploading, and
          a film longer than the ceiling above has nowhere else to go. */}
      {allowVideo ? (
        <div className="mt-3 flex flex-col gap-1.5">
          <div className="flex gap-2">
            <Input
              type="url"
              value={link}
              placeholder="Or paste a YouTube or Vimeo link"
              aria-label={`${label} — video link`}
              onChange={(event) => setLink(event.target.value)}
              onKeyDown={(event) => {
                // The picker sits inside the project form, so Enter here would
                // otherwise submit the whole thing.
                if (event.key !== "Enter") return;
                event.preventDefault();
                addEmbed();
              }}
              className={cn(fieldChrome, "h-10 flex-1 text-sm md:text-sm")}
            />
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={!link.trim()}
              onClick={addEmbed}
              className="border-border-default h-10 shrink-0 text-sm"
            >
              Add link
            </Button>
          </div>
          <p className="text-text-secondary text-xs">
            It plays from there rather than from our cloud, and sits in this list
            like an upload.
          </p>
        </div>
      ) : null}

      {problem ? (
        <p role="alert" className="mt-2 text-sm text-[#e11d48]">
          {problem}
        </p>
      ) : null}

      {assets.length ? (
        <ul className="flex flex-col">
          {assets.map((asset) => (
            <li
              key={asset.id}
              draggable={reorderable}
              onDragStart={() => setDragging(asset.id)}
              onDragEnd={() => setDragging(null)}
              onDragOver={(event) => reorderable && event.preventDefault()}
              onDrop={(event) => {
                if (!reorderable || !dragging) return;
                event.preventDefault();
                event.stopPropagation();
                reorder(dragging, asset.id);
                setDragging(null);
              }}
              className={cn(
                "border-border-default flex items-center gap-3 border-b last:border-b-0",
                dense ? "py-2" : "py-3",
                dragging === asset.id && "opacity-50"
              )}
            >
              {reorderable ? (
                <GripVertical
                  aria-hidden
                  className="text-text-secondary size-4 shrink-0 cursor-grab"
                />
              ) : null}
              <MediaThumb
                media={{ type: asset.type ?? "image", src: asset.src }}
                className={dense ? "size-9" : "size-12"}
              />
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "text-text-primary block truncate",
                    dense ? "text-xs" : "text-sm"
                  )}
                >
                  {asset.name}
                </span>
                {/* A re-opened edit form reports 0 bytes for a stored source,
                    which is noise beside a name in a row this tight — and an
                    embed has no bytes of ours at all, so it names its host
                    instead. */}
                {asset.type === "embed" ? (
                  <span className="text-text-secondary block text-xs">
                    {embedHost(asset.src)}
                  </span>
                ) : dense && !asset.size ? null : (
                  <span className="text-text-secondary block text-xs">
                    {formatFileSize(asset.size)}
                  </span>
                )}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(asset.id)}
                aria-label={`Remove ${asset.name}`}
                className="text-text-secondary hover:text-text-primary shrink-0"
              >
                <X />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};
