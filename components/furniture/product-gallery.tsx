"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useProductSelection } from "@/components/furniture/product-selection";
import { variantSlide, type ProductDetail } from "@/lib/products";
import { cn } from "@/lib/utils";

type ProductGalleryProps = {
  product: ProductDetail;
};

/**
 * The piece's whole range of shots as one carousel, over a thumbnail rail. The
 * frame draws the main image at 578 × 580 inside a 40px padded panel, and four
 * 80px thumbnails 8px apart beneath it.
 *
 * Picking a colour in the panel beside this slides the carousel to that
 * variant's lead shot rather than emptying the rail of the others, so a shopper
 * can still swipe through the rest of the range from wherever they land.
 */
export const ProductGallery = ({ product }: ProductGalleryProps) => {
  const { colour, size } = useProductSelection();
  const images = product.gallery;

  const trackRef = useRef<HTMLUListElement>(null);
  const stripRef = useRef<HTMLUListElement>(null);
  const activeThumbRef = useRef<HTMLLIElement>(null);
  const [active, setActive] = useState(0);

  /** Every slide is exactly the track wide, so the offset is the index. */
  const goTo = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
  };

  /**
   * The selection drives the carousel. `-1` is "nothing picked" — on first paint
   * and after a clear — and leaves the shopper on whatever they were looking at.
   */
  const slide = variantSlide(product, colour, size);

  useEffect(() => {
    if (slide >= 0) goTo(slide);
  }, [slide]);

  /* The strip holds one thumb per shot and runs past its own width on a piece
     with a few colourways, so it follows the carousel rather than the reverse. */
  useEffect(() => {
    const strip = stripRef.current;
    const thumb = activeThumbRef.current;
    if (!strip || !thumb) return;

    const offset =
      thumb.getBoundingClientRect().left - strip.getBoundingClientRect().left;
    strip.scrollTo({
      left: strip.scrollLeft + offset - strip.clientWidth / 2 + thumb.clientWidth / 2,
      behavior: "smooth",
    });
  }, [active]);

  /** Which slide the track has settled on — the scroll is the source of truth. */
  const onScroll = () => {
    const track = trackRef.current;
    if (!track?.clientWidth) return;
    setActive(Math.round(track.scrollLeft / track.clientWidth));
  };

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label={`${product.name} photographs`}
      onKeyDown={(event) => {
        if (images.length < 2) return;
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          goTo(Math.max(active - 1, 0));
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          goTo(Math.min(active + 1, images.length - 1));
        }
      }}
      className="flex w-full flex-col gap-2"
    >
      {/* Scroll-snap rather than a slider: a touch swipe is the native gesture,
          and `scrollTo` is what the selection needs to drive it. */}
      <ul
        ref={trackRef}
        onScroll={onScroll}
        tabIndex={0}
        aria-label={`${product.name} photographs — scrollable`}
        className="flex w-full snap-x snap-mandatory overflow-x-auto scrollbar-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current [&::-webkit-scrollbar]:hidden"
      >
        {images.map((src, index) => (
          <li
            key={`${src}-${index}`}
            aria-label={`Slide ${index + 1} of ${images.length}`}
            className="relative aspect-578/580 w-full shrink-0 snap-start overflow-hidden bg-[#efede9]"
          >
            <Image
              src={src}
              alt={index === 0 ? product.name : ""}
              fill
              // Only the shot the page opens on is worth blocking paint for;
              // the rest of the range lazy-loads as it is scrolled to.
              priority={index === 0}
              sizes="(min-width: 1024px) 578px, 100vw"
              className="object-cover"
            />
          </li>
        ))}
      </ul>

      {/* The rail scrolls on narrow screens rather than wrapping 3-and-1. */}
      {images.length > 1 && (
        <ul
          ref={stripRef}
          className="flex gap-2 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden"
        >
          {images.map((src, index) => (
            <li
              key={`${src}-${index}`}
              ref={index === active ? activeThumbRef : undefined}
              className="shrink-0"
            >
              <Button
                type="button"
                variant="chip"
                size="thumb"
                onClick={() => goTo(index)}
                aria-label={`View ${index + 1} of ${images.length}`}
                aria-current={index === active ? "true" : undefined}
                className={cn(
                  "relative border bg-white transition-opacity",
                  index === active ? "opacity-100" : "opacity-60 hover:opacity-90"
                )}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
