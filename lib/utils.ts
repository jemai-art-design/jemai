import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display",
            "h2",
            "h3",
            "h4",
            "body-lg",
            "body",
            "body-sm",
            "body-xs",
            "label",
            "eyebrow",
            "eyebrow-lg",
            "numeral",
          ],
        },
      ],
    },
  },
});

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

/**
 * Spread onto an anchor whose `href` is data rather than a literal: it opens a
 * link that leaves the site in a new tab, and leaves the rest alone. A
 * `mailto:` or `tel:` handed `target="_blank"` fires the OS handler and leaves
 * an empty tab sitting behind it.
 */
export const externalLink = (href: string) =>
  /^https?:/.test(href) ? { target: "_blank" as const, rel: "noreferrer" } : {};

/**
 * Characters that take up no space but still count as different text. Word
 * joiners and zero-width spaces ride along with anything pasted out of Figma,
 * Docs or a PDF, and a non-breaking space looks exactly like a normal one.
 */
const INVISIBLE = /[\u00ad\u180e\u200b-\u200f\u202a-\u202e\u2060-\u2064\ufeff]/g;

/**
 * Normalises a short, single-line label — a colour, a size, a tag — so one
 * typed by hand and one pasted in compare equal. Strips the invisibles, folds
 * every run of whitespace to a single space, and trims. Not for prose: it
 * flattens line breaks.
 */
export const cleanText = (value: string) =>
  value.replace(INVISIBLE, "").replace(/\s+/g, " ").trim();
