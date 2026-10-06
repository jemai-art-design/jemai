import { prisma } from "../../lib/prisma";

/** Whole naira. The same flat rate the checkout quotes. */
const SHIPPING = 25000;

type SeedLine = { slug: string; colour: string; size: string; quantity?: number; };

type SeedOrder = {
  number: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  notes?: string;
  placedAt: string;
  /** Absent means paid — the ordinary case, and the only one that fulfills. */
  payment?: "Pending payment" | "Failed";
  status: "New" | "Processing" | "Ready for dispatch" | "Delivered";
  items: SeedLine[];
  /** Minutes after `placedAt` that each stage was reached, as far as it got. */
  stages?: { processing?: number; dispatched?: number; delivered?: number; };
};

const orderSeed: SeedOrder[] = [
  {
    number: 2048,
    name: "Ada Okafor",
    email: "ada.okafor@example.com",
    phone: "+234 701 660 1430",
    address: "12 Bourdillon Road",
    city: "Ikoyi",
    state: "Lagos",
    placedAt: "2026-08-18T08:42:00.000Z",
    status: "Processing",
    items: [{ slug: "alma-accent-chair", colour: "Red", size: "Organic" }],
    stages: { processing: 21 },
  },
  {
    number: 2047,
    name: "Teni Alade",
    email: "teni.alade@example.com",
    phone: "+234 704 667 6343",
    address: "4 Glover Road",
    city: "Ikoyi",
    state: "Lagos",
    notes: "Please call before delivery — the gate is usually locked until midday.",
    placedAt: "2026-08-18T07:15:00.000Z",
    status: "New",
    items: [{ slug: "mila-velvet-chair", colour: "Green", size: "Oversized fit", quantity: 2 }],
  },
  {
    number: 2046,
    name: "Kelechi Nwosu",
    email: "kelechi.nwosu@example.com",
    phone: "+234 703 118 9022",
    address: "27 Admiralty Way",
    city: "Lekki Phase 1",
    state: "Lagos",
    placedAt: "2026-08-17T15:48:00.000Z",
    status: "New",
    items: [{ slug: "nara-boucle-chair", colour: "White", size: "Organic" }],
  },
  {
    number: 2045,
    name: "Mathilde Lewis",
    email: "mathilde.lewis@example.com",
    phone: "+234 806 442 7781",
    address: "9 Kingsway Road",
    city: "Ikoyi",
    state: "Lagos",
    placedAt: "2026-08-17T13:02:00.000Z",
    status: "New",
    items: [{ slug: "stone-armchair", colour: "Charcoal", size: "Organic" }],
  },
  {
    number: 2044,
    name: "Olly Schroeder",
    email: "olly.schroeder@example.com",
    phone: "+234 802 337 5510",
    address: "31 Ozumba Mbadiwe Avenue",
    city: "Victoria Island",
    state: "Lagos",
    placedAt: "2026-08-17T10:26:00.000Z",
    status: "New",
    items: [{ slug: "ayo-side-table", colour: "Walnut", size: "" }],
  },
  {
    // One checkout that opened a payment and never came back. It is here on
    // purpose: an abandoned order is a state the console has to be able to
    // read, and the only place it can be seen is the index.
    number: 2043,
    name: "Julius Vaughan",
    email: "julius.vaughan@example.com",
    phone: "+234 805 220 4419",
    address: "18 Milverton Road",
    city: "Ikoyi",
    state: "Lagos",
    placedAt: "2026-08-16T16:34:00.000Z",
    payment: "Pending payment",
    status: "New",
    items: [{ slug: "alma-accent-chair", colour: "Blue", size: "Oversized fit" }],
  },
  {
    number: 2042,
    name: "Zaid Schwartz",
    email: "zaid.schwartz@example.com",
    phone: "+234 809 771 2264",
    address: "6 Alexander Avenue",
    city: "Ikoyi",
    state: "Lagos",
    placedAt: "2026-08-16T12:09:00.000Z",
    status: "Ready for dispatch",
    items: [{ slug: "mila-velvet-chair", colour: "Red", size: "Organic" }],
    stages: { processing: 92, dispatched: 1211 },
  },
  {
    number: 2041,
    name: "Ngozi Eze",
    email: "ngozi.eze@example.com",
    phone: "+234 703 909 6612",
    address: "22 Norman Williams Street",
    city: "Ikoyi",
    state: "Lagos",
    placedAt: "2026-08-15T09:55:00.000Z",
    status: "Delivered",
    items: [{ slug: "ayo-side-table", colour: "Oak", size: "", quantity: 2 }],
    stages: { processing: 77, dispatched: 1365, delivered: 2950 },
  },
  {
    // The one card that was declined. Nothing was charged and nothing is owed;
    // the row exists so the customer writing in can be answered.
    number: 2040,
    name: "Bisi Adeyemi",
    email: "bisi.adeyemi@example.com",
    phone: "+234 807 554 3390",
    address: "14 Karimu Kotun Street",
    city: "Victoria Island",
    state: "Lagos",
    placedAt: "2026-08-14T17:21:00.000Z",
    payment: "Failed",
    status: "New",
    items: [
      { slug: "stone-armchair", colour: "Charcoal", size: "Organic" },
      { slug: "ayo-side-table", colour: "Walnut", size: "" },
    ],
  },
  {
    number: 2039,
    name: "Femi Bankole",
    email: "femi.bankole@example.com",
    phone: "+234 810 226 8874",
    address: "3 Oyinkan Abayomi Drive",
    city: "Ikoyi",
    state: "Lagos",
    placedAt: "2026-08-14T08:38:00.000Z",
    status: "Ready for dispatch",
    items: [{ slug: "nara-boucle-chair", colour: "Charcoal", size: "Organic" }],
    stages: { processing: 97, dispatched: 1464 },
  },
  {
    number: 2038,
    name: "Amara Chukwu",
    email: "amara.chukwu@example.com",
    phone: "+234 806 118 4407",
    address: "45 Awolowo Road",
    city: "Ikoyi",
    state: "Lagos",
    placedAt: "2026-08-13T14:44:00.000Z",
    status: "Delivered",
    items: [{ slug: "mila-velvet-chair", colour: "Blue", size: "Organic" }],
    stages: { processing: 78, dispatched: 1087, delivered: 2803 },
  },
  {
    number: 2037,
    name: "Tunde Bakare",
    email: "tunde.bakare@example.com",
    phone: "+234 802 663 1195",
    address: "8 Musa Yar'Adua Street",
    city: "Victoria Island",
    state: "Lagos",
    placedAt: "2026-08-12T11:07:00.000Z",
    status: "Delivered",
    items: [{ slug: "alma-accent-chair", colour: "Red", size: "Organic", quantity: 3 }],
    stages: { processing: 146, dispatched: 1212, delivered: 2913 },
  },
];

/** A stage's stamp, as minutes on from when the order was placed. */
const stageAt = (placedAt: string, minutes?: number) =>
  minutes === undefined ? null : new Date(new Date(placedAt).getTime() + minutes * 60_000);

/** A reference in the shape `paymentReference` would have minted for it. */
const reference = (number: number) => `JEM-ORD-SEED${String(number).padStart(16, "0")}`;

export const seedOrders = async () => {
  if (await prisma.order.count()) return 0;

  const catalogue = await prisma.furniture.findMany({
    where: { slug: { in: [...new Set(orderSeed.flatMap((o) => o.items.map((i) => i.slug)))] } },
    include: { variants: { orderBy: { position: "asc" } } },
  });

  // Orders are priced off the catalogue, so without one there is nothing to
  // write. That only happens when the furniture seed was skipped.
  if (catalogue.length === 0) return 0;

  let written = 0;

  for (const order of orderSeed) {
    const lines = order.items.flatMap((line, position) => {
      const piece = catalogue.find((record) => record.slug === line.slug);
      if (!piece) return [];

      // Every fixture line names a colourway the seeded piece actually runs in,
      // so the order sheet and the product it points at agree with each other.
      const variant = piece.variants.find(
        (row) => row.colour === line.colour && row.size === line.size,
      );
      if (!variant) return [];

      return [
        {
          furnitureId: piece.id,
          variantId: variant.id,
          name: piece.name,
          slug: piece.slug,
          image: variant.images[0] ?? piece.thumbnail ?? "",
          colour: line.colour,
          size: line.size,
          unitPrice: piece.price,
          quantity: line.quantity ?? 1,
          position,
        },
      ];
    });

    if (lines.length === 0) continue;

    const subtotal = lines.reduce((total, line) => total + line.unitPrice * line.quantity, 0);
    const paid = !order.payment;

    await prisma.order.create({
      data: {
        number: order.number,
        reference: reference(order.number),
        name: order.name,
        email: order.email,
        phone: order.phone,
        address: order.address,
        city: order.city,
        state: order.state,
        country: "Nigeria",
        notes: order.notes ?? "",
        subtotal,
        shipping: SHIPPING,
        total: subtotal + SHIPPING,
        amountPaid: paid ? subtotal + SHIPPING : null,
        payment: order.payment ?? "Paid",
        status: order.status,
        placedAt: new Date(order.placedAt),
        // An unpaid order was never settled, whatever its fulfillment says.
        paidAt: paid ? stageAt(order.placedAt, 3) : null,
        processingAt: stageAt(order.placedAt, order.stages?.processing),
        dispatchedAt: stageAt(order.placedAt, order.stages?.dispatched),
        deliveredAt: stageAt(order.placedAt, order.stages?.delivered),
        items: { create: lines },
      },
    });

    written += 1;
  }

  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('furniture_orders', 'number'), (SELECT MAX("number") FROM "furniture_orders"))`,
  );

  return written;
};
