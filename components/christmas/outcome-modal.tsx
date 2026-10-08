"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { objectFit, type SiteImage } from "@/lib/site-image-slots";

/** Which of the two panels the frames draw. */
export type Outcome = "received" | "duplicate";

const panels: Record<Outcome, { title: string; body: string }> = {
  received: {
    title: "Your Christmas Consultation Request Has Been Received.",
    body: "Thank you for considering JEMAI for your Christmas setting. Our team will review the spaces you selected and contact you within 24 hours to discuss your brief, confirm availability and arrange the next steps, including quotation and payment.",
  },
  duplicate: {
    title: "We Already Have A Request From This Email.",
    body: "Only one Christmas consultation request can be accepted per email address for this campaign. If you submitted successfully, our team will contact you within 24 hours. Please contact JEMAI if you need to amend your request.",
  },
};

type OutcomeModalProps = {
  /** `null` closes it — the caller holds which panel is showing. */
  outcome: Outcome | null;
  onOpenChange: (open: boolean) => void;
  /** The left pane. Both outcomes share it, so the caller reads it once. */
  photograph: SiteImage;
};

/**
 * The campaign's closing panel, on the same 1120 × 563 two-pane wrapper the
 * exhibition register modal uses: a 544px photograph and a 576px panel padded
 * 48px all round. Both outcomes share the geometry and differ only in copy.
 */
export const OutcomeModal = ({
  outcome,
  onOpenChange,
  photograph,
}: OutcomeModalProps) => {
  const panel = outcome ? panels[outcome] : null;

  return (
    <Dialog open={Boolean(outcome)} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-140.75 w-[min(1120px,calc(100vw-2rem))] max-w-none overflow-hidden max-lg:h-auto max-lg:max-h-[calc(100dvh-2rem)] max-lg:overflow-y-auto">
        <div className="bg-surface-inverse relative hidden w-136 shrink-0 lg:block">
          <Image
            src={photograph.src}
            alt=""
            aria-hidden
            fill
            sizes="544px"
            className={objectFit(photograph.fit)}
          />
        </div>

        <div className="bg-surface-page relative flex-1 overflow-y-auto p-8 lg:p-12">
          <DialogClose asChild>
            <Button
              type="button"
              variant="quiet"
              aria-label="Close"
              className="border-border-default text-icon-primary absolute top-8 right-8 size-10 rounded-full border lg:top-12 lg:right-12"
            >
              <X className="size-3.5" />
            </Button>
          </DialogClose>

          <Image
            src="/figma/brand/badge-logo.svg"
            alt=""
            aria-hidden
            width={60}
            height={62}
            unoptimized
            className="mt-1 h-15.5 w-15"
          />

          <DialogTitle className="text-2xl mt-7.25 max-w-120 leading-snug sm:text-h3">
            {panel?.title}
          </DialogTitle>

          <DialogDescription className="text-body text-text-secondary mt-5.75 max-w-120">
            {panel?.body}
          </DialogDescription>

          <DialogClose asChild>
            <Button variant="jemai" size="cta" className="mt-6.75">
              Return To JEMAI
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};
