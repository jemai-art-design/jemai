"use client";

import { useState } from "react";
import { X } from "lucide-react";

import { fieldChrome } from "@/components/admin/form-section";
import { cn } from "@/lib/utils";

type TokenInputProps = {
  id: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  /** Names the list for a screen reader — "Colours", "Sizes". */
  label: string;
  className?: string;
};

/**
 * A comma-or-Enter chip field. Used by the variant builder to collect the two
 * lists it multiplies together, so the author types a colour once instead of
 * once per row.
 */
export const TokenInput = ({
  id,
  values,
  onChange,
  placeholder,
  label,
  className,
}: TokenInputProps) => {
  const [draft, setDraft] = useState("");

  /**
   * Accepts a whole paste as well as a single entry: one commit can carry
   * "walnut, oak, ash". Matching is case-insensitive so the same colour typed
   * twice does not produce two rows that differ only in capitals.
   */
  const commit = (text: string) => {
    const taken = new Set(values.map((value) => value.toLowerCase()));
    const added: string[] = [];

    for (const part of text.split(",")) {
      const token = part.trim();
      if (!token) continue;
      if (taken.has(token.toLowerCase())) continue;
      taken.add(token.toLowerCase());
      added.push(token);
    }

    setDraft("");
    if (added.length) onChange([...values, ...added]);
  };

  const remove = (index: number) =>
    onChange(values.filter((_, position) => position !== index));

  return (
    <div
      className={cn(
        fieldChrome,
        "focus-within:border-ring flex min-h-11 flex-wrap items-center gap-1.5 border p-1.5",
        className
      )}
    >
      {values.map((value, index) => (
        <span
          key={value}
          className="border-border-default bg-background text-text-primary flex h-8 items-center gap-1 rounded-md border pr-1 pl-2.5 text-sm"
        >
          {value}
          <button
            type="button"
            onClick={() => remove(index)}
            aria-label={`Remove ${value} from ${label}`}
            className="text-text-secondary hover:text-text-primary flex size-6 items-center justify-center rounded-sm"
          >
            <X className="size-3.5" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        placeholder={values.length ? "" : placeholder}
        aria-label={label}
        onChange={(event) => {
          // A paste lands here rather than on keydown, so the separator is
          // handled in one place for both typing and pasting.
          if (event.target.value.includes(",")) return commit(event.target.value);
          setDraft(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            // Left alone this submits the product form.
            event.preventDefault();
            commit(draft);
            return;
          }
          if (event.key === "Backspace" && !draft && values.length)
            remove(values.length - 1);
        }}
        // Clicking Generate blurs the field first, so a typed-but-uncommitted
        // entry still counts towards the combinations.
        onBlur={() => commit(draft)}
        className="text-text-primary placeholder:text-text-secondary h-8 min-w-32 flex-1 bg-transparent px-1.5 text-sm outline-none"
      />
    </div>
  );
};
