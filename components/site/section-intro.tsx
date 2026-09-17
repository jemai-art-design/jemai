import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/site/eyebrow";
import { cn } from "@/lib/utils";

type SectionIntroProps = {
  eyebrow: string;
  /** type/desktop/numeral/editorial — the oversized count some sections lead with. */
  numeral?: string;
  heading: ReactNode;
  /** A band that opens a page carries its h1; a band inside one carries an h2. */
  headingAs?: "h1" | "h2";
  headingClassName?: string;
  copy: ReactNode;
  cta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  className?: string;
};

export const SectionIntro = ({
  eyebrow,
  numeral,
  heading,
  headingAs: Heading = "h2",
  headingClassName,
  copy,
  cta,
  secondaryCta,
  className,
}: SectionIntroProps) => (
  <div className={cn("flex w-full flex-col gap-2.5", className)}>
    <Eyebrow>{eyebrow}</Eyebrow>

    <div className="flex flex-col gap-stack-heading lg:flex-row lg:gap-7.5">
      <div className="flex flex-1 items-start gap-4">
        {numeral && (
          <span className="text-numeral text-text-primary font-sans shrink-0 pr-4 leading-[0.9]">
            {numeral}
          </span>
        )}
        <Heading
          className={cn(
            "font-heading text-text-primary flex-1 text-3xl font-bold leading-tight sm:text-h2",
            headingClassName,
          )}
        >
          {heading}
        </Heading>
      </div>

      <div className="flex flex-1 flex-col items-start gap-5">
        <p className="text-body text-text-secondary">{copy}</p>
        {(cta || secondaryCta) && (
          <div className="flex flex-wrap items-center gap-stack-default">
            {cta && (
              <Button asChild size="cta" className="min-w-37">
                <Link href={cta.href}>{cta.label}</Link>
              </Button>
            )}
            {secondaryCta && (
              <Link
                href={secondaryCta.href}
                className="text-label text-action-link whitespace-nowrap"
              >
                {secondaryCta.label}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
);
