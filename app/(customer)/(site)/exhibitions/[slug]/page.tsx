import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArtistNote } from "@/components/exhibitions/artist-note";
import { ExhibitionIntro } from "@/components/exhibitions/exhibition-intro";
import { RegisterButton } from "@/components/exhibitions/register-button";
import { RegistrationOutcome } from "@/components/exhibitions/registration-outcome";
import { getExhibition } from "@/lib/exhibitions";

export const generateMetadata = async ({
  params,
}: PageProps<"/exhibitions/[slug]">): Promise<Metadata> => {
  const { slug } = await params;
  const exhibition = await getExhibition(slug, "upcoming");
  if (!exhibition) return { title: "Not found | JEMAI" };

  return { title: `${exhibition.title} | JEMAI`, description: exhibition.lead };
};

/**
 * An exhibition's status is derived from its run, so this page's content can go
 * out of date with nothing having been written — the day simply turns. Hourly
 * revalidation is what moves a show that closed overnight without waiting for
 * an author to save something.
 */
export const revalidate = 3600;

const UpcomingExhibitionPage = async ({
  params,
}: PageProps<"/exhibitions/[slug]">) => {
  const { slug } = await params;
  const exhibition = await getExhibition(slug, "upcoming");
  if (!exhibition) notFound();

  return (
    <div className="flex w-full flex-col">
      <Suspense>
        <RegistrationOutcome />
      </Suspense>

      <ExhibitionIntro
        exhibition={exhibition}
        paragraphs={exhibition.body}
        action={
          <RegisterButton
            exhibition={{
              slug: exhibition.slug,
              title: exhibition.title,
              artist: exhibition.artist,
              when: exhibition.opensOn,
              image: exhibition.hero,
              ticket: exhibition.ticket,
            }}
          />
        }
      />

      {exhibition.artistNotes.length ? (
        <>
          <div className="mt-15.5 w-full px-4 sm:px-6 lg:px-page-gutter">
            <hr className="border-border-default mx-auto w-full max-w-432 border-t-2" />
          </div>

          <div className="mt-10">
            <ArtistNote notes={exhibition.artistNotes} />
          </div>
        </>
      ) : null}
    </div>
  );
};

export default UpcomingExhibitionPage;
