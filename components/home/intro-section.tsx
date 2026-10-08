import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/site/eyebrow";
import { HeroCarousel, type HeroSlide } from "@/components/home/hero-carousel";
import { objectFit, type SiteImage } from "@/lib/site-image-slots";
import { siteImages } from "@/lib/site-images";

/**
 * The copy drawn over each hero slide, keyed by the slide the console holds.
 *
 * It stays here rather than beside the photography because it is not content
 * the studio edits on the images screen: each line carries a button to a
 * section of the site. A slide added in the console has no entry here and is
 * drawn as photography alone — see the note on the `home.hero` slot.
 */
const heroCopy: Record<string, Omit<HeroSlide, "image">> = {
  world: {
    eyebrow: "The JEMAI World",
    title: "Spaces That Reflect the People In Them",
    cta: { label: "Discover Our Stories", href: "/about" },
  },
  furniture: {
    eyebrow: "Furniture",
    title: "Pieces Made to Be Lived With",
    cta: { label: "Shop Furniture", href: "/furniture" },
  },
  art: {
    eyebrow: "Artworks",
    title: "Contemporary Work, Carefully Chosen",
    cta: { label: "View Artworks", href: "/artworks" },
  },
  exhibitions: {
    eyebrow: "Exhibitions",
    title: "Where Art, Artists and Audiences Meet",
    cta: { label: "Explore Exhibitions", href: "/exhibitions" },
  },
};

/** The four tiles' labels and links; the pictures are the console's. */
const categoryLinks: Record<string, { label: string; href: string; }> = {
  design: { label: "Design", href: "/about" },
  furniture: { label: "Furniture", href: "/furniture" },
  art: { label: "Art", href: "/artworks" },
  exhibitions: { label: "Exhibitions", href: "/exhibitions" },
};

const toSlide = (image: SiteImage): HeroSlide => ({
  ...heroCopy[image.key],
  image,
});

export const IntroSection = async () => {
  const [slides, categories] = await Promise.all([
    siteImages("home.hero"),
    siteImages("home.categories"),
  ]);

  return (
    <section className="flex w-full flex-col items-center gap-stack-loose">
      <HeroCarousel slides={slides.map(toSlide)} />

      <div className="flex w-full flex-col items-center px-4 pt-8 sm:px-6 lg:px-page-gutter">
        <div className="flex w-full max-w-270 flex-col gap-stack-default">
          <div className="flex flex-col gap-2.5">
            <Eyebrow>01 / The JEMAI World</Eyebrow>

            <div className="flex flex-col gap-stack-heading lg:flex-row lg:gap-section-gap-default">
              <div className="flex flex-1 flex-col justify-center">
                <h2 className="font-heading text-text-primary max-w-120 text-4xl leading-tight tracking-[0.02em] sm:text-5xl sm:leading-[1.06] lg:text-display">
                  Signature Style for Every Square Inch
                </h2>
              </div>

              <div className="flex flex-1 flex-col gap-5">
                <p className="text-body text-text-secondary">
                  Explore furniture, contemporary artwork, exhibitions
                  and design services—brought together by a shared belief that
                  every space should reflect the people who live and work within
                  it.
                </p>
                <div className="flex flex-wrap items-center gap-stack-default">
                  <Button asChild size="cta">
                    <Link href="/about">Discover Our Stories</Link>
                  </Button>
                  <Link
                    href="/furniture"
                    className="text-label text-action-link whitespace-nowrap"
                  >
                    View new arrivals
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <ul className="grid grid-cols-2 gap-[14.896px] sm:grid-cols-4">
            {categories.map((image) => {
              const { label, href } = categoryLinks[image.key];
              return (
                <li key={image.key}>
                  <Link href={href} className="group flex flex-col items-end gap-[14.896px]">
                    <span className="text-body text-text-primary text-right">
                      {label}
                    </span>
                    <span className="relative block aspect-square w-full overflow-hidden">
                      <Image
                        src={image.src}
                        alt={image.alt || label}
                        fill
                        sizes="(min-width: 1024px) 257px, (min-width: 640px) 25vw, 50vw"
                        className={`${objectFit(image.fit)} transition-transform duration-500 group-hover:scale-105`}
                      />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
};
