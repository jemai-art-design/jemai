"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImageUp, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  resetSiteImagesAction,
  saveSiteImagesAction,
  uploadSiteImageAction,
} from "@/app/admin/(dashboard)/site-images/actions";
import { FieldLabel, fieldChrome } from "@/components/admin/form-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  ALLOWED_IMAGE_ACCEPT,
  ALLOWED_IMAGE_LABEL,
  MAX_IMAGE_SIZE_MB,
} from "@/lib/constants";
import { validateImageBatch } from "@/lib/image-upload";
import {
  objectFit,
  siteImagePages,
  slotCapacity,
  type ImageFit,
  type SiteImage,
} from "@/lib/site-image-slots";
import type { SiteImageSlotView } from "@/lib/site-images";
import { cn } from "@/lib/utils";

/**
 * The key a picture added to an open carousel is filed under.
 *
 * Positional rather than random, and that is the whole point: a picture that is
 * added and then not saved has still written `slide-5` to the media library,
 * and the next add picks `slide-5` again and writes over it. The keys a
 * location can ever hold are therefore bounded by its own capacity, which is
 * what keeps the folder the size of the site instead of the size of its history.
 */
const nextKey = (used: Set<string>) => {
  for (let n = 1; ; n += 1) {
    const key = `slide-${n}`;
    if (!used.has(key)) return key;
  }
};

/**
 * What a location is drawing, as one comparable string.
 *
 * The fields are listed rather than the objects stringified: the server's
 * objects come back in the order its validation schema declares and the
 * browser's are built in the order the registry writes them, so comparing the
 * two as JSON would read an identical list as an unsaved change.
 */
const signature = (images: SiteImage[]) =>
  JSON.stringify(images.map(({ key, src, alt, fit }) => [key, src, alt, fit]));

const fits: { value: ImageFit; label: string; hint: string }[] = [
  { value: "cover", label: "Crop to fill", hint: "Fills the frame; the edges are cropped." },
  { value: "contain", label: "Fit inside", hint: "Shows the whole picture; the frame may show around it." },
];

type SiteImageRowProps = {
  image: SiteImage;
  index: number;
  count: number;
  /** Drawn `aria-hidden` on the page, so it has no alt text to write. */
  decorative: boolean;
  /** Whether the composition lets this picture be taken out. */
  removable: boolean;
  uploading: boolean;
  disabled: boolean;
  onChange: (patch: Partial<SiteImage>) => void;
  onReplace: () => void;
  onRemove: () => void;
};

const SiteImageRow = ({
  image,
  index,
  count,
  decorative,
  removable,
  uploading,
  disabled,
  onChange,
  onReplace,
  onRemove,
}: SiteImageRowProps) => (
  <li className="border-border-default flex flex-col gap-3 border-b py-4 last:border-b-0 sm:flex-row sm:items-start sm:gap-4">
    {/* The preview is drawn with the picture's own fit, so the choice below is
        visible here rather than only on the site. */}
    <div className="bg-surface-subtle border-border-default relative size-20 shrink-0 overflow-hidden rounded-md border">
      {/* A Cloudinary URL or a file from `public/`, drawn at 80px — a plain img
          rather than an optimiser round trip per thumbnail. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.src}
        alt=""
        className={cn("size-full", objectFit(image.fit))}
      />
      {uploading ? (
        <span className="bg-surface-inverse/70 text-text-inverse absolute inset-0 flex items-center justify-center text-xs">
          Uploading…
        </span>
      ) : null}
    </div>

    <div className="flex min-w-0 flex-1 flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-text-primary text-sm font-medium">
          {count > 1 ? `Image ${index + 1} of ${count}` : "Image"}
        </span>
        <code className="text-text-secondary bg-admin-field rounded px-1.5 py-0.5 text-xs">
          {image.key}
        </code>
      </div>

      {decorative ? null : (
        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor={`alt-${image.key}`}>Alt text</FieldLabel>
          <Input
            id={`alt-${image.key}`}
            value={image.alt}
            disabled={disabled}
            onChange={(event) => onChange({ alt: event.target.value })}
            placeholder="What someone who cannot see it would need told"
            className={cn(fieldChrome, "h-10 text-sm")}
          />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <FieldLabel>How it sits in its frame</FieldLabel>
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          spacing={0}
          value={image.fit}
          disabled={disabled}
          onValueChange={(value) => value && onChange({ fit: value as ImageFit })}
          aria-label="How it sits in its frame"
        >
          {fits.map((fit) => (
            <ToggleGroupItem key={fit.value} value={fit.value} title={fit.hint}>
              {fit.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>

    <div className="flex shrink-0 gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={onReplace}
      >
        <ImageUp aria-hidden />
        Replace
      </Button>
      {removable ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          onClick={onRemove}
          aria-label={`Remove image ${index + 1}`}
          className="text-text-secondary hover:text-text-primary"
        >
          <Trash2 aria-hidden />
        </Button>
      ) : null}
    </div>
  </li>
);

/**
 * One location, managed in place: its pictures, the alt text and frame fit of
 * each, and the two things that can happen to the location as a whole.
 *
 * Each location saves on its own rather than the tab saving as a page. A save
 * purges the storefront's cache, so it is worth being a deliberate act about
 * one hero rather than a blanket write of every location on a page the studio
 * only opened to look at.
 */
const SiteImageCard = ({ view }: { view: SiteImageSlotView }) => {
  const { meta } = view;
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  /**
   * The draft, with the server's own list as the thing it is measured against.
   * Re-synced during render when the server hands back a different list — which
   * is what a save followed by a refresh does — rather than in an effect, so an
   * in-flight edit is never drawn against a stale baseline.
   */
  const settled = signature(view.images);
  const [baseline, setBaseline] = useState(settled);
  const [images, setImages] = useState<SiteImage[]>(view.images);
  if (baseline !== settled) {
    setBaseline(settled);
    setImages(view.images);
  }

  const [problem, setProblem] = useState<string | null>(null);
  /** The key currently being uploaded to, or null while nothing is in flight. */
  const [uploading, setUploading] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  /** Which picture the open file dialog is for — null means it is an addition. */
  const replacing = useRef<string | null>(null);

  const capacity = slotCapacity(meta);
  const dirty = signature(images) !== settled;
  const busy = pending || Boolean(uploading);
  /** A location has to draw something, so the last picture cannot be taken out. */
  const removable = Boolean(meta.multiple) && !meta.fixed && images.length > 1;

  const pick = (key: string | null) => {
    replacing.current = key;
    setProblem(null);
    inputRef.current?.click();
  };

  const accept = async (file: File | undefined) => {
    if (!file) return;

    // Read before the first await: nothing else can move the ref while the file
    // dialog is open, but it must not be read back across one either.
    const target = replacing.current;

    const invalid = await validateImageBatch([file], 1);
    if (invalid) {
      setProblem(invalid);
      return;
    }

    const key = target ?? nextKey(new Set(images.map((image) => image.key)));

    setUploading(key);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("slot", meta.slot);
      body.append("key", key);

      const result = await uploadSiteImageAction(body);
      if (result.error) {
        setProblem(result.message);
        return;
      }

      setImages((current) =>
        target
          ? current.map((image) =>
            image.key === key ? { ...image, src: result.data } : image,
          )
          : [...current, { key, src: result.data, alt: "", fit: "cover" }],
      );
    } finally {
      setUploading(null);
    }
  };

  const patch = (key: string, changes: Partial<SiteImage>) =>
    setImages((current) =>
      current.map((image) => (image.key === key ? { ...image, ...changes } : image)),
    );

  const save = () =>
    startTransition(async () => {
      setProblem(null);
      const result = await saveSiteImagesAction(meta.slot, { images });
      if (result.error) {
        setProblem(result.message);
        return;
      }
      toast.success(result.data);
      router.refresh();
    });

  const reset = () =>
    startTransition(async () => {
      setProblem(null);
      const result = await resetSiteImagesAction(meta.slot);
      if (result.error) {
        setProblem(result.message);
        return;
      }
      toast.success(result.data);
      router.refresh();
    });

  return (
    <section className="border-border-default bg-surface-page flex flex-col rounded-lg border p-4 sm:p-6">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-text-primary text-base font-semibold">{meta.label}</h3>
          <Badge variant={view.isCustom ? "default" : "secondary"}>
            {view.isCustom ? "Replaced" : "Original"}
          </Badge>
        </div>
        <p className="text-text-secondary max-w-[70ch] text-sm">{meta.description}</p>
        <p className="text-text-secondary text-xs">
          {meta.multiple
            ? meta.fixed
              ? `${capacity} images, replaced in place`
              : `${images.length} of up to ${capacity} images`
            : "One image"}
          {meta.guidance ? ` · ${meta.guidance}` : null}
          {` · ${ALLOWED_IMAGE_LABEL}, up to ${MAX_IMAGE_SIZE_MB}MB`}
        </p>
      </header>

      <ul className="mt-2 flex flex-col">
        {images.map((image, index) => (
          <SiteImageRow
            key={image.key}
            image={image}
            index={index}
            count={images.length}
            decorative={Boolean(meta.decorative)}
            removable={removable}
            uploading={uploading === image.key}
            disabled={busy}
            onChange={(changes) => patch(image.key, changes)}
            onReplace={() => pick(image.key)}
            onRemove={() =>
              setImages((current) =>
                current.filter((entry) => entry.key !== image.key),
              )
            }
          />
        ))}
      </ul>

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_IMAGE_ACCEPT}
        disabled={busy}
        aria-label={`Upload an image for ${meta.label}`}
        className="sr-only"
        onChange={(event) => {
          void accept(event.target.files?.[0]);
          // Let the same file be picked again after it has been replaced.
          event.target.value = "";
        }}
      />

      {problem ? (
        <p role="alert" className="mt-3 text-sm text-[#e11d48]">
          {problem}
        </p>
      ) : null}

      <footer className="mt-4 flex flex-wrap items-center gap-2">
        {meta.multiple && !meta.fixed ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy || images.length >= capacity}
            onClick={() => pick(null)}
          >
            <ImageUp aria-hidden />
            Add image
          </Button>
        ) : null}

        <span className="flex-1" />

        {view.isCustom ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy}
            onClick={reset}
            className="text-text-secondary hover:text-text-primary"
          >
            <RotateCcw aria-hidden />
            Restore original
          </Button>
        ) : null}

        {dirty ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy}
            onClick={() => setImages(view.images)}
          >
            Discard
          </Button>
        ) : null}

        <Button type="button" size="sm" disabled={busy || !dirty} onClick={save}>
          {pending ? "Saving…" : "Save"}
        </Button>
      </footer>
    </section>
  );
};

/**
 * The manage screen — a tab per page of the site, and the locations on that
 * page listed down it.
 *
 * Every tab's cards are mounted at once rather than per selection, so a draft
 * in one tab survives a look at another. There are a couple of dozen locations
 * in all, which is small enough for that to cost nothing.
 */
export const SiteImagesPanel = ({ slots }: { slots: SiteImageSlotView[] }) => {
  /** Only the pages that have a location declared on them. */
  const pages = siteImagePages.filter((page) =>
    slots.some((view) => view.meta.page === page.id),
  );

  const grouped = (page: string) => slots.filter((view) => view.meta.page === page);

  return (
    <Tabs defaultValue={pages[0]?.id} className="gap-6">
      <TabsList>
        {pages.map((page) => (
          <TabsTrigger key={page.id} value={page.id}>
            {page.title}
            <span className="text-text-secondary text-xs">
              {grouped(page.id).length}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>

      {pages.map((page) => (
        <TabsContent key={page.id} value={page.id} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-text-secondary max-w-[70ch] text-sm">
              {page.description}
            </p>
            <p className="text-text-secondary text-xs">
              {page.paths.length > 1 ? "Drawn on " : "At "}
              {page.paths.join(", ")}
            </p>
          </div>

          {grouped(page.id).map((view) => (
            <SiteImageCard key={view.meta.slot} view={view} />
          ))}
        </TabsContent>
      ))}
    </Tabs>
  );
};
