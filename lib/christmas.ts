/**
 * The Christmas styling campaign's fixed vocabulary — the decoration areas the
 * request form offers and the property types it asks for. Both ends of the
 * application read these, so they live on the read side rather than beside
 * either screen.
 */

export type DecorationArea = {
  name: string;
  caption: string;
  /**
   * Room-based areas are counted; a compound is not. This is what decides
   * whether a selection adds a quantity row under the chips.
   */
  counted: boolean;
};

/**
 * The photography for these lives in the `christmas.spaces` site-image
 * location, in this same order, because it is the studio's to change — see
 * `lib/site-image-slots`.
 */
export const decorationAreas: DecorationArea[] = [
  {
    name: "Exterior & Compound",
    caption: "The arrival, frontage and outdoor spaces that set the first note.",
    counted: false,
  },
  {
    name: "Living + Dining",
    caption: "The shared rooms where people gather around food and conversation.",
    counted: true,
  },
  {
    name: "Bedrooms",
    caption: "A quieter festive language for private rooms and overnight guests.",
    counted: true,
  },
  {
    name: "Kitchen",
    caption: "Thoughtful details for the room at the heart of Christmas preparation.",
    counted: true,
  },
];

export const propertyTypes = [
  "Apartment",
  "Detached house",
  "Semi-detached house",
  "Duplex",
  "Bungalow",
  "Commercial space",
  "Other",
] as const;

/**
 * The season's fixed allocation — the same twenty every year.
 *
 * Availability is this less the requests that have been **paid**, not the ones
 * that have been submitted: the form is an enquiry, and a slot is only spent
 * once the studio has agreed a price and taken payment outside the system.
 */
export const seasonCapacity = 20;

/** One selected area on a request, with the number of rooms it covers. */
export type RequestedArea = { area: string; quantity: number };

/**
 * Where a request has got to.
 *
 * Only `Paid` consumes a slot. `New` is a request nobody has picked up yet,
 * `In conversation` is one the studio is pricing, and `Closed` is one that will
 * not proceed — which puts its slot back.
 */
export const christmasStatuses = [
  "New",
  "In conversation",
  "Paid",
  "Closed",
] as const;

export type ChristmasStatus = (typeof christmasStatuses)[number];
