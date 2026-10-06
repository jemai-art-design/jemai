import { prisma } from "../../lib/prisma";

/**
 * The catalogue the Figma frames were drawn against. Written only into an empty
 * furniture table, so re-running the seed never overwrites what the console has
 * authored since.
 */
const blurb =
  "The unisex Classic Eames is designed to elevate the joy of feeling comfortable at home or when relaxing in nature. The chair are designed in a traditional style.";

/**
 * The stand-in shots the seeded variants run in. A colour draws the same set
 * whatever size it comes in, which is how the console's form propagates them.
 */
const shots = [
  "/figma/home/p-alma.png",
  "/figma/home/p-mila.png",
  "/figma/home/p-nara.png",
  "/figma/home/p-stone.png",
];

/** Three of the range, starting from a different one per colour. */
const imagesFor = (colour: string) => {
  const offset = [...colour].reduce((sum, letter) => sum + letter.charCodeAt(0), 0);
  return [0, 1, 2].map((n) => shots[(offset + n) % shots.length]);
};

const furnitureSeed = [
  {
    slug: "alma-accent-chair",
    name: "Alma Accent Chair",
    category: "Lounge",
    price: 458210,
    image: "/figma/home/p-alma.png",
    variants: [
      { size: "Organic", colour: "Red", quantity: 10 },
      { size: "Oversized fit", colour: "Blue", quantity: 8 },
    ],
  },
  {
    slug: "mila-velvet-chair",
    name: "Mila Velvet Chair",
    category: "Table",
    price: 387100,
    image: "/figma/home/p-mila.png",
    variants: [
      { size: "Organic", colour: "Red", quantity: 4 },
      { size: "Organic", colour: "Blue", quantity: 3 },
      { size: "Oversized fit", colour: "Green", quantity: 5 },
    ],
  },
  {
    slug: "nara-boucle-chair",
    name: "Nara Bouclé Chair",
    category: "Sofa",
    price: 718010,
    image: "/figma/home/p-nara.png",
    variants: [
      { size: "Organic", colour: "White", quantity: 4 },
      { size: "Organic", colour: "Charcoal", quantity: 2 },
    ],
  },
  {
    slug: "stone-armchair",
    name: "Stone Armchair",
    category: "Lounge",
    price: 295000,
    image: "/figma/home/p-stone.png",
    variants: [{ size: "Organic", colour: "Charcoal", quantity: 9 }],
  },
  {
    slug: "ayo-side-table",
    name: "Ayo Side Table",
    category: "Lounge",
    price: 650000,
    image: "/figma/home/p-alma.png",
    variants: [
      { size: "", colour: "Oak", quantity: 20 },
      { size: "", colour: "Walnut", quantity: 14 },
    ],
  },
  {
    slug: "mila-velvet-setee",
    name: "Mila Velvet Setee",
    category: "Setee",
    price: 945000,
    image: "/figma/home/p-mila.png",
    variants: [
      { size: "Organic", colour: "Red", quantity: 2 },
      { size: "Organic", colour: "Blue", quantity: 3 },
      // The larger frame costs more than the piece's own price; every other
      // seeded row sells at whatever its product costs.
      { size: "Oversized fit", colour: "Green", price: 1_120_000, quantity: 3 },
    ],
  },
];

export const seedFurniture = async () => {
  if (await prisma.furniture.count()) return 0;

  for (const item of furnitureSeed)
    await prisma.furniture.create({
      data: {
        slug: item.slug,
        name: item.name,
        category: item.category,
        price: item.price,
        stock: item.variants.reduce((sum, variant) => sum + variant.quantity, 0),
        summary: blurb,
        description: blurb,
        timeline: blurb,
        customization: blurb,
        thumbnail: item.image,
        variants: {
          // Imagery hangs off the combination, so each row carries its own set
          // — the frame swaps to it the moment a shopper picks that colour.
          create: item.variants.map((variant, position) => ({
            ...variant,
            images: imagesFor(variant.colour),
            position,
          })),
        },
      },
    });

  return furnitureSeed.length;
};
