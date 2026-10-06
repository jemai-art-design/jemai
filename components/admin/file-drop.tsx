"use client";

import { useId, useRef, useState, useTransition } from "react";
import { GripVertical, X } from "lucide-react";

import { uploadImageAction } from "@/app/admin/(dashboard)/actions";
import { Button } from "@/components/ui/button";
import { formatFileSize, type ContentAsset } from "@/lib/admin/content";
import {
  ALLOWED_IMAGE_ACCEPT,
  ALLOWED_IMAGE_LABEL,
  MAX_GALLERY_IMAGES,
  MAX_IMAGE_SIZE_MB,
} from "@/lib/constants";
import { validateImageBatch } from "@/lib/image-upload";
import { cn } from "@/lib/utils";

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
};

export const FileDrop = ({
  assets,
  onChange,
  multiple = false,
  reorderable = false,
  max = MAX_GALLERY_IMAGES,
  dense = false,
  label,
}: FileDropProps) => {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [uploading, startUpload] = useTransition();

  /** A single slot holds one picture; a gallery holds whatever it was given. */
  const capacity = multiple ? max - assets.length : 1;

  /**
   * Picked files are checked before anything leaves the browser, then posted one
   * per request to the upload action, which puts them on Cloudinary and answers
   * with the URL. The form itself only ever carries those URLs.
   *
   * The batch is all or nothing on validation: a rejected file means nothing is
   * uploaded and the author is told which one, rather than half a gallery
   * landing and the rest disappearing silently.
   */
  const accept = (files: FileList | null) => {
    if (!files?.length) return;
    setProblem(null);

    const picked = Array.from(files);

    if (picked.length > capacity) {
      setProblem(
        multiple
          ? `You can only upload a maximum of ${max} ${max === 1 ? "image" : "images"}.`
          : "This slot holds one image.",
      );
      return;
    }

    startUpload(async () => {
      const invalid = await validateImageBatch(picked, capacity);
      if (invalid) {
        setProblem(invalid);
        return;
      }

      const results = await Promise.all(
        picked.map(async (file) => {
          const body = new FormData();
          body.append("file", file);
          return { file, result: await uploadImageAction(body) };
        }),
      );

      const uploaded: ContentAsset[] = [];
      for (const { file, result } of results) {
        // One failure fails the pick: the author sees why, and no half-added
        // gallery is left behind to work out.
        if (result.error) {
          setProblem(result.message);
          return;
        }
        uploaded.push({
          id: assetId(file),
          name: file.name,
          size: file.size,
          src: result.data,
        });
      }

      onChange(multiple ? [...assets, ...uploaded] : uploaded.slice(0, 1));
    });
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
            "Uploading…"
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
          </p>
        )}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          disabled={uploading}
          accept={ALLOWED_IMAGE_ACCEPT}
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
              {/* A Cloudinary URL, drawn at 48px in a list that can hold a
                  dozen — a plain img rather than a dozen optimiser round trips
                  for thumbnails this size. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset.src}
                alt=""
                className={cn(
                  "bg-surface-subtle shrink-0 rounded-md object-cover",
                  dense ? "size-9" : "size-12"
                )}
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
                    which is noise beside a name in a row this tight. */}
                {dense && !asset.size ? null : (
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
