"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { Plus, Trash2, Wand2, X } from "lucide-react";
import { toast } from "sonner";

import {
  FieldHint,
  FieldLabel,
  FormSection,
  fieldChrome,
} from "@/components/admin/form-section";
import { FileDrop } from "@/components/admin/file-drop";
import { TokenInput } from "@/components/admin/token-input";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ActionResult } from "@/lib/action-result";
import { slugify, type ContentAsset } from "@/lib/admin/content";
import { cn } from "@/lib/utils";

export type FurnitureFormValues = {
  name: string;
  slug: string;
  category: string;
  price: string;
  stock: string;
  summary: string;
  variants: { size: string; colour: string; price: string; quantity: string; }[];
  description: string;
  timeline: string;
  customization: string;
  thumbnail: ContentAsset[];
  media: ContentAsset[];
};

export const emptyFurnitureForm: FurnitureFormValues = {
  name: "",
  slug: "",
  category: "",
  price: "",
  stock: "",
  summary: "",
  variants: [{ size: "", colour: "", price: "", quantity: "" }],
  description: "",
  timeline: "",
  customization: "",
  thumbnail: [],
  media: [],
};

type FurnitureFormProps = {
  /**
   * Absent on the create screen. Supplied, the same form edits that product —
   * the fields, the validation and the submit path are identical, only the
   * defaults, the heading and the action differ.
   */
  furniture?: FurnitureFormValues;
  categories: string[];
  /**
   * Server action. Hands back the saved product's slug — which the create
   * screen does not know in advance, and an edit can change — and this form
   * does the navigating, so a rejected save can stay on the filled-in fields.
   */
  action: (
    values: FurnitureFormValues,
  ) => Promise<ActionResult<{ slug: string; name: string; }>>;
  /** Where the close button goes, and where a cancelled edit returns to. */
  cancelHref: string;
  submitLabel: string;
  heading: string;
};

const required = (message: string) => ({
  required: message,
  validate: (value: string) => value.trim().length > 0 || message,
});

type VariantRow = FurnitureFormValues["variants"][number];

const emptyVariant: VariantRow = { size: "", colour: "", price: "", quantity: "" };

/** Identifies a combination, so generating twice cannot duplicate a row. */
const variantKey = (size: string, colour: string) =>
  `${size.trim().toLowerCase()}|${colour.trim().toLowerCase()}`;

/** The distinct entries of a column, in the order they first appear. */
const uniqueTokens = (values: (string | undefined)[]) => {
  const seen = new Set<string>();
  const tokens: string[] = [];

  for (const value of values) {
    const token = value?.trim();
    if (!token || seen.has(token.toLowerCase())) continue;
    seen.add(token.toLowerCase());
    tokens.push(token);
  }

  return tokens;
};

/** A row is worth keeping if the author has put anything at all in it. */
const isFilled = (variant: Partial<VariantRow> | undefined) =>
  Boolean(
    variant?.size?.trim() ||
    variant?.colour?.trim() ||
    variant?.price?.trim() ||
    variant?.quantity?.trim()
  );

export const FurnitureForm = ({
  furniture,
  categories,
  action,
  cancelHref,
  submitLabel,
  heading,
}: FurnitureFormProps) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState<string | null>(null);
  // On an existing product the slug is already settled, so it stops tracking
  // the name; on a new one it follows until the author edits it by hand.
  const [slugLocked, setSlugLocked] = useState(Boolean(furniture));

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<FurnitureFormValues>({
    mode: "onChange",
    defaultValues: furniture ?? emptyFurnitureForm,
  });

  const variants = useFieldArray({ control, name: "variants" });
  const watchedVariants = useWatch({ control, name: "variants" });
  const thumbnail = useWatch({ control, name: "thumbnail" });
  const media = useWatch({ control, name: "media" });
  const category = useWatch({ control, name: "category" });
  const stock = useWatch({ control, name: "stock" });
  const price = useWatch({ control, name: "price" });

  /**
   * Stock is the sum of the variant counts whenever any are filled in, so the
   * General information field goes read-only rather than offering a second,
   * conflicting answer. A product with no counted variants keeps its own number.
   */
  const variantStock = (watchedVariants ?? []).reduce(
    (sum, variant) => sum + (Number(variant?.quantity) || 0),
    0
  );
  const stockDerived = (watchedVariants ?? []).some((variant) => variant?.quantity?.trim());

  const [colours, setColours] = useState(() =>
    uniqueTokens((furniture?.variants ?? []).map((variant) => variant.colour))
  );
  const [sizes, setSizes] = useState(() =>
    uniqueTokens((furniture?.variants ?? []).map((variant) => variant.size))
  );

  const combinations = colours.flatMap((colour) =>
    (sizes.length ? sizes : [""]).map((size) => ({ size, colour }))
  );

  const existingKeys = new Set(
    (watchedVariants ?? [])
      .filter((variant) => variant?.colour?.trim() || variant?.size?.trim())
      .map((variant) => variantKey(variant?.size ?? "", variant?.colour ?? ""))
  );

  const fresh = combinations.filter(
    (combination) => !existingKeys.has(variantKey(combination.size, combination.colour))
  );

  const sizeCount = sizes.length || 1;
  const builderHint = !colours.length
    ? "Add at least one colour to generate."
    : !fresh.length
      ? "Every combination is already in the table."
      : `${colours.length} ${colours.length === 1 ? "colour" : "colours"} × ${sizeCount} ${sizeCount === 1 ? "size" : "sizes"}${combinations.length > fresh.length
        ? ` · ${combinations.length - fresh.length} already added`
        : ""
      }`;

  const generate = () => {
    if (!fresh.length) return;

    const kept = (watchedVariants ?? []).filter(isFilled).map((variant) => ({
      ...emptyVariant,
      ...variant,
    }));

    variants.replace([
      ...kept,
      ...fresh.map((combination) => ({ ...emptyVariant, ...combination })),
    ]);
    toast.success(`${fresh.length} ${fresh.length === 1 ? "variant" : "variants"} added`);
  };

  const onSubmit = handleSubmit((values) => {
    setFailed(null);
    startTransition(async () => {
      const result = await action({
        ...values,
        stock: stockDerived ? String(variantStock) : values.stock,
      });

      if (result.error) {
        setFailed(result.message);
        toast.error(result.message);
        return;
      }

      toast.success(`${result.data.name} saved`);
      // The detail screen renders on the server from the row this just wrote,
      // so the cached one it would otherwise land on has to go first.
      router.refresh();
      router.push(`/admin/furniture/${result.data.slug}`);
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
          <h1 className="text-text-primary text-2xl font-semibold">{heading}</h1>

          {failed ? (
            <p role="alert" className="text-[#e11d48] text-sm">
              {failed}
            </p>
          ) : null}

          <Accordion type="multiple" defaultValue={["general"]}>
            <FormSection
              value="general"
              title="General information"
              required
              description="To start selling, all you need is a name and a price."
            >
              <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <FieldLabel htmlFor="name" required>
                    Product name
                  </FieldLabel>
                  <Input
                    id="name"
                    className={cn(fieldChrome, "h-11 text-sm md:text-sm")}
                    {...register("name", {
                      ...required("A product name is required."),
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
                      "focus-within:border-ring flex h-11 items-center gap-1 border px-3"
                    )}
                  >
                    <span aria-hidden className="text-text-secondary text-sm">
                      /
                    </span>
                    <Input
                      id="slug"
                      className="h-full flex-1 rounded-none border-0 bg-transparent px-0 text-sm focus-visible:ring-0 md:text-sm"
                      {...register("slug", {
                        onChange: () => setSlugLocked(true),
                      })}
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <FieldHint error={errors.name?.message}>
                    {"Give your product a short and clear title.\n50-60 characters is the recommended length for search engines."}
                  </FieldHint>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-1.5 sm:max-w-[calc(50%-0.75rem)]">
                <FieldLabel htmlFor="category">Category</FieldLabel>
                <Select
                  value={category}
                  onValueChange={(value) => setValue("category", value, { shouldValidate: true })}
                >
                  <SelectTrigger id="category" className={cn(fieldChrome, "h-11 w-full text-sm")}>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <FieldLabel htmlFor="price" required>
                    Price
                  </FieldLabel>
                  <Input
                    id="price"
                    inputMode="numeric"
                    placeholder="0"
                    className={cn(fieldChrome, "h-11 text-sm md:text-sm")}
                    {...register("price", {
                      required: "A price is required.",
                      validate: (value) =>
                        (Number(value) > 0 && Number.isFinite(Number(value))) ||
                        "Enter a price in whole naira.",
                    })}
                  />
                  <FieldHint error={errors.price?.message} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <FieldLabel htmlFor="stock">Stock quantity</FieldLabel>
                  {/* Controlled for its whole life: swapping between the typed
                      value and the derived total on a `register`-only input
                      would flip it from uncontrolled to controlled mid-edit. */}
                  <Input
                    id="stock"
                    inputMode="numeric"
                    placeholder="0"
                    readOnly={stockDerived}
                    className={cn(
                      fieldChrome,
                      "h-11 text-sm md:text-sm",
                      stockDerived && "text-text-secondary"
                    )}
                    {...register("stock")}
                    value={stockDerived ? String(variantStock) : (stock ?? "")}
                  />
                  <FieldHint>
                    {stockDerived
                      ? "Summed from the variant quantities below."
                      : "Add variants below to track stock per combination."}
                  </FieldHint>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-1.5">
                <FieldLabel htmlFor="summary" required>
                  Product summary
                </FieldLabel>
                <Textarea
                  id="summary"
                  rows={3}
                  className={cn(fieldChrome, "min-h-20 text-sm md:text-sm")}
                  {...register("summary", required("A product summary is required."))}
                />
                <FieldHint error={errors.summary?.message}>
                  {"Give your product a short and clear description.\n120-160 characters is the recommended length for search engines."}
                </FieldHint>
              </div>
            </FormSection>

            <FormSection
              value="variants"
              title="Variants"
              required
              description="Add variations of this product. Each row is one buyable combination — its size, its colour, what it costs and how many are in stock. Generate them all from a list of colours and sizes, then fill in the price and quantity."
            >
              <div className="border-border-default bg-admin-field mb-6 flex flex-col gap-4 rounded-lg border p-4">
                <p className="text-text-primary text-sm font-semibold">
                  Build the combinations
                </p>
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <FieldLabel htmlFor="variant-colours" required>
                      Colours
                    </FieldLabel>
                    <TokenInput
                      id="variant-colours"
                      label="Colours"
                      values={colours}
                      onChange={setColours}
                      placeholder="Walnut, Oak, Ash"
                      className="bg-background"
                    />
                    <FieldHint>Press Enter or type a comma after each one.</FieldHint>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <FieldLabel htmlFor="variant-sizes">Sizes</FieldLabel>
                    <TokenInput
                      id="variant-sizes"
                      label="Sizes"
                      values={sizes}
                      onChange={setSizes}
                      placeholder="Small, Medium, Large"
                      className="bg-background"
                    />
                    <FieldHint>Leave empty if it comes in one size only.</FieldHint>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    disabled={!fresh.length}
                    onClick={generate}
                    className="border-border-default bg-background h-10"
                  >
                    <Wand2 data-icon="inline-start" />
                    {fresh.length
                      ? `Generate ${fresh.length} ${fresh.length === 1 ? "variant" : "variants"}`
                      : "Generate variants"}
                  </Button>
                  <p className="text-text-secondary text-xs">{builderHint}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {variants.fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="border-border-default grid grid-cols-1 items-end gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_1fr_8rem_7rem_auto]"
                  >
                    <div className="flex flex-col gap-1.5">
                      <FieldLabel htmlFor={`variant-size-${field.id}`}>Size</FieldLabel>
                      <Input
                        id={`variant-size-${field.id}`}
                        placeholder="Organic"
                        className={cn(fieldChrome, "h-10 text-sm md:text-sm")}
                        {...register(`variants.${index}.size` as const)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <FieldLabel htmlFor={`variant-colour-${field.id}`} required>
                        Colour
                      </FieldLabel>
                      <Input
                        id={`variant-colour-${field.id}`}
                        placeholder="Red"
                        className={cn(fieldChrome, "h-10 text-sm md:text-sm")}
                        {...register(
                          `variants.${index}.colour` as const,
                          required("Every variant needs a colour.")
                        )}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <FieldLabel htmlFor={`variant-price-${field.id}`}>Price</FieldLabel>
                      <Input
                        id={`variant-price-${field.id}`}
                        inputMode="numeric"
                        // Blank is the common case: the row sells at the price
                        // set in General information, which is what it shows.
                        placeholder={price?.trim() ? price : "Product price"}
                        className={cn(fieldChrome, "h-10 text-sm md:text-sm")}
                        {...register(`variants.${index}.price` as const, {
                          validate: (value) =>
                            !value?.trim() ||
                            (Number(value) > 0 && Number.isFinite(Number(value))) ||
                            "Enter a price in whole naira, or leave it blank.",
                        })}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <FieldLabel htmlFor={`variant-qty-${field.id}`} required>
                        Quantity
                      </FieldLabel>
                      <Input
                        id={`variant-qty-${field.id}`}
                        inputMode="numeric"
                        placeholder="0"
                        className={cn(fieldChrome, "h-10 text-sm md:text-sm")}
                        {...register(`variants.${index}.quantity` as const, {
                          required: "Required.",
                          validate: (value) =>
                            (Number.isInteger(Number(value)) && Number(value) >= 0) ||
                            "Whole numbers only.",
                        })}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-lg"
                      // The last row is the product's only variant; emptying the
                      // list would fail the section's own requirement.
                      disabled={variants.fields.length === 1}
                      onClick={() => variants.remove(index)}
                      aria-label={`Remove variant ${index + 1}`}
                      className="text-text-secondary hover:text-[#e11d48] justify-self-start sm:justify-self-auto"
                    >
                      <Trash2 />
                    </Button>
                    {errors.variants?.[index] ? (
                      <div className="sm:col-span-5">
                        <FieldHint
                          error={
                            errors.variants[index]?.colour?.message ??
                            errors.variants[index]?.price?.message ??
                            errors.variants[index]?.quantity?.message
                          }
                        />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => variants.append(emptyVariant)}
                className="border-border-default mt-4 h-10"
              >
                <Plus data-icon="inline-start" />
                Add more
              </Button>
            </FormSection>

            <FormSection
              value="thumbnail"
              title="Thumbnail"
              description="Used to represent your product during checkout, social sharing and more."
            >
              <FileDrop
                label="Thumbnail image"
                assets={thumbnail}
                onChange={(assets) => setValue("thumbnail", assets, { shouldValidate: true })}
              />
            </FormSection>

            <FormSection
              value="media"
              title="Media"
              description="Used to represent your product during checkout, social sharing and more."
            >
              <FileDrop
                label="Product media"
                multiple
                reorderable
                assets={media}
                onChange={(assets) => setValue("media", assets, { shouldValidate: true })}
              />
            </FormSection>

            <FormSection
              value="related"
              title="Related content"
              description="To start selling, all you need is a name and a price."
            >
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-1.5">
                  <FieldLabel htmlFor="description" required>
                    Description
                  </FieldLabel>
                  <Textarea
                    id="description"
                    rows={3}
                    className={cn(fieldChrome, "min-h-20 text-sm md:text-sm")}
                    {...register("description", required("A description is required."))}
                  />
                  <FieldHint error={errors.description?.message} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <FieldLabel htmlFor="timeline" required>
                    Production / delivery timeline
                  </FieldLabel>
                  <Textarea
                    id="timeline"
                    rows={3}
                    className={cn(fieldChrome, "min-h-20 text-sm md:text-sm")}
                    {...register("timeline", required("A timeline is required."))}
                  />
                  <FieldHint error={errors.timeline?.message} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <FieldLabel htmlFor="customization" required>
                    Customization
                  </FieldLabel>
                  <Textarea
                    id="customization"
                    rows={3}
                    className={cn(fieldChrome, "min-h-20 text-sm md:text-sm")}
                    {...register("customization", required("A customization note is required."))}
                  />
                  <FieldHint error={errors.customization?.message}>
                    {"Give your product a short and clear description.\n120-160 characters is the recommended length for search engines."}
                  </FieldHint>
                </div>
              </div>
            </FormSection>
          </Accordion>
        </div>
      </div>
    </form>
  );
};
