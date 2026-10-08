"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { objectFit, type SiteImage } from "@/lib/site-image-slots";

/**
 * The full-bleed 1440 × 501 carousel both exhibition index frames open on:
 * 40px arrow squares inset 90/88 and three 44 × 4 dashes 39px off the foot.
 *
 * Both frames draw only the first slide, so the rest is written; the dash count
 * follows the frame's three.
 */
export const ExhibitionHero = ({ slides }: { slides: SiteImage[]; }) => {
  const [index, setIndex] = useState(0);
  const go = (step: number) =>
    setIndex((i) => (i + step + slides.length) % slides.length);

  return (
    /* `min-h` is a derived-responsive call: 1440/501 leaves the band only
       136px tall at 390, and the frames carry no mobile layout. */
    <div className="relative aspect-1440/501 w-full min-h-70 overflow-hidden">
      {slides.map((slide, i) => (
        <Image
          key={slide.key}
          src={slide.src}
          alt={slide.alt}
          fill
          priority={i === 0}
          sizes="100vw"
          className={`${objectFit(slide.fit)} transition-opacity duration-500 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Previous exhibition"
        className="absolute top-1/2 left-22.5 hidden size-10 -translate-y-1/2 items-center justify-center bg-black/25 text-white backdrop-blur-[2px] transition-colors hover:bg-black/40 lg:flex"
      >
        <ChevronLeft aria-hidden className="size-5" />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Next exhibition"
        className="absolute top-1/2 right-22 hidden size-10 -translate-y-1/2 items-center justify-center bg-black/25 text-white backdrop-blur-[2px] transition-colors hover:bg-black/40 lg:flex"
      >
        <ChevronRight aria-hidden className="size-5" />
      </button>

      <div className="absolute bottom-9.75 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((slide, i) => (
          <button
            key={slide.key}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Show slide ${i + 1}`}
            aria-current={i === index}
            className={`h-1 w-11 transition-colors ${
              i === index ? "bg-white" : "bg-white/35"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
