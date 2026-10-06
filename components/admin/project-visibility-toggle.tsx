"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { ActionResult } from "@/lib/action-result";

/**
 * Show or hide one project without opening it. The switch reflects the row that
 * was rendered and the action writes the single column, so holding a project
 * back never waits on the rest of the form validating.
 *
 * The server owns the truth: nothing is flipped optimistically, the refresh
 * redraws from what was written, and a failure leaves the switch where it was.
 *
 * The action arrives as a prop rather than imported: each console section owns
 * its own, so this one switch serves both without knowing which it is driving.
 */
export const ProjectVisibilityToggle = ({
  slug,
  name,
  isActive,
  onToggle,
  withLabel = false,
}: {
  slug: string;
  name: string;
  isActive: boolean;
  /** The section's own visibility action, bound to nothing but the slug. */
  onToggle: (slug: string, isActive: boolean) => Promise<ActionResult<string>>;
  /** The record screen prints the state beside it; the table has a column. */
  withLabel?: boolean;
}) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const onChange = (checked: boolean) =>
    startTransition(async () => {
      const result = await onToggle(slug, checked);

      if (result.error) {
        toast.error(result.message);
        return;
      }

      toast.success(result.data);
      router.refresh();
    });

  return (
    <div className="flex items-center gap-2.5">
      <Switch
        id={`visible-${slug}`}
        checked={isActive}
        disabled={pending}
        onCheckedChange={onChange}
        aria-label={`${isActive ? "Hide" : "Show"} ${name}`}
      />
      {withLabel ? (
        <Label htmlFor={`visible-${slug}`} className="text-text-secondary text-sm">
          {isActive ? "Showing on the site" : "Hidden from the site"}
        </Label>
      ) : null}
    </div>
  );
};
