import { Eyebrow } from "@/components/site/eyebrow";
import { SpacesCarousel } from "@/components/site/spaces-carousel";
import { listActiveProjects } from "@/lib/projects";

type FestiveProjectsProps = {
  eyebrow: string;
  /** One line per element — the frame breaks the heading by hand. */
  heading: string[];
  copy: string;
};

/**
 * Seasons JEMAI has already styled, on the same rail and in the same lightbox
 * as the design projects — they are the same records, kept apart by their kind.
 *
 * The section sits between the services and the request form because that is
 * what it is for: a visitor reads the proof after hearing what is offered and
 * before being asked for anything. With nothing to show it draws nothing at
 * all, which is the first season's state and must not read as a broken page.
 */
export const FestiveProjects = async ({ eyebrow, heading, copy }: FestiveProjectsProps) => {
  const projects = await listActiveProjects("christmas");
  if (!projects.length) return null;

  return (
    <section className="border-border-strong w-full overflow-hidden border-t pt-14 pb-16 lg:pt-19 lg:pb-22.5">
      <div className="px-4 sm:px-6 lg:px-page-gutter">
        <div className="mx-auto grid w-full max-w-432 gap-6 lg:grid-cols-[720fr_556fr] lg:gap-5 lg:px-4">
          <div>
            <Eyebrow>{eyebrow}</Eyebrow>
            <h2 className="font-heading text-text-primary mt-2.5 text-3xl sm:text-h2">
              {heading.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>
          </div>
          <p className="text-body text-text-secondary lg:pt-6.25">{copy}</p>
        </div>
      </div>

      {/* The rail runs off the right edge, as every other one on the site does */}
      <div className="mt-10 lg:mt-18.5">
        <SpacesCarousel
          projects={projects}
          label="Christmas settings JEMAI has styled"
          noun="festive settings"
        />
      </div>
    </section>
  );
};
