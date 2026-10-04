import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtworkEnquiry } from "@/components/artworks/artwork-enquiry";
import { getArtworkDetail } from "@/lib/artworks";

export const generateMetadata = async ({
  params,
}: PageProps<"/artworks/[slug]">): Promise<Metadata> => {
  const { slug } = await params;
  const artwork = await getArtworkDetail(slug);
  if (!artwork) return { title: "Not found | JEMAI" };

  return { title: `${artwork.title} | JEMAI`, description: artwork.lead };
};

/** This frame separates the crumbs with a slash, as the furniture detail does. */
const Slash = () => (
  <span aria-hidden className="text-text-secondary text-body-xs">
    /
  </span>
);

/** The frame's middle crumb reads "Art", not the catalogue's "Artworks". */
const Breadcrumb = ({ title }: { title: string; }) => (
  <nav
    aria-label="Breadcrumb"
    className="flex flex-wrap items-center justify-center gap-2"
  >
    <Link
      href="/"
      className="text-body-xs text-text-secondary underline-offset-4 hover:underline"
    >
      Home
    </Link>
    <Slash />
    <Link
      href="/artworks"
      className="text-body-xs text-text-secondary underline-offset-4 hover:underline"
    >
      Art
    </Link>
    <Slash />
    <span className="text-body-xs text-text-primary" aria-current="page">
      {title}
    </span>
  </nav>
);

const ArtworkDetailPage = async ({ params }: PageProps<"/artworks/[slug]">) => {
  const { slug } = await params;
  const artwork = await getArtworkDetail(slug);
  if (!artwork) notFound();

  return (
    <section className="flex w-full flex-col pb-px">
      <div className="w-full px-4 sm:px-6 lg:px-page-gutter pt-14">
        <Breadcrumb title={artwork.title} />
      </div>

      {/* The header centres on the page, not on a measure of its own. */}
      <header className="mt-8 w-full px-4 text-center sm:px-6 lg:px-page-gutter">
        <p className="text-h4 text-text-primary">{artwork.artist}</p>
        {/* 50px Classico Bold on a 56px line — the same display size the
            consultation and artworks headers use, set in caps here. */}
        <h1 className="font-heading text-text-primary mt-3 text-3xl uppercase sm:text-4xl lg:text-[50px] lg:leading-14 lg:font-bold">
          {artwork.title}
        </h1>
      </header>

      {/* The work is matted rather than full-bleed: a 900 × 730 `surface-tint`
          frame with 24px of margin around an 852 × 682 photograph. */}
      <div className="mt-16 w-full px-4 sm:px-6 lg:px-page-gutter">
        <div className="bg-surface-tint mx-auto w-full max-w-225 p-4 sm:p-6 lg:p-6">
          <div className="relative aspect-852/682 w-full">
            <Image
              src={artwork.hero}
              alt={artwork.title}
              fill
              priority
              sizes="(min-width: 1024px) 852px, 100vw"
              className="object-contain"
            />
          </div>
        </div>
      </div>

      {/* Copy and the enquiry sit on their own 800px measure, left-aligned
          under the matted work — x 320 → 1120 in the frame. */}
      <div className="mt-9.75 w-full px-4 sm:px-6 lg:px-page-gutter">
        <div className="mx-auto w-full max-w-200">
          <p className="text-h4 text-text-primary">
            {artwork.lead}
          </p>
          {/* Authored in the console's own editor and put through
              `sanitizeRichText` on every write, so the only markup that can
              reach here is the toolbar's own. */}
          {artwork.story ? (
            <div
              className="text-body-lg text-text-primary mt-6.5 [&_p:not(:last-child)]:mb-6"
              dangerouslySetInnerHTML={{ __html: artwork.story }}
            />
          ) : null}
          <div className="mt-5.25">
            <ArtworkEnquiry
              artwork={{
                slug: artwork.slug,
                title: artwork.title,
                artist: artwork.artist,
                image: artwork.hero,
              }}
            />
          </div>
        </div>
      </div>

      {/* A work whose documentation has not been uploaded yet closes on the
          enquiry rather than on a rule with nothing under it. */}
      {artwork.gallery.length ? (
        <>
          {/* Unlike every section rule on the site, this one is `border-default`
            rather than the 3px `border-strong`. */}
          <div className="mt-10 w-full px-4 sm:px-6 lg:px-page-gutter">
            <hr className="border-border-default mx-auto w-full max-w-432 border-t-2" />
          </div>

          {/* Six-up documentation grid: three 426.67px columns on a 16px gutter,
            rows on a 40px gutter — the frame's own two gutters. */}
          <div className="mt-9.75 w-full px-4 sm:px-6 lg:px-page-gutter">
            <ul className="mx-auto grid w-full max-w-432 grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {artwork.gallery.map((shot, index) => (
                <li key={`${shot.src}-${index}`} className="relative aspect-427/327">
                  <Image
                    src={shot.src}
                    alt={shot.alt}
                    fill
                    sizes="(min-width: 1024px) 427px, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : null}

    </section>
  );
};

export default ArtworkDetailPage;
