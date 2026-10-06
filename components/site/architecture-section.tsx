import type { ReactNode } from "react";
import { SectionIntro } from "@/components/site/section-intro";
import { ConsultationCta } from "@/components/site/consultation-cta";
import { SpacesCarousel } from "@/components/site/spaces-carousel";
import { listActiveProjects } from "@/lib/projects";
import { cn } from "@/lib/utils";

type ArchitectureSectionProps = {
  eyebrow?: string;
  heading?: ReactNode;
  copy?: ReactNode;
  variant?: "section" | "page";
};

export const ArchitectureSection = async ({
  eyebrow = "05 / JEMAI Designs",
  heading = "Spaces Shaped by Purpose, Personality and Space",
  copy = "From private homes to public spaces, discover environments shaped around the people, purpose and possibilities within them.",
  variant = "section",
}: ArchitectureSectionProps) => {
  const isPage = variant === "page";
  // Only what the console has turned on, in the order it arranged. A project
  // still short of its photography is left out of this list entirely.
  const projects = await listActiveProjects("design");

  return (
    <section
      className={cn(
        "flex w-full flex-col items-center gap-stack-loose",
        isPage ? "pt-2" : "pt-8 lg:pt-16",
      )}
    >
      <div className="flex w-full max-w-432 flex-col gap-stack-loose px-4 sm:px-6 lg:px-page-gutter">
        {!isPage && <hr className="border-border-strong w-full border-t-3" />}
        <div className="flex w-full flex-col items-center py-8">
          <SectionIntro
            className="max-w-270 gap-2.5"
            eyebrow={eyebrow}
            heading={heading}
            /* The consultation frame typesets this one at 50px on a 56px line —
               larger than `text-h2`, because there it is the page title. */
            headingAs={isPage ? "h1" : "h2"}
            headingClassName={
              isPage ? "text-4xl sm:text-5xl lg:text-[50px] lg:leading-14" : undefined
            }
            copy={copy}
          />
        </div>
      </div>

      {/* Featured spaces — a carousel that runs off the right edge of the page.
          With nothing to show it draws nothing: an empty rail under a heading
          reads as a broken page rather than as an empty portfolio. */}
      {projects.length ? <SpacesCarousel projects={projects} /> : null}

      {!isPage && <ConsultationCta />}
    </section>
  );
};
