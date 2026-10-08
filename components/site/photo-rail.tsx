"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { objectFit, type ImageFit } from "@/lib/site-image-slots";
import { cn } from "@/lib/utils";

export type RailPhoto = {
  src: string;
  alt: string;
  /** Captioned rails draw these under the photograph; the intro rail has none. */
  title?: string;
  caption?: string;
  /** How it sits in the slide. Cropped to fill unless the console says otherwise. */
  fit?: ImageFit;
};

type PhotoRailProps = {
  photos: RailPhoto[];
  label: string;
  /** The slide box. Defaults to the intro slideshow's 251px column. */
  slideClassName?: string;
  /** The photograph inside it. Defaults to the intro slideshow's 240/320. */
  mediaClassName?: string;
  /** Gap between slides — `gap` on the rail, so `slideStep` reads it back. */
  gapClassName?: string;
  /** The dash picker beneath. Off where a section closes on a rule instead. */
  picker?: boolean;
  className?: string;
};

/**
 * The Figma "Intro Slideshow" — a snap rail of photographs with the slide
 * picker beneath. The picker drives the scroll position and the scroll position
 * drives the picker back, so dragging the rail keeps the active dash honest.
 *
 * The dashes count *pages*, not photographs. A rail can only scroll to
 * `scrollWidth - clientWidth`, so the last screenful of slides can never be
 * brought to the left edge — one dash per slide would leave the trailing dashes
 * dead. Pages also fall out responsively: one photo per view on a phone gives a
 * dash each, four per view at desktop gives half as many.
 *
 * The rail deliberately does not centre its items: `justify-center` on an
 * overflowing flex row puts the leading items past the scroll origin, where
 * they cannot be reached.
 */
export const PhotoRail = ({
  photos,
  label,
  slideClassName = "w-[70%] sm:w-62.75",
  mediaClassName = "h-60 lg:h-80",
  gapClassName = "gap-grid-gutter-compact",
  picker = true,
  className,
}: PhotoRailProps) => {
  const railRef = useRef<HTMLUListElement>(null);
  const [perView, setPerView] = useState(1);
  const [page, setPage] = useState(0);

  const pages = Math.max(1, Math.ceil(photos.length / perView));

  /** Distance from one slide's left edge to the next, gap included. */
  const slideStep = useCallback((rail: HTMLUListElement) => {
    const [first, second] = [rail.children[0], rail.children[1]];
    if (!first) return 0;
    if (second)
      return (
        second.getBoundingClientRect().left - first.getBoundingClientRect().left
      );
    return first.getBoundingClientRect().width;
  }, []);

  const readPage = useCallback(
    (rail: HTMLUListElement) => {
      const step = slideStep(rail);
      if (step <= 0) return 0;
      const visible = Math.max(1, Math.round(rail.clientWidth / step));
      const total = Math.max(1, Math.ceil(photos.length / visible));
      const maxScroll = rail.scrollWidth - rail.clientWidth;
      // the tail of the rail is short of a full page — pin it to the last dash
      if (maxScroll <= 1) return 0;
      if (rail.scrollLeft >= maxScroll - 1) return total - 1;
      return Math.min(
        total - 1,
        Math.round(rail.scrollLeft / (step * visible)),
      );
    },
    [photos.length, slideStep],
  );

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const measure = () => {
      const step = slideStep(rail);
      if (step > 0)
        setPerView(Math.max(1, Math.round(rail.clientWidth / step)));
      setPage(readPage(rail));
    };

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setPage(readPage(rail)));
    };

    measure();
    const observer = new ResizeObserver(measure);
    // Watch a slide as well as the rail. The rail is `w-full`, so its box does
    // not change when the stylesheet lands or a breakpoint flips the slide
    // width — but the page count depends on the slide width, so measuring only
    // the rail can leave the picker stuck on its pre-layout guess.
    observer.observe(rail);
    if (rail.children[0]) observer.observe(rail.children[0]);
    rail.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      rail.removeEventListener("scroll", onScroll);
    };
  }, [readPage, slideStep]);

  const goToPage = (target: number) => {
    setPage(target);
    const rail = railRef.current;
    if (!rail) return;
    const item = rail.children[
      Math.min(target * perView, photos.length - 1)
    ] as HTMLElement | undefined;
    if (!item) return;
    // rect maths rather than offsetLeft: the rail is not the offset parent.
    // Overscroll is clamped by the browser, which is what pins the last page.
    const delta =
      item.getBoundingClientRect().left - rail.getBoundingClientRect().left;
    rail.scrollTo({ left: rail.scrollLeft + delta, behavior: "smooth" });
  };

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center gap-grid-gutter-compact",
        className,
      )}
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
    >
      <ul
        ref={railRef}
        tabIndex={0}
        aria-label={`${label} — scrollable`}
        className={cn(
          "flex w-full snap-x snap-mandatory items-start overflow-x-auto scrollbar-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current [&::-webkit-scrollbar]:hidden",
          gapClassName,
        )}
      >
        {photos.map((photo, index) => (
          <li
            key={`${photo.src}-${index}`}
            aria-label={`Slide ${index + 1} of ${photos.length}`}
            className={cn(
              "flex shrink-0 snap-start flex-col gap-2",
              slideClassName,
            )}
          >
            <div
              className={cn(
                "relative w-full shrink-0 overflow-hidden",
                mediaClassName,
              )}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 640px) 330px, 70vw"
                className={objectFit(photo.fit)}
              />
            </div>

            {(photo.title || photo.caption) && (
              <div className="flex flex-col gap-2.5">
                {photo.title && (
                  <h3 className="text-h4 text-text-primary">{photo.title}</h3>
                )}
                {photo.caption && (
                  <p className="text-body-sm text-text-secondary">
                    {photo.caption}
                  </p>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>

      {picker && (
        <div
          className="flex h-7.5 items-center justify-center"
          role="tablist"
          aria-label={label}
        >
          {Array.from({ length: pages }, (_, index) => (
            <Button
              key={index}
              type="button"
              role="tab"
              variant="quiet"
              aria-selected={index === page}
              aria-label={`Go to slide group ${index + 1} of ${pages}`}
              onClick={() => goToPage(index)}
              className="h-auto px-1.5 py-0"
            >
              <span
                className={cn(
                  "block transition-all",
                  index === page
                    ? "h-[4.5px] w-11.25 bg-[#666]"
                    : "h-0.75 w-7.5 bg-[rgba(51,51,51,0.25)]",
                )}
              />
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};
