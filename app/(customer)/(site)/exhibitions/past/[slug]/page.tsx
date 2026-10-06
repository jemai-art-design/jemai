import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArtistNote } from "@/components/exhibitions/artist-note";
import { ExhibitionIntro } from "@/components/exhibitions/exhibition-intro";
import { InstallRail } from "@/components/exhibitions/install-rail";
import { WorksRail } from "@/components/exhibitions/works-rail";
import { getExhibition } from "@/lib/exhibitions";

export const generateMetadata = async ({
  params,
}: PageProps<"/exhibitions/past/[slug]">): Promise<Metadata> => {
  const { slug } = await params;
  const exhibition = await getExhibition(slug, "past");
  if (!exhibition) return { title: "Not found | JEMAI" };

  return { title: `${exhibition.title} | JEMAI`, description: exhibition.lead };
};

/** The narrative block, on the same 800px measure the intro copy uses. */
const Narrative = ({ paragraphs }: { paragraphs: string[]; }) => (
  <div className="w-full px-4 sm:px-6 lg:px-page-gutter">
    <div className="mx-auto w-full max-w-200">
      {paragraphs.map((paragraph) => (
        <p key={paragraph} className="text-body-lg text-text-primary">
          {paragraph}
        </p>
      ))}
    </div>
  </div>
);

/**
 * An exhibition's status is derived from its run, so this page's content can go
 * out of date with nothing having been written — the day simply turns. Hourly
 * revalidation is what moves a show that closed overnight without waiting for
 * an author to save something.
 */
export const revalidate = 3600;

const PastExhibitionPage = async ({
  params,
}: PageProps<"/exhibitions/past/[slug]">) => {
  const { slug } = await params;
  const exhibition = await getExhibition(slug, "past");
  if (!exhibition) notFound();

  const [before, after] = [exhibition.body.slice(0, 2), exhibition.body.slice(2)];

  const [featured] = exhibition.works;

  return (
    <div className="flex w-full flex-col">
      <ExhibitionIntro exhibition={exhibition} />

      {exhibition.installShots.length ? (
        <div className="mt-12">
          <InstallRail shots={exhibition.installShots} />
        </div>
      ) : null}

      {before.length ? (
        <div className="mt-12.25">
          <Narrative paragraphs={before} />
        </div>
      ) : null}

      {featured ? (
        <div className="mt-5.75 w-full px-4 sm:px-6 lg:px-page-gutter">
          <div className="relative mx-auto aspect-900/720 w-full max-w-225">
            <Image
              src={featured.src}
              alt={featured.alt}
              fill
              sizes="(min-width: 1024px) 900px, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      ) : null}

      {after.length ? (
        <div className="mt-6.25">
          <Narrative paragraphs={after} />
        </div>
      ) : null}

      {exhibition.works.length ? (
        <div className="mt-12">
          <WorksRail works={exhibition.works} />
        </div>
      ) : null}

      {exhibition.artistNotes.length ? (
        <>
          <div className="mt-20.75 w-full px-4 sm:px-6 lg:px-page-gutter">
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

export default PastExhibitionPage;
