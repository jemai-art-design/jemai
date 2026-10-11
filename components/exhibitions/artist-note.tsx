import { ArtistCarousel } from "@/components/exhibitions/artist-carousel";
import { ArtistPanel } from "@/components/exhibitions/artist-panel";
import type { ArtistNote as Note } from "@/lib/exhibitions";

/**
 * The block both detail frames close on. The frame draws one artist, because
 * the show it draws is a solo one, and that case is exactly what it was: a
 * portrait beside its copy, rendered on the server.
 *
 * A group show gets the carousel instead — one artist at a time under an arrow
 * pair — rather than a column of full-height portraits that would run the page
 * on for screens.
 *
 * An exhibition whose artists have nothing written about them has no notes at
 * all, and draws no heading: the caller checks the same emptiness to decide
 * whether its section rule is drawn.
 */
export const ArtistNote = ({ notes }: { notes: Note[]; }) => {
  if (!notes.length) return null;

  return (
    <section className="w-full px-4 sm:px-6 lg:px-page-gutter">
      <div className="mx-auto w-full max-w-432">
        <div className="flex w-full max-w-305 flex-col gap-10">
          <h2 className="font-heading text-text-primary text-2xl sm:text-h3">
            {notes.length > 1 ? "About the Artists" : "About the Artist"}
          </h2>

          {notes.length > 1 ? (
            <ArtistCarousel notes={notes} />
          ) : (
            <ArtistPanel note={notes[0]} />
          )}
        </div>
      </div>
    </section>
  );
};
