"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { X } from "lucide-react";
import { toast } from "sonner";

import { FileDrop } from "@/components/admin/file-drop";
import {
  FieldHint,
  FieldLabel,
  FormSection,
  fieldChrome,
} from "@/components/admin/form-section";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { ActionResult } from "@/lib/action-result";
import { slugify, type ContentAsset } from "@/lib/admin/content";
import { MAX_PROJECT_IMAGES } from "@/lib/constants";
import { projectKindDetails, type ProjectKind } from "@/lib/project-kinds";
import { cn } from "@/lib/utils";

/**
 * An uploaded shot plus the alt text written for it. The picker works in bare
 * `ContentAsset`s, so the alt lives alongside and is carried back across every
 * reorder by `id` — see `onImages`.
 */
export type ProjectAssetValues = ContentAsset & { alt: string; };

export type ProjectFormValues = {
  name: string;
  slug: string;
  meta: string;
  summary: string;
  description: string;
  images: ProjectAssetValues[];
  isActive: boolean;
};

export const emptyProjectForm: ProjectFormValues = {
  name: "",
  slug: "",
  meta: "",
  summary: "",
  description: "",
  images: [],
  // A new project starts hidden: it is written up over several sittings, and
  // nothing half-finished should appear on the site in the meantime.
  isActive: false,
};

type ProjectFormProps = {
  /** Which section this form is serving — it supplies the paths and the copy. */
  kind: ProjectKind;
  project?: ProjectFormValues;
  action: (
    values: ProjectFormValues,
  ) => Promise<ActionResult<{ slug: string; name: string; }>>;
  cancelHref: string;
  submitLabel: string;
  heading: string;
};

const required = (message: string) => ({
  required: message,
  validate: (value: string) => value.trim().length > 0 || message,
});

export const ProjectForm = ({
  kind,
  project,
  action,
  cancelHref,
  submitLabel,
  heading,
}: ProjectFormProps) => {
  const router = useRouter();
  const details = projectKindDetails[kind];
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState<string | null>(null);
  // On an existing project the slug is already settled, so it stops tracking
  // the name; on a new one it follows until the author edits it by hand.
  const [slugLocked, setSlugLocked] = useState(Boolean(project));

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<ProjectFormValues>({
    mode: "onChange",
    defaultValues: project ?? emptyProjectForm,
  });

  const images = useWatch({ control, name: "images" });
  const isActive = useWatch({ control, name: "isActive" });

  /**
   * The picker hands back `ContentAsset`s — it adds, removes and reorders them
   * but knows nothing about alt text. Each row's alt is looked back up by `id`,
   * so dragging a shot up the list takes its caption with it, and a shot just
   * uploaded starts without one.
   */
  const onImages = (next: ContentAsset[]) =>
    setValue(
      "images",
      next.map((asset) => ({
        ...asset,
        alt: images.find((held) => held.id === asset.id)?.alt ?? "",
      })),
      { shouldValidate: true },
    );

  const onSubmit = handleSubmit((values) => {
    setFailed(null);
    startTransition(async () => {
      const result = await action(values);

      if (result.error) {
        // Twice over: the toast carries it past a long form's scroll position,
        // the inline line keeps it in front of the reader while they fix it.
        setFailed(result.message);
        toast.error(result.message);
        return;
      }

      toast.success(`${result.data.name} saved`);
      // The detail screen renders on the server from the row this just wrote,
      // so the cached one it would otherwise land on has to go first.
      router.refresh();
      router.push(`${details.basePath}/${result.data.slug}`);
    });
  });

  return (
    <form
      onSubmit={onSubmit}
      className="border-border-default bg-background rounded-xl border"
    >
      <div className="border-border-default bg-background sticky top-16 z-10 flex items-center justify-between gap-4 border-b p-4">
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          asChild
          aria-label="Close without saving"
          className="border-border-default"
        >
          <Link href={cancelHref}>
            <X />
          </Link>
        </Button>
        <Button
          type="submit"
          size="lg"
          disabled={!isValid || pending}
          className="h-11 px-5 text-sm disabled:bg-action-primary/32 disabled:opacity-100"
        >
          {pending ? "Saving…" : submitLabel}
        </Button>
      </div>

      <div className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-175 flex-col gap-8">
          <h1 className="text-text-primary font-heading text-3xl sm:text-4xl">{heading}</h1>

          {failed ? (
            <p role="alert" className="text-[#e11d48] text-sm">
              {failed}
            </p>
          ) : null}

          <Accordion type="multiple" defaultValue={["basics", "visibility"]}>
            <FormSection
              value="basics"
              title="Project basics"
              required
              description="The name is all that is needed to save. Everything else can follow."
            >
              <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <FieldLabel htmlFor="name" required>
                    Project name
                  </FieldLabel>
                  <Input
                    id="name"
                    placeholder={details.namePlaceholder}
                    className={cn(fieldChrome, "h-11 text-sm md:text-sm")}
                    {...register("name", {
                      ...required("A project name is required."),
                      onChange: (event) => {
                        if (!slugLocked) setValue("slug", slugify(event.target.value));
                      },
                    })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <FieldLabel htmlFor="slug">Slug</FieldLabel>
                  <div
                    className={cn(
                      fieldChrome,
                      "focus-within:border-ring flex h-11 items-center gap-1 border px-3",
                    )}
                  >
                    <span aria-hidden className="text-text-secondary text-sm">
                      /
                    </span>
                    <Input
                      id="slug"
                      className="h-full flex-1 rounded-none border-0 bg-transparent px-0 text-sm focus-visible:ring-0 md:text-sm"
                      {...register("slug", { onChange: () => setSlugLocked(true) })}
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <FieldHint error={errors.name?.message}>
                    The name the card prints, and the title of the lightbox it opens.
                  </FieldHint>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <FieldLabel htmlFor="meta">Discipline &amp; location</FieldLabel>
                  <Input
                    id="meta"
                    placeholder={details.metaPlaceholder}
                    className={cn(fieldChrome, "h-11 text-sm md:text-sm")}
                    {...register("meta")}
                  />
                  <FieldHint>{details.metaHint}</FieldHint>
                </div>
                <div className="flex flex-col gap-1.5">
                  <FieldLabel htmlFor="summary">Short summary</FieldLabel>
                  <Input
                    id="summary"
                    className={cn(fieldChrome, "h-11 text-sm md:text-sm")}
                    {...register("summary")}
                  />
                  <FieldHint>
                    {"One line under the name on the card.\nLeave it empty to let the photograph speak."}
                  </FieldHint>
                </div>
              </div>
            </FormSection>

            <FormSection
              value="description"
              title="Project description"
              description="The paragraph the lightbox prints beside the photographs."
            >
              <Textarea
                id="description"
                rows={10}
                className={cn(fieldChrome, "min-h-60 text-sm md:text-sm")}
                {...register("description")}
              />
            </FormSection>

            <FormSection
              value="images"
              title="Photography"
              description="The first shot is the card. Drag to reorder — the lightbox walks them in this order."
            >
              <FileDrop
                label="Project photography"
                multiple
                reorderable
                max={MAX_PROJECT_IMAGES}
                assets={images}
                onChange={onImages}
              />

              {/* Alt text per shot, beside the row it describes. A room is not
                  described by its file name, so it is written rather than
                  derived — and a blank one falls back to the project's name on
                  save instead of reaching the page empty. */}
              {images.length ? (
                <div className="mt-6 flex flex-col gap-4">
                  <FieldLabel>Alt text</FieldLabel>
                  {images.map((image, index) => (
                    <div key={image.id} className="flex items-center gap-3">
                      {/* A Cloudinary URL at 40px, one per shot — a plain img
                          rather than that many optimiser round trips. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.src}
                        alt=""
                        className="bg-surface-subtle size-10 shrink-0 rounded-md object-cover"
                      />
                      <Input
                        value={image.alt}
                        placeholder={`Shot ${index + 1} — e.g. “Living area at ${details.namePlaceholder}”`}
                        aria-label={`Alt text for ${image.name}`}
                        onChange={(event) =>
                          setValue(`images.${index}.alt`, event.target.value, {
                            shouldValidate: true,
                          })
                        }
                        className={cn(fieldChrome, "h-10 text-sm md:text-sm")}
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </FormSection>

            <FormSection
              value="visibility"
              title="Visibility"
              description={`Whether ${details.shownOn} draws this ${details.noun}.`}
            >
              <div className="flex items-center gap-3">
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={(checked) =>
                    setValue("isActive", checked, { shouldValidate: true })
                  }
                />
                <Label htmlFor="isActive" className="text-text-primary text-sm">
                  {isActive ? "Showing on the site" : "Hidden from the site"}
                </Label>
              </div>
              <FieldHint>
                {isActive
                  ? `It appears on ${details.shownOn} as soon as this is saved.`
                  : "It stays in the console only. Turn this on when the write-up and the photography are ready."}
              </FieldHint>
            </FormSection>
          </Accordion>
        </div>
      </div>
    </form>
  );
};
