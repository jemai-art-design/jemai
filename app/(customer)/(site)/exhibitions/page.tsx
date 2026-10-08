import type { Metadata } from "next";
import { ExhibitionCard } from "@/components/exhibitions/exhibition-card";
import { ExhibitionHero } from "@/components/exhibitions/exhibition-hero";
import { ExhibitionTabs } from "@/components/exhibitions/exhibition-tabs";
import { UpNext } from "@/components/exhibitions/up-next";
import {
  getUpNext,
  listUpcomingExhibitions,
  upcomingHero,
} from "@/lib/exhibitions";

export const metadata: Metadata = {
  title: "Upcoming Exhibitions | JEMAI",
  description:
    "What is opening next at JEMAI — the gallery's upcoming presentations of contemporary painting, sculpture and fibre.",
};

/**
 * An exhibition's status is derived from its run, so this page's content can go
 * out of date with nothing having been written — the day simply turns. Hourly
 * revalidation is what moves a show that closed overnight without waiting for
 * an author to save something.
 */
export const revalidate = 3600;

const UpcomingExhibitionsPage = async () => {
  const [upcoming, upNext] = await Promise.all([
    listUpcomingExhibitions(),
    getUpNext(),
  ]);

  // Everything except the show already featured above.
  const comingSoon = upcoming.filter((entry) => entry.slug !== upNext?.slug);

  return (
    <div className="flex w-full flex-col pb-3">
      {/* The Nav frame closes on the same 3px rule every section opens with. */}
      <div className="w-full px-4 sm:px-6 lg:px-page-gutter">
        <hr className="border-border-strong mx-auto w-full max-w-432 border-t-3" />
      </div>

      <div className="mt-2">
        <ExhibitionHero slides={await upcomingHero()} />
      </div>

      <div className="mt-16">
        <ExhibitionTabs active="upcoming" />
      </div>

      {upNext ? (
        <div className="mt-7.5">
          <UpNext exhibition={upNext} />
        </div>
      ) : null}

      {/* Eyebrow with a hairline running out to the gutter — the same kicker the
          catalogue sections use. */}
      <section className="mt-14.5 w-full px-4 sm:px-6 lg:px-page-gutter">
        <div className="mx-auto w-full max-w-432">
          <div className="flex items-center gap-6">
            <h2 className="text-eyebrow text-text-primary shrink-0 uppercase">
              Coming soon
            </h2>
            <span aria-hidden className="border-border-default w-full border-t" />
          </div>

          {/* Three tracks on a 40px gutter; the frame fills only two. */}
          {comingSoon.length ? (
            <ul className="mt-5.5 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {comingSoon.map((exhibition) => (
                <li key={exhibition.slug}>
                  <ExhibitionCard exhibition={exhibition} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-body text-text-secondary mt-5.5">
              Nothing else is scheduled just yet — the next opening is above.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default UpcomingExhibitionsPage;
