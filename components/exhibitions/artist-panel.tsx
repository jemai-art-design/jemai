import type { ReactNode } from "react";
import Image from "next/image";
import type { ArtistNote } from "@/lib/exhibitions";

/**
 * One artist as the block both detail frames draw them: a 576 × 864 portrait
 * beside a 563px copy column, with an 81px gutter, on an unbroken 28px pitch.
 *
 * Each half is drawn only if that artist has it — a portrait with no biography
 * is a portrait, and a biography with no portrait runs on the full measure
 * rather than beside an empty box. An artist with neither never reaches here;
 * `artistNotes` has already dropped them.
 *
 * `showName` is off for a solo show, where the section heading and the credit
 * at the top of the page have already said who this is. `controls` is the
 * carousel's arrow pair on a group show, which sits under the biography it
 * advances rather than under the whole block.
 *
 * The portrait and the copy carry their own keys so a carousel advance fades
 * them and leaves everything around them mounted — including a `controls`
 * button somebody has their finger on, which a re-mounted subtree would drop
 * the focus of mid-click.
 */
export const ArtistPanel = ({
  note,
  showName = false,
  controls,
}: {
  note: ArtistNote;
  showName?: boolean;
  controls?: ReactNode;
}) => (
  <div
    className={`grid gap-8 ${note.portrait ? "lg:grid-cols-[576fr_563fr] lg:gap-x-20.25" : ""
      }`}
  >
    {note.portrait ? (
      <div
        key={note.portrait.src}
        className="animate-in fade-in relative aspect-576/864 w-full duration-500"
      >
        <Image
          src={note.portrait.src}
          alt={note.portrait.alt}
          fill
          sizes="(min-width: 1024px) 576px, 100vw"
          className="object-contain"
        />
      </div>
    ) : null}

    <div className={note.portrait ? "lg:pt-33" : "max-w-200"}>
      <div key={note.name} className="animate-in fade-in duration-500">
        {showName ? (
          <h3 className="font-heading text-text-primary mb-4 text-xl sm:text-2xl">
            {note.name}
          </h3>
        ) : null}
        <div className="space-y-0.75">
          {note.paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-body-lg text-text-primary">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {controls ? <div className="mt-8">{controls}</div> : null}
    </div>
  </div>
);
