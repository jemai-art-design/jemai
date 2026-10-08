import type { Metadata } from "next";
import { ExhibitionCard } from "@/components/exhibitions/exhibition-card";
import { ExhibitionHero } from "@/components/exhibitions/exhibition-hero";
import { ExhibitionTabs } from "@/components/exhibitions/exhibition-tabs";
import { listPastExhibitions, pastHero } from "@/lib/exhibitions";

export const metadata: Metadata = {
  title: "Past Exhibitions | JEMAI",
  description:
    "The JEMAI exhibition archive — presentations of contemporary painting, sculpture and fibre the gallery has staged.",
};

/**
 * An exhibition's status is derived from its run, so this page's content can go
 * out of date with nothing having been written — the day simply turns. Hourly
 * revalidation is what moves a show that closed overnight without waiting for
 * an author to save something.
 */
export const revalidate = 3600;

const PastExhibitionsPage = async () => {
  const exhibitions = await listPastExhibitions();

  return (
    <div className="flex w-full flex-col pb-3">
      <div className="w-full px-4 sm:px-6 lg:px-page-gutter">
        <hr className="border-border-strong mx-auto w-full max-w-432 border-t-3" />
      </div>

      <div className="mt-2">
        <ExhibitionHero slides={await pastHero()} />
      </div>

      <div className="mt-16">
        <ExhibitionTabs active="past" />
      </div>

      <section className="mt-8 w-full px-4 sm:px-6 lg:px-page-gutter">
        <h1 className="sr-only">Past exhibitions</h1>
        {exhibitions.length ? (
          <ul className="mx-auto grid w-full max-w-432 grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {exhibitions.map((exhibition) => (
              <li key={exhibition.slug}>
                <ExhibitionCard exhibition={exhibition} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-body text-text-secondary mx-auto w-full max-w-432">
            The archive is empty — every show in the programme is still to come.
          </p>
        )}
      </section>
    </div>
  );
};

export default PastExhibitionsPage;
