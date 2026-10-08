// Must come first: lib/env validates process.env the moment it is imported.
import "dotenv/config";

import { access, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { cloudinaryCloudName, siteImagePublicId, uploadSiteImageFile } from "../lib/cloudinary";
import { SITE_IMAGE_FOLDER } from "../lib/constants";
import { prisma } from "../lib/prisma";
import { shippedSiteImageSlots } from "../lib/site-image-slots";

/**
 * Seeds Cloudinary with the storefront's static photography.
 *
 * Every picture the site ships with is a file in `public/figma`, which is the
 * one thing about this feature that still makes a photograph a deployment. This
 * copies each of them to the cloud under the same deterministic id the console
 * writes to — `site-images/<page>/<location>/<key>` — and records where each
 * one landed in `lib/site-image-defaults.json`, which the registry lays over
 * its own paths. Once a picture is in that file, the repository no longer has
 * to carry it, and a picture whose file has gone is re-uploaded from the copy
 * already in the cloud.
 *
 * Re-running is safe and is the point. The ids are deterministic, so a second
 * run overwrites rather than duplicates, and the folder stays exactly as large
 * as the site is. By default it only uploads what the map does not already
 * have; `--force` re-uploads everything, which is what a new cloud or a
 * re-exported frame wants.
 *
 * It then re-points the console's own saved overrides. A location saved on the
 * Site images screen before this ran holds a copy of whatever it was showing at
 * the time — repository paths — and the registry's defaults are not consulted
 * for a location that has a row. Those rows would be the one thing still
 * reaching into `public/figma` after everything else had moved, and they would
 * break silently the day the folder goes. The alt text and fit the studio set
 * are kept; only the source moves.
 *
 *   npm run site-images:upload
 *   npm run site-images:upload -- --force
 *   npm run site-images:upload -- --dry-run
 */

const MAP_PATH = join(process.cwd(), "lib", "site-image-defaults.json");

type Hosted = Record<string, string>;

const flags = new Set(process.argv.slice(2));
const force = flags.has("--force");
const dryRun = flags.has("--dry-run");

const readMap = async (): Promise<Hosted> => {
  try {
    return JSON.parse(await readFile(MAP_PATH, "utf8")) as Hosted;
  } catch {
    // A missing or unparsable map is a map with nothing in it — the registry
    // falls back to `public/` either way, so there is nothing to recover.
    return {};
  }
};

/** Sorted, so a re-run's diff is the pictures that changed and nothing else. */
const writeMap = async (hosted: Hosted) => {
  const sorted = Object.fromEntries(
    Object.entries(hosted).sort(([a], [b]) => a.localeCompare(b)),
  );
  await writeFile(MAP_PATH, `${JSON.stringify(sorted, null, 2)}\n`);
};

/**
 * Moves the console's saved locations off `public/` and onto the cloud.
 *
 * A row is a copy of what a location was showing when somebody pressed Save, so
 * one saved before the first upload holds repository paths — and because a
 * location with a row never consults its defaults, re-seeding the registry does
 * not reach it. Only the `src` is touched: the alt text and the fit are the
 * studio's work.
 *
 * A key with no hosted picture behind it is left alone and named. That is a
 * picture the registry does not ship, which has no file in `public/` to have
 * been uploaded — it should not be possible, and guessing at it is worse than
 * saying so.
 */
const relinkOverrides = async (hosted: Hosted) => {
  const rows = await prisma.siteImageSlot.findMany({
    select: { slot: true, images: true },
  });

  const stale = rows.filter((row) =>
    row.images.some((image) => image.src.startsWith("/")),
  );

  if (!stale.length) {
    console.log(
      rows.length
        ? `\n${rows.length} saved ${rows.length === 1 ? "location" : "locations"}, none pointing at the repository`
        : "\nNo saved locations to re-point",
    );
    return;
  }

  console.log(
    `\n${stale.length} saved ${stale.length === 1 ? "location" : "locations"} still pointing at the repository:`,
  );

  const orphans: string[] = [];

  for (const row of stale) {
    const images = row.images.map((image) => {
      if (!image.src.startsWith("/")) return image;

      const url = hosted[`${row.slot}/${image.key}`];
      if (!url) {
        orphans.push(`${row.slot}/${image.key} (${image.src})`);
        return image;
      }

      return { ...image, src: url };
    });

    const moved = images.filter((image, index) => image.src !== row.images[index].src).length;
    console.log(`  ${dryRun ? "→" : "✓"} ${row.slot}: ${moved} re-pointed`);

    if (!dryRun && moved)
      await prisma.siteImageSlot.update({ where: { slot: row.slot }, data: { images } });
  }

  if (orphans.length)
    console.log(`  ! no hosted picture for: ${orphans.join(", ")}`);
};

const main = async () => {
  const cloud = cloudinaryCloudName();
  if (!cloud)
    throw new Error("Cloudinary is not configured — set CLOUDINARY_URL in .env");

  const hosted = await readMap();

  const pictures = shippedSiteImageSlots.flatMap((meta) =>
    meta.defaults.map((image) => ({
      id: `${meta.slot}/${image.key}`,
      label: `${meta.label} · ${image.key}`,
      src: image.src,
      slot: meta.slot,
      key: image.key,
    })),
  );

  console.log(
    `${pictures.length} shipped pictures across ${shippedSiteImageSlots.length} locations`,
  );
  console.log(`Cloud: ${cloud} · folder: ${SITE_IMAGE_FOLDER}/`);
  if (dryRun) console.log("Dry run — nothing will be uploaded\n");
  else if (force) console.log("Force — every picture is re-uploaded\n");
  else console.log("Uploading what the map does not already hold\n");

  let uploaded = 0;
  let skipped = 0;
  const failed: string[] = [];

  for (const picture of pictures) {
    // A `src` that is already a URL has been pointed somewhere by hand; there
    // is no file in `public/` behind it to copy.
    if (!picture.src.startsWith("/")) {
      console.log(`  ─ ${picture.label}: not a repository file, left alone`);
      skipped += 1;
      continue;
    }

    if (hosted[picture.id] && !force) {
      skipped += 1;
      continue;
    }

    const target = siteImagePublicId(picture.slot, picture.key);

    // The repository file is the original, but once a picture is hosted the
    // file is free to leave `public/` — so a missing one falls back to the
    // copy already in the cloud. Cloudinary fetches a remote source itself,
    // which is what makes `--force` against a *fresh* cloud still work from a
    // checkout that no longer carries the pictures.
    const local = join(process.cwd(), "public", picture.src.slice(1));
    const source = await access(local).then(
      () => local,
      () => hosted[picture.id],
    );

    if (!source) {
      console.error(
        `  ✗ ${picture.label}: ${picture.src} is not in public/ and has never been uploaded`,
      );
      failed.push(picture.id);
      continue;
    }

    const via = source === local ? picture.src : "the existing upload";

    if (dryRun) {
      console.log(`  → ${via}\n    ${target}`);
      uploaded += 1;
      continue;
    }

    try {
      hosted[picture.id] = await uploadSiteImageFile(source, picture.slot, picture.key);
      uploaded += 1;
      console.log(`  ✓ ${picture.label} (from ${via})\n    ${target}`);
    } catch (error) {
      failed.push(picture.id);
      console.error(
        `  ✗ ${picture.label} (${via}): ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  // Written even after a partial failure: the pictures that did go up are in
  // the cloud whether or not the file records them, and losing the record is
  // how the next run uploads them a second time.
  if (!dryRun && uploaded) await writeMap(hosted);

  console.log(
    `\n${dryRun ? "Would upload" : "Uploaded"} ${uploaded}, skipped ${skipped}` +
    (failed.length ? `, failed ${failed.length}` : ""),
  );

  if (!dryRun && uploaded)
    console.log(
      "Wrote lib/site-image-defaults.json — commit it, and the files it covers can leave public/figma.",
    );

  await relinkOverrides(hosted);

  if (failed.length) {
    console.error(`\nFailed: ${failed.join(", ")}`);
    process.exitCode = 1;
  }
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
