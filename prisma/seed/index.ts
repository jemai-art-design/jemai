// Must come first: lib/env validates process.env the moment it is imported.
import "dotenv/config";

import env from "../../lib/env";
import { prisma } from "../../lib/prisma";
import { seedAdmin } from "./admin";
import { seedArtists } from "./artists";
import { seedArtworks } from "./artworks";
import { seedChristmasRequests } from "./christmas";
import { seedConsultations } from "./consultations";
import { seedEnquiries } from "./enquiries";
import { seedExhibitions } from "./exhibitions";
import { seedFurniture } from "./furniture";
import { seedSubscribers } from "./newsletter";
import { seedOrders } from "./orders";
import { seedProjects } from "./projects";
import { seedTaxonomy } from "./taxonomy";

type Seed = {
  run: () => Promise<number>;
  one: string;
  many: string;
  subject: string;
};

const essential: Seed[] = [
  { run: seedTaxonomy, one: "catalogue term", many: "catalogue terms", subject: "Categories and mediums" },
  { run: seedProjects, one: "design project", many: "design projects", subject: "Design projects" },
];

const demo: Seed[] = [
  { run: seedArtists, one: "artist", many: "artists", subject: "Artists" },
  { run: seedFurniture, one: "furniture product", many: "furniture products", subject: "Furniture" },
  { run: seedArtworks, one: "artwork", many: "artworks", subject: "Artworks" },
  { run: seedSubscribers, one: "newsletter subscriber", many: "newsletter subscribers", subject: "Subscribers" },
  { run: seedEnquiries, one: "artwork enquiry", many: "artwork enquiries", subject: "Enquiries" },
  { run: seedExhibitions, one: "exhibition", many: "exhibitions", subject: "Exhibitions" },
  { run: seedConsultations, one: "consultation request", many: "consultation requests", subject: "Consultation requests" },
  { run: seedChristmasRequests, one: "Christmas request", many: "Christmas requests", subject: "Christmas requests" },
  { run: seedOrders, one: "furniture order", many: "furniture orders", subject: "Orders" },
];

const main = async () => {
  const admin = await seedAdmin();
  console.log(`Seeded admin ${admin.email} (${admin.permissions.length} permissions)`);

  const production = env.NODE_ENV === "production";
  if (production) console.log("Production environment — skipping demo seeds");

  const seeds = production ? essential : [...essential, ...demo];

  for (const seed of seeds) {
    const count = await seed.run();
    console.log(
      count
        ? `Seeded ${count} ${count === 1 ? seed.one : seed.many}`
        : `${seed.subject} already present — left untouched`,
    );
  }
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
