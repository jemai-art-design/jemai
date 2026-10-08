/**
 * Every static image location on the storefront — what it is called, where it
 * is drawn, how many pictures it holds, and the pictures the site ships with.
 *
 * A *location* is a code fact: it exists because a component draws it, so it is
 * declared here rather than stored. What the console stores is the override —
 * see `SiteImageSlot` in the schema — which is why the defaults below are not
 * seed data. They are what a location falls back to the moment its override is
 * removed, so the site has never a missing picture to draw.
 *
 * This sits apart from `lib/site-images` because the manage screen is a client
 * component and that module carries Prisma, which has no business in a browser
 * bundle — the same split `lib/project-kinds` makes against `lib/projects`.
 *
 * **Not here, on purpose.** The brand wordmarks, the badge, the three assurance
 * icons and the carousel arrows are SVG, which the uploader refuses because an
 * SVG can carry script; the footer's arch lattice is a tile repeated at its
 * native size, where "contain or cover" has no meaning. All five are brand
 * chrome rather than page photography. Catalogue, exhibition and project
 * photography is not here either — it belongs to its record, and is uploaded on
 * that record's own screen.
 */

import uploadedDefaults from "@/lib/site-image-defaults.json";

/** Whether a picture fills its box or sits whole inside it. */
export type ImageFit = "cover" | "contain";

export type SiteImage = {
  /**
   * Stable for the life of the picture, and the last segment of its Cloudinary
   * public id. Replacing a picture keeps its key, which is what makes the
   * upload overwrite the file it replaces instead of leaving it behind.
   */
  key: string;
  src: string;
  alt: string;
  fit: ImageFit;
};

export type SiteImagePage = {
  id: string;
  /** The tab's label. */
  title: string;
  /** The routes its locations are drawn on, as the tab names them. */
  paths: string[];
  description: string;
};

export type SiteImageSlotMeta = {
  /** `home.hero` — the registry key, and the row's `slot`. */
  slot: string;
  page: string;
  label: string;
  description: string;
  /** A carousel, a rail or a tile set — the location holds several pictures. */
  multiple?: boolean;
  /**
   * The composition fixes the count: each picture is replaced in place and none
   * may be added or removed. A mosaic with four holes and a row of tiles whose
   * labels and links are authored in code are both this — an added picture
   * would have no copy to carry and nowhere to sit.
   */
  fixed?: boolean;
  /** Ceiling for an open carousel. Ignored when `fixed`. */
  max?: number;
  /** "1440 × 600, landscape" — the shape the frame draws it at. */
  guidance?: string;
  /**
   * The page draws this one `aria-hidden` with an empty alt — a plate, a ground
   * or a cut-out that says nothing a screen reader needs. The manage screen
   * leaves the alt field off rather than offering copy the site will not use.
   */
  decorative?: boolean;
  defaults: SiteImage[];
};

export const siteImagePages: SiteImagePage[] = [
  {
    id: "home",
    title: "Home",
    paths: ["/"],
    description:
      "The opening carousel, the four category tiles and the two photographs the art and exhibition bands are built on.",
  },
  {
    id: "about",
    title: "About",
    paths: ["/about"],
    description:
      "The page header, the four-square values mosaic and the photograph behind the founder's note.",
  },
  {
    id: "exhibitions",
    title: "Exhibitions",
    paths: ["/exhibitions", "/exhibitions/past"],
    description:
      "The hero carousel on each of the two indexes, and the photograph a show falls back to before its own has been uploaded.",
  },
  {
    id: "christmas",
    title: "Christmas styling",
    paths: ["/christmas-styling"],
    description:
      "The campaign's hero and capacity plate, the four decoration-area photographs, the confirmation panel and the festive cut-outs.",
  },
  {
    id: "shared",
    title: "Shared",
    paths: ["/", "/about", "/furniture", "/artworks"],
    description:
      "Pictures that are not owned by one page: the consultation band several pages close on, and the two plates that stand in for a record whose own photography has not been uploaded yet.",
  },
];

/**
 * Every location, with the photograph the repository itself holds for it.
 *
 * These `src` values are paths under `public/`, and they are what
 * `scripts/upload-site-images.ts` reads when it seeds Cloudinary. Keeping them
 * here rather than replacing them with the hosted URLs is what lets the script
 * be re-run against a fresh cloud — the repository stays the original, and the
 * cloud is a copy of it.
 */
export const shippedSiteImageSlots: SiteImageSlotMeta[] = [
  /* ── Home ─────────────────────────────────────────────────────────────── */
  {
    slot: "home.hero",
    page: "home",
    label: "Hero carousel",
    description:
      "The full-bleed band the home page opens on. The four slides the site ships with each carry a headline and a button drawn over them; a slide added here shows its photograph alone.",
    multiple: true,
    max: 8,
    guidance: "1440 × 600, landscape. Copy sits over the middle, so keep it clear.",
    defaults: [
      {
        key: "world",
        src: "/figma/home/hero.jpg",
        alt: "A linen sofa beside a brass dome lamp and a potted plant",
        fit: "cover",
      },
      {
        key: "furniture",
        src: "/figma/home/cat-furniture.jpg",
        alt: "A sculptural armchair in a sunlit room",
        fit: "cover",
      },
      {
        key: "art",
        src: "/figma/home/art-gallery.jpg",
        alt: "Framed works hung along a gallery wall",
        fit: "cover",
      },
      {
        key: "exhibitions",
        src: "/figma/home/ex-slide-1.jpg",
        alt: "Visitors moving through an exhibition space",
        fit: "cover",
      },
    ],
  },
  {
    slot: "home.categories",
    page: "home",
    label: "Category tiles",
    description:
      "The four square tiles under “Signature Style for Every Square Inch”. Their labels and links are authored in the page, so the pictures are replaced in place — Design, Furniture, Art and Exhibitions, in that order.",
    multiple: true,
    fixed: true,
    guidance: "Square, 1000 × 1000 or larger",
    defaults: [
      {
        key: "design",
        src: "/figma/home/cat-architecture.jpg",
        alt: "An architectural interior with a sweeping staircase",
        fit: "cover",
      },
      {
        key: "furniture",
        src: "/figma/home/cat-furniture.jpg",
        alt: "A seating group arranged around a low table",
        fit: "cover",
      },
      {
        key: "art",
        src: "/figma/home/cat-artworks.jpg",
        alt: "A framed work on a gallery wall",
        fit: "cover",
      },
      {
        key: "exhibitions",
        src: "/figma/home/cat-exhibitions.jpg",
        alt: "Visitors in a gallery room during an exhibition",
        fit: "cover",
      },
    ],
  },
  {
    slot: "home.art-backdrop",
    page: "home",
    label: "Curator’s pick backdrop",
    description:
      "The gallery photograph the Curator’s Pick carousel sits on, in the “Art That Changes the Feeling of a Space” band. A scrim runs over it, so it can be dark.",
    guidance: "1440 × 620, landscape",
    defaults: [
      {
        key: "backdrop",
        src: "/figma/home/art-gallery.jpg",
        alt: "",
        fit: "cover",
      },
    ],
  },
  {
    slot: "home.exhibition-still",
    page: "home",
    label: "Up next photograph",
    description:
      "The half-bleed photograph beside the featured exhibition, in the “Where Art, Artists and Audiences Meet” band. The show’s own picture is drawn to its right and comes from the exhibition record.",
    guidance: "720 × 900, portrait",
    defaults: [
      {
        key: "still",
        src: "/figma/home/ex-sculpture.jpg",
        alt: "Wire sculpture of a figure in a patterned room",
        fit: "cover",
      },
    ],
  },

  /* ── About ────────────────────────────────────────────────────────────── */
  {
    slot: "about.header",
    page: "about",
    label: "Page header photograph",
    description:
      "The square photograph beside “Where Furniture, Art And Space Come Together” at the top of the page.",
    guidance: "Square, 1200 × 1200 or larger",
    defaults: [
      {
        key: "header",
        src: "/figma/home/about-header.png",
        alt: "A furnished living space with layered textures and framed artwork",
        fit: "cover",
      },
    ],
  },
  {
    slot: "about.values",
    page: "about",
    label: "Values mosaic",
    description:
      "The four squares around “The Principles Behind the Choices We Make”. The mosaic has four holes and the copy panels sit between them, so the pictures are replaced in place: first beside the values panel, then the pair below it, then the one beside the closing line.",
    multiple: true,
    fixed: true,
    guidance: "Square, 1000 × 1000 or larger",
    defaults: [
      {
        key: "beside-values",
        src: "/figma/home/cat-furniture.jpg",
        alt: "A seating group arranged around a low table",
        fit: "cover",
      },
      {
        key: "pair-left",
        src: "/figma/home/art-gallery.jpg",
        alt: "Framed works hung along a gallery wall",
        fit: "cover",
      },
      {
        key: "pair-right",
        src: "/figma/home/sp-bathhouse.jpg",
        alt: "A stone-lined interior lit from above",
        fit: "cover",
      },
      {
        key: "beside-closing",
        src: "/figma/home/cat-architecture.jpg",
        alt: "An architectural interior with a sweeping staircase",
        fit: "cover",
      },
    ],
  },
  {
    slot: "about.founder",
    page: "about",
    label: "Founder’s note backdrop",
    description:
      "The full-bleed photograph “A Note From Our Founder” is written over. The note’s panel covers its left half at desktop, so the subject belongs on the right.",
    guidance: "1440 × 565, landscape",
    defaults: [
      {
        key: "backdrop",
        src: "/figma/home/art-gallery.jpg",
        alt: "A visitor standing before framed paintings in a gallery",
        fit: "cover",
      },
    ],
  },

  /* ── Exhibitions ──────────────────────────────────────────────────────── */
  {
    slot: "exhibitions.upcoming-hero",
    page: "exhibitions",
    label: "Upcoming hero carousel",
    description:
      "The band the upcoming index opens on. No exhibition owns it — it is the gallery’s own photography, so it does not change as the programme does.",
    multiple: true,
    max: 8,
    guidance: "1440 × 501, landscape",
    defaults: [
      {
        key: "room",
        src: "/figma/exhibitions/hero-upcoming.jpg",
        alt: "A JEMAI gallery room hung with framed landscapes",
        fit: "cover",
      },
      {
        key: "visitors",
        src: "/figma/artworks/hero.jpg",
        alt: "Visitors viewing framed works in the JEMAI gallery",
        fit: "cover",
      },
      {
        key: "sculpture",
        src: "/figma/home/ex-sculpture.jpg",
        alt: "A sculpture on a plinth in the gallery",
        fit: "cover",
      },
    ],
  },
  {
    slot: "exhibitions.past-hero",
    page: "exhibitions",
    label: "Past hero carousel",
    description: "The same band on the archive at /exhibitions/past.",
    multiple: true,
    max: 8,
    guidance: "1440 × 501, landscape",
    defaults: [
      {
        key: "red-wall",
        src: "/figma/exhibitions/hero-past.jpg",
        alt: "Three framed paintings on a deep red gallery wall",
        fit: "cover",
      },
      {
        key: "visitors",
        src: "/figma/artworks/hero.jpg",
        alt: "Visitors viewing framed works in the JEMAI gallery",
        fit: "cover",
      },
      {
        key: "framed-work",
        src: "/figma/home/ex-slide-1.jpg",
        alt: "Visitors before a framed work in the gallery",
        fit: "cover",
      },
    ],
  },
  {
    slot: "exhibitions.fallback-hero",
    page: "exhibitions",
    label: "Exhibition fallback photograph",
    description:
      "Stands in wherever a show has no photograph of its own yet — its card on the two indexes, its own page, and the works listed on it. Upload the show’s picture on its record to replace it for that show alone.",
    guidance: "1440 × 501, landscape",
    defaults: [
      {
        key: "fallback",
        src: "/figma/exhibitions/detail-hero.jpg",
        alt: "A JEMAI gallery room",
        fit: "cover",
      },
    ],
  },

  /* ── Christmas styling ────────────────────────────────────────────────── */
  {
    slot: "christmas.hero",
    page: "christmas",
    label: "Hero photograph",
    description:
      "The band the campaign opens on. The copy is drawn straight over it with no scrim of its own, so the picture needs to carry its own contrast.",
    guidance: "1440 × 501, landscape, already darkened",
    defaults: [
      { key: "hero", src: "/figma/christmas/hero.jpg", alt: "", fit: "cover" },
    ],
  },
  {
    slot: "christmas.capacity-frame",
    page: "christmas",
    label: "Capacity plate",
    description:
      "The gift-wrap ground behind the remaining-slots count in section 01. The count sits on a panel inset from its edges, so only the border of this picture is seen.",
    guidance: "548 × 605, portrait",
    decorative: true,
    defaults: [
      {
        key: "plate",
        src: "/figma/christmas/capacity-frame.jpg",
        alt: "",
        fit: "cover",
      },
    ],
  },
  {
    slot: "christmas.spaces",
    page: "christmas",
    label: "Decoration area photographs",
    description:
      "The rail in section 02, one slide per decoration area the request form offers. The areas are the campaign’s own vocabulary, so the pictures are replaced in place.",
    multiple: true,
    fixed: true,
    guidance: "330 × 331, landscape",
    defaults: [
      {
        key: "exterior",
        src: "/figma/christmas/spaces/exterior.jpg",
        alt: "Exterior & Compound",
        fit: "cover",
      },
      {
        key: "living-dining",
        src: "/figma/christmas/spaces/living-dining.jpg",
        alt: "Living + Dining",
        fit: "cover",
      },
      {
        key: "bedrooms",
        src: "/figma/christmas/spaces/bedrooms.jpg",
        alt: "Bedrooms",
        fit: "cover",
      },
      {
        key: "kitchen",
        src: "/figma/christmas/spaces/kitchen.jpg",
        alt: "Kitchen",
        fit: "cover",
      },
    ],
  },
  {
    slot: "christmas.confirmation",
    page: "christmas",
    label: "Confirmation panel photograph",
    description:
      "The left half of the panel that opens once a Christmas request has been filed, and of the one that says an address has already been used.",
    guidance: "544 × 563, portrait",
    decorative: true,
    defaults: [
      {
        key: "panel",
        src: "/figma/christmas/modal.jpg",
        alt: "",
        fit: "cover",
      },
    ],
  },
  {
    slot: "christmas.wreath",
    page: "christmas",
    label: "Wreath cut-out",
    description:
      "The cut-out hanging to the right of section 01. Decoration, drawn at desktop only — a cut-out wants a transparent PNG and “Contain”, so it is not stretched.",
    guidance: "180 × 126, transparent PNG",
    decorative: true,
    defaults: [
      {
        key: "wreath",
        src: "/figma/christmas/wreath.png",
        alt: "",
        fit: "contain",
      },
    ],
  },
  {
    slot: "christmas.garland",
    page: "christmas",
    label: "Garland strip",
    description:
      "The strip across the top of section 05 — the request form, and the closed notice that replaces it once the season is full.",
    guidance: "1440 × 254, transparent PNG",
    decorative: true,
    defaults: [
      {
        key: "garland",
        src: "/figma/christmas/garland.png",
        alt: "",
        fit: "contain",
      },
    ],
  },
  {
    slot: "christmas.reindeer",
    page: "christmas",
    label: "Reindeer cut-out",
    description:
      "The cut-out in the bottom right of section 05, on both the request form and the closed notice. Desktop only.",
    guidance: "140 × 167, transparent PNG",
    decorative: true,
    defaults: [
      {
        key: "reindeer",
        src: "/figma/christmas/reindeer.png",
        alt: "",
        fit: "contain",
      },
    ],
  },
  {
    slot: "christmas.baubles",
    page: "christmas",
    label: "Baubles cut-out",
    description:
      "The pair hanging over section 04, “A Personal Process”. Desktop only.",
    guidance: "155 × 135, transparent PNG",
    decorative: true,
    defaults: [
      {
        key: "baubles",
        src: "/figma/christmas/baubles.png",
        alt: "",
        fit: "contain",
      },
    ],
  },

  /* ── Shared ───────────────────────────────────────────────────────────── */
  {
    slot: "shared.consultation-cta",
    page: "shared",
    label: "Consultation band photograph",
    description:
      "The photograph beside “Let’s Shape A Space That Feels Entirely Your Own.” The band closes the home page, the About page and the furniture catalogue, so this one picture is drawn on all three.",
    guidance: "720 × 445, landscape",
    defaults: [
      {
        key: "band",
        src: "/figma/home/consultation.jpg",
        alt: "A contemporary interior with a framed artwork and staircase",
        fit: "cover",
      },
    ],
  },
  {
    slot: "shared.furniture-placeholder",
    page: "shared",
    label: "Furniture fallback plate",
    description:
      "Stands in for a piece whose photography has not been uploaded yet — on the catalogue, the home page’s featured row, the product page and the cart. Upload the piece’s own shots on its record to replace it for that piece alone.",
    guidance: "1200 × 1600 (3:4)",
    defaults: [
      {
        key: "plate",
        src: "/figma/home/p-mila.png",
        alt: "JEMAI furniture",
        fit: "cover",
      },
    ],
  },
  {
    slot: "shared.artwork-placeholder",
    page: "shared",
    label: "Artwork fallback plate",
    description:
      "Stands in for a work whose photography has not been uploaded yet — on the gallery grid, the Curator’s Pick and the work’s own page.",
    guidance: "1200 × 1600 (3:4)",
    defaults: [
      {
        key: "plate",
        src: "/figma/artworks/work-01.jpg",
        alt: "JEMAI artwork",
        fit: "cover",
      },
    ],
  },
];

/**
 * Where the shipped photography has been uploaded to, written by
 * `scripts/upload-site-images.ts` and keyed `"<slot>/<key>"`.
 *
 * Empty until the script is first run, which is deliberate: an unseeded
 * checkout draws the files in `public/` and works offline, and every entry
 * that lands here is one more file that can leave the repository.
 */
const hosted: Record<string, string> = uploadedDefaults;

/**
 * The locations as the site draws them — the shipped list with the hosted URL
 * laid over any picture that has one.
 *
 * The overlay is here rather than baked into the list above so that seeding the
 * cloud is a one-file diff an author can read, instead of thirty `src` strings
 * rewritten by a script in the middle of prose.
 */
export const siteImageSlots: SiteImageSlotMeta[] = shippedSiteImageSlots.map(
  (meta) => ({
    ...meta,
    defaults: meta.defaults.map((image) => ({
      ...image,
      src: hosted[`${meta.slot}/${image.key}`] ?? image.src,
    })),
  }),
);

export const findSiteImageSlot = (slot: string) =>
  siteImageSlots.find((entry) => entry.slot === slot);

/**
 * A key the Cloudinary public id can be built from without escaping. Minted in
 * the browser when a picture is added, so it is checked again on arrival — an
 * action is a POST endpoint like any other, and `../` in a public id would
 * write outside the folder this console owns.
 */
export const SITE_IMAGE_KEY = /^[a-z0-9][a-z0-9-]{0,47}$/;

/**
 * How many pictures a location may hold. A fixed location holds exactly as many
 * as the composition has holes for.
 */
export const slotCapacity = (meta: SiteImageSlotMeta) => {
  if (!meta.multiple) return 1;
  if (meta.fixed) return meta.defaults.length;
  return meta.max ?? meta.defaults.length + 4;
};

/** The positional keys an open carousel's added pictures are filed under. */
const ADDED_KEY = /^slide-([1-9][0-9]?)$/;

/**
 * Whether a location can hold a picture under this key — one of the
 * composition's own, or one of the numbered slots an open carousel adds.
 *
 * This is the whole key space a location has, and it is bounded by its
 * capacity. That is what keeps the media library the size of the site: every
 * upload lands on one of these ids and writes over whatever was on it, so a
 * location can never be responsible for more assets than it draws.
 */
export const isSlotKey = (meta: SiteImageSlotMeta, key: string) => {
  if (!SITE_IMAGE_KEY.test(key)) return false;
  if (meta.defaults.some((image) => image.key === key)) return true;
  if (!meta.multiple || meta.fixed) return false;

  const added = ADDED_KEY.exec(key);
  return Boolean(added) && Number(added![1]) <= slotCapacity(meta);
};

/** `object-cover` or `object-contain`, as the stored fit asks for. */
export const objectFit = (fit?: ImageFit) =>
  fit === "contain" ? "object-contain" : "object-cover";
