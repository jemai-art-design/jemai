"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ProjectMediaFrame,
  ProjectPoster,
} from "@/components/site/project-media";
import { cn } from "@/lib/utils";
import { mediaNoun } from "@/lib/project-media";
import type { Project } from "@/lib/projects";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

type SpacesCarouselProps = {
  projects: Project[];
  /** The carousel's own accessible name — it draws two different rails. */
  label?: string;
  /** What the arrows step through, as their labels name it. */
  noun?: string;
};

const CARD_GAP = 28;

export const SpacesCarousel = ({
  projects,
  label = "Featured spaces",
  noun = "spaces",
}: SpacesCarouselProps) => {
  const railRef = useRef<HTMLUListElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const activeThumbRef = useRef<HTMLButtonElement>(null);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState<Project | null>(null);
  /** Which of the open project's entries the lightbox is showing. */
  const [shot, setShot] = useState(0);

  /** Photographs, films and embeds in the order the console arranged them. */
  const shots = active?.media ?? [];
  const goShot = (delta: number) =>
    setShot((i) => (i + delta + shots.length) % shots.length);

  /* Stepping with the chevrons walks past the end of the visible strip, so the
     strip follows the selection rather than the other way round. */
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
  }, [shot, active]);

  const open = (project: Project) => {
    setActive(project);
    setShot(0);
  };

  /** One card plus its gap — measured, since the card width is responsive. */
  const step = () => {
    const card = railRef.current?.firstElementChild as HTMLElement | undefined;
    return (card?.offsetWidth ?? 280) + CARD_GAP;
  };

  const go = (delta: number) =>
    railRef.current?.scrollBy({ left: delta * step(), behavior: "smooth" });

  const onScroll = () => {
    const rail = railRef.current;
    if (!rail) return;
    const travel = rail.scrollWidth - rail.clientWidth;
    setProgress(travel > 0 ? rail.scrollLeft / travel : 0);
  };

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") { event.preventDefault(); go(-1); }
        if (event.key === "ArrowRight") { event.preventDefault(); go(1); }
      }}
      className="flex w-full flex-col gap-14 pb-3 pl-4 sm:pl-6 lg:pl-page-gutter"
    >
      <div className="relative">
        <ul
          ref={railRef}
          onScroll={onScroll}
          className="flex snap-x snap-mandatory gap-7 overflow-x-auto pr-4 sm:pr-6 lg:pr-page-gutter scrollbar-none [&::-webkit-scrollbar]:hidden"
        >
          {projects.map((project) => (
            <li key={project.slug} className="w-70 shrink-0 snap-start sm:w-82.5">
              <button
                type="button"
                onClick={() => open(project)}
                aria-label={`View ${project.name}`}
                className="group flex w-full cursor-pointer flex-col gap-2.5 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-[#e9e6de]">
                  {/* A project led by a film shows its opening frame here and
                      plays in the lightbox — the card is a still either way, so
                      a rail of six is six pictures rather than six videos. */}
                  <ProjectPoster
                    media={project.media[0]}
                    sizes="(min-width: 640px) 330px, 280px"
                    className="transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <p className="text-eyebrow-lg text-text-secondary pt-2.5 uppercase">
                  {project.meta}
                </p>
                <h3 className="text-h4 text-text-primary font-heading">
                  {project.name}
                </h3>
                {project.summary && (
                  <p className="text-body-sm text-text-secondary">
                    {project.summary}
                  </p>
                )}
              </button>
            </li>
          ))}
        </ul>

        {/* Arrows sit over the photography, clear of the copy below it. */}
        {([
          { direction: "Previous", delta: -1, icon: "/figma/icons/arrow-left.svg", side: "left-3", edge: 0 },
          { direction: "Next", delta: 1, icon: "/figma/icons/arrow-right.svg", side: "right-3", edge: 1 },
        ] as const).map(({ direction, delta, icon, side, edge }) => (
          <button
            key={direction}
            type="button"
            onClick={() => go(delta)}
            aria-label={`${direction} ${noun}`}
            disabled={Math.abs(progress - edge) < 0.01}
            className={`absolute top-35 hidden size-10 -translate-y-1/2 items-center justify-center bg-black/25 text-white backdrop-blur-[2px] transition-opacity hover:bg-black/40 disabled:pointer-events-none disabled:opacity-0 sm:top-41.25 md:flex ${side}`}
          >
            <Image src={icon} alt="" width={14} height={14} unoptimized />
          </button>
        ))}
      </div>

      <div className="mr-4 h-px bg-black/10 sm:mr-6 lg:mr-page-gutter">
        <div
          className="h-px bg-black/55 transition-[width] duration-200"
          style={{ width: `${30 + progress * 70}%` }}
        />
      </div>

      <Dialog
        open={Boolean(active)}
        onOpenChange={(isOpen) => !isOpen && setActive(null)}
      >
        <DialogContent
          /* No card: the photograph and its copy sit straight on the scrim,
             which goes near-black so the work is the only lit thing. */
          overlayClassName="bg-surface-inverse/94"
          onKeyDown={(event) => {
            if (shots.length < 2) return;
            // Left and right belong to a focused player — they seek it — so the
            // strip only takes them when the focus is elsewhere in the dialog.
            if ((event.target as HTMLElement).closest("video")) return;
            if (event.key === "ArrowLeft") { event.preventDefault(); goShot(-1); }
            if (event.key === "ArrowRight") { event.preventDefault(); goShot(1); }
          }}
          className="flex max-h-[calc(100dvh-3rem)] w-[min(1240px,calc(100vw-2rem))] max-w-none flex-col gap-8 overflow-y-auto sm:w-[min(1240px,calc(100vw-4rem))] lg:flex-row lg:items-center lg:gap-14 lg:overflow-visible"
        >
          <div className="relative aspect-4/3 w-full shrink-0 border border-white/15 max-lg:max-h-[45dvh] lg:flex-1">
            {/* Keyed on the position rather than re-pointed: stepping along the
                strip unmounts the player, which is what stops a film carrying on
                behind the next photograph. */}
            {shots[shot] && <ProjectMediaFrame key={shot} media={shots[shot]} />}

            {shots.length > 1 && (
              <>
                {([
                  { direction: "Previous", delta: -1, Icon: ChevronLeft, side: "left-5" },
                  { direction: "Next", delta: 1, Icon: ChevronRight, side: "right-5" },
                ] as const).map(({ direction, delta, Icon, side }) => (
                  <Button
                    key={direction}
                    type="button"
                    variant="quiet"
                    onClick={() => goShot(delta)}
                    aria-label={`${direction} ${mediaNoun(shots[shot].type)}`}
                    className={cn(
                      "bg-surface-page text-icon-primary absolute top-1/2 size-12.5 -translate-y-1/2 rounded-full hover:bg-white",
                      side,
                    )}
                  >
                    <Icon className="size-5" />
                  </Button>
                ))}

                <p
                  className="text-body-xs bg-surface-inverse/80 text-text-inverse absolute right-4 bottom-4 px-2.5 py-1"
                  aria-live="polite"
                >
                  {shot + 1} / {shots.length}
                </p>
              </>
            )}
          </div>

          <div className="flex flex-col lg:w-88 lg:shrink-0">
            <DialogClose asChild>
              <Button
                type="button"
                variant="quiet"
                aria-label="Close"
                className="text-text-inverse mb-4 size-10 shrink-0 self-end rounded-full bg-white/12 hover:bg-white/20 hover:text-white focus-visible:ring-white/50 lg:mb-9"
              >
                <X className="size-3.5" />
              </Button>
            </DialogClose>

            {active?.meta && (
              <p className="text-eyebrow-lg uppercase text-white/65">
                {active.meta}
              </p>
            )}

            <DialogTitle className="text-text-inverse mt-3 max-w-120 text-2xl leading-snug sm:text-h3 lg:max-w-none">
              {active?.name}
            </DialogTitle>

            {active?.description && (
              <DialogDescription className="text-body mt-5 max-w-120 text-white/75 lg:max-w-none">
                {active.description}
              </DialogDescription>
            )}

            {shots.length > 1 && (
              <div
                ref={stripRef}
                className="mt-8 flex gap-2.5 overflow-x-auto pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden"
              >
                {shots.map((entry, index) => (
                  <Button
                    key={`${entry.src}-${index}`}
                    ref={index === shot ? activeThumbRef : undefined}
                    type="button"
                    variant="quiet"
                    aria-label={`${entry.type === "image" ? "Photograph" : "Video"} ${index + 1} of ${shots.length}`}
                    aria-current={index === shot}
                    onClick={() => setShot(index)}
                    className={cn(
                      "relative size-16 shrink-0 overflow-hidden rounded-none p-0 transition-opacity",
                      index === shot
                        ? "opacity-100"
                        : "opacity-45 hover:opacity-80",
                    )}
                  >
                    <ProjectPoster
                      media={{ ...entry, alt: "" }}
                      sizes="64px"
                      badgeClassName="size-6"
                    />
                  </Button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
