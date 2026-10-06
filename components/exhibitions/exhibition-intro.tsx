import type { ReactNode } from "react";
// import Image from "next/image"; 
import Link from "next/link";
import type { Exhibition } from "@/lib/exhibitions";

/** Both detail frames separate the crumbs with a slash. */
const Slash = () => (
  <span aria-hidden className="text-text-secondary text-body-xs">
    /
  </span>
);

const Breadcrumb = ({ exhibition }: { exhibition: Exhibition; }) => (
  <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2">
    <Link
      href="/"
      className="text-body-xs text-text-secondary underline-offset-4 hover:underline"
    >
      Home
    </Link>
    <Slash />
    <Link
      href={exhibition.status === "past" ? "/exhibitions/past" : "/exhibitions"}
      className="text-body-xs text-text-secondary underline-offset-4 hover:underline"
    >
      {exhibition.status === "past" ? "Past" : "Upcoming"} Exhibitions
    </Link>
    <Slash />
    <span className="text-body-xs text-text-primary" aria-current="page">
      {exhibition.title}
    </span>
  </nav>
);

export const ExhibitionIntro = ({
  exhibition,
  paragraphs,
  action,
}: {
  exhibition: Exhibition;
  paragraphs?: string[];
  action?: ReactNode;
}) => (
  <>
    <div className="w-full px-4 sm:px-6 lg:px-page-gutter">
      <hr className="border-border-strong mx-auto w-full max-w-432 border-t-3" />
    </div>

    <div className="mt-20 w-full px-4 sm:px-6 lg:px-page-gutter">
      <div className="mx-auto w-full max-w-432">
        <Breadcrumb exhibition={exhibition} />
      </div>
    </div>

    {/* <div className="relative mt-4 aspect-1440/501 w-full min-h-70">
      <Image
        src={exhibition.hero}
        alt={exhibition.title}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
    </div> */}

    <header className="mt-15.5 w-full px-4 text-center sm:px-6 lg:px-page-gutter">
      {exhibition.artist ? (
        <p className="text-h4 text-text-primary uppercase">{exhibition.artist}</p>
      ) : null}
      <h1 className="font-heading text-text-primary mt-3 text-3xl sm:text-4xl lg:text-[50px] lg:leading-14 lg:font-bold">
        {exhibition.title}
      </h1>
      <p className="text-body-lg text-text-secondary mt-3.5 capitalize">
        {exhibition.status}
      </p>
      <p className="text-body-lg text-text-primary mt-3">
        {exhibition.dates}
      </p>
    </header>

    <div className="mt-11.75 w-full px-4 sm:px-6 lg:px-page-gutter">
      <div className="mx-auto w-full max-w-199.75">
        <p className="text-h4 text-text-primary text-justify">{exhibition.lead}</p>
        {paragraphs?.length ? (
          <div className="mt-6.25">
            {paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-body-lg text-text-primary">
                {paragraph}
              </p>
            ))}
          </div>
        ) : null}
        {action && <div className="mt-5.5">{action}</div>}
      </div>
    </div>
  </>
);
