import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { objectFit } from "@/lib/site-image-slots";
import { siteImage } from "@/lib/site-images";
import { cn } from "@/lib/utils";

type ConsultationCtaProps = {
  panelClassName?: string;
  className?: string;
};

export const ConsultationCta = async ({
  panelClassName = "lg:w-140",
  className,
}: ConsultationCtaProps) => {
  const photograph = await siteImage("shared.consultation-cta");

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-page-gutter lg:py-0",
        className,
      )}
    >
      <div className="flex w-full max-w-432 flex-col justify-center lg:flex-row lg:items-stretch">
        <div
          className={cn(
            "bg-surface-subtle flex flex-col items-start justify-between gap-stack-loose overflow-hidden p-6 sm:p-stack-loose lg:shrink-0",
            panelClassName,
          )}
        >
          <p className="text-eyebrow-lg max-w-125 uppercase text-[#ad3a00]">
            Begin A Project
          </p>
          <div className="flex flex-col items-start gap-stack-default">
            <div className="flex flex-col items-start gap-stack-compact">
              <h2 className="font-heading text-text-primary max-w-111.25 text-3xl font-bold leading-tight sm:text-h2">
                Let&rsquo;s Shape A Space That Feels Entirely Your Own.
              </h2>
              <p className="text-body-lg max-w-93.75 text-[#6d6d6d]">
                From an individual room to a complete property, JEMAI brings architecture, interiors, furniture and art together in one thoughtful process.
              </p>
            </div>
            <Button asChild size="cta" className="px-6">
              <Link href="/consultation">Request a consultation</Link>
            </Button>
          </div>
        </div>

        <div className="relative h-70 w-full overflow-hidden sm:h-90 lg:h-111.25 lg:flex-1">
          <Image
            src={photograph.src}
            alt={photograph.alt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className={objectFit(photograph.fit)}
          />
          <div aria-hidden className="absolute inset-0 bg-[rgba(19,19,19,0.1)]" />
        </div>
      </div>
    </div>
  );
};
