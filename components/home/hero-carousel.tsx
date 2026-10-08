"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { objectFit, type SiteImage } from "@/lib/site-image-slots";
import { cn } from "@/lib/utils";

export type HeroSlide = {
  /**
   * The lines drawn over the photograph. Absent on a slide the console has
   * added: the four the site ships with are the ones the page writes copy for,
   * and an extra photograph is drawn on its own rather than borrowing a
   * headline and a button that point somewhere it has nothing to do with.
   */
  eyebrow?: string;
  title?: string;
  cta?: { label: string; href: string; };
  image: SiteImage;
};

type HeroCarouselProps = {
  slides: HeroSlide[];
  /** Milliseconds between automatic advances. */
  interval?: number;
};

export const HeroCarousel = ({ slides, interval = 6000 }: HeroCarouselProps) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  const go = (delta: number) => setIndex((i) => (i + delta + count) % count);

  useEffect(() => {
    if (paused || count < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(
      () => setIndex((i) => (i + 1) % count),
      interval,
    );
    return () => window.clearInterval(timer);
  }, [paused, count, interval]);

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label="JEMAI highlights"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") { event.preventDefault(); go(-1); }
        if (event.key === "ArrowRight") { event.preventDefault(); go(1); }
      }}
      className="relative h-100 w-full bg-[rgba(33,28,28,0.3)] sm:h-125 lg:h-150"
    >
      {slides.map((slide, slideIndex) => (
        <Image
          key={slide.image.key}
          src={slide.image.src}
          alt={slide.image.alt}
          fill
          priority={slideIndex === 0}
          sizes="100vw"
          className={cn(
            objectFit(slide.image.fit),
            "transition-opacity duration-700",
            slideIndex === index ? "opacity-100" : "opacity-0",
          )}
        />
      ))}

      {/* Scrim — the copy sits on photography, so it carries its own contrast. */}
      <div className="absolute inset-0 bg-[rgba(22,5,7,0.55)]" />

      <div className="absolute inset-0 flex flex-col items-center justify-center px-16 text-center sm:px-20 lg:px-32">
        <div
          key={index}
          className="animate-in fade-in flex max-w-200 flex-col items-center gap-2 duration-500"
        >
          {slides[index].eyebrow ? (
            <p className="text-eyebrow-lg uppercase text-white/80">
              {slides[index].eyebrow}
            </p>
          ) : null}
          {slides[index].title ? (
            <h1 className="font-heading text-3xl leading-tight tracking-[0.02em] text-white sm:text-5xl sm:leading-[1.06] lg:text-display">
              {slides[index].title}
            </h1>
          ) : null}
          {slides[index].cta ? (
            <Button
              asChild
              size="cta"
              variant="outline"
              className="border-border-inverse text-text-inverse mt-2 min-w-37 bg-transparent hover:bg-white/10 hover:text-white"
            >
              <Link href={slides[index].cta!.href}>{slides[index].cta!.label}</Link>
            </Button>
          ) : null}
        </div>
      </div>

      {/* The arrow pair Curator's Pick draws — a size-10 hairline circle in
          white around the exported arrow SVG, which is the dark-ground styling
          of the two the site has. Inset from the gutter so it clears the copy. */}
      {([
        { label: "Previous", delta: -1, icon: "/figma/icons/arrow-left.svg", side: "left-3 md:left-7.5" },
        { label: "Next", delta: 1, icon: "/figma/icons/arrow-right.svg", side: "right-3 md:right-7.5" },
      ] as const).map(({ label, delta, icon, side }) => (
        <button
          key={label}
          type="button"
          onClick={() => go(delta)}
          aria-label={`${label} slide`}
          className={cn(
            "absolute top-1/2 size-10 -translate-y-1/2 items-center justify-center bg-black/25 text-white backdrop-blur-[2px] transition-colors hover:bg-black/40 flex",
            side,
          )}
        >
          <Image src={icon} alt="" width={14} height={14} unoptimized />
        </button>
      ))}

      <div
        className="absolute inset-x-0 bottom-6 flex items-center justify-center lg:bottom-8"
        role="tablist"
        aria-label="JEMAI highlights"
      >
        {slides.map((slide, slideIndex) => (
          <Button
            key={slide.image.key}
            type="button"
            role="tab"
            variant="quiet"
            aria-selected={slideIndex === index}
            aria-label={`Go to slide ${slideIndex + 1} of ${count}`}
            onClick={() => setIndex(slideIndex)}
            className="h-auto px-1.5 py-0 hover:text-white"
          >
            <span
              className={cn(
                "block transition-all",
                slideIndex === index
                  ? "h-[4.5px] w-11.25 bg-white"
                  : "h-0.75 w-7.5 bg-white/40",
              )}
            />
          </Button>
        ))}
      </div>

      <span className="sr-only" aria-live="polite">
        Slide {index + 1} of {count}
      </span>

      <div className="absolute -bottom-10.5 right-4 flex size-25 items-center justify-center sm:right-6 lg:-bottom-17.5 lg:right-10 lg:size-35">
        <Image
          src="/figma/brand/badge-logo.svg"
          alt=""
          width={117}
          height={121}
          unoptimized
          className="h-auto w-full"
        />
      </div>
    </div>
  );
};
