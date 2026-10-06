"use client";

type ArtworksHeroProps = {
  eyebrow: string;
  heading: string[];
  copy: string;
};

export const ArtworksHero = ({
  eyebrow,
  heading,
  copy,
}: ArtworksHeroProps) => {
  return (
    <section className="w-full">
      <div className="w-full px-4">
        <div className="mx-auto grid max-w-270 items-end lg:pb-10 pt-8.5 pb-1.5 lg:grid-cols-[573fr_507fr]">
          <div>
            <p className="text-eyebrow-lg text-text-secondary uppercase">
              {eyebrow}
            </p>
            <h1 className="font-heading text-text-primary mt-1.75 text-4xl font-bold sm:text-5xl lg:text-[50px] lg:leading-14">
              {heading.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>
          </div>
          <p className="text-body text-text-secondary mt-6 max-w-125 lg:mt-0">
            {copy}
          </p>
        </div>
      </div>
    </section>
  );
};
