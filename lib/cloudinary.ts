import { v2 as cloudinary } from "cloudinary";
import * as Yup from "yup";

import { ALLOWED_IMAGE_FORMATS, CLOUDINARY_FOLDER } from "@/lib/constants";
import env from "@/lib/env";

const CONNECTION = /^cloudinary:\/\/([^:@/]+):([^:@/]+)@([^:@/]+)$/;

const connection = () => {
  const parts = env.CLOUDINARY_URL ? CONNECTION.exec(env.CLOUDINARY_URL) : null;
  if (!parts) return null;

  const [, apiKey, apiSecret, cloudName] = parts;
  return { apiKey, apiSecret, cloudName };
};

/** The cloud uploads live on, or null when none is configured. */
export const cloudinaryCloudName = () => connection()?.cloudName ?? null;

const credentials = () => {
  const parsed = connection();
  if (!parsed)
    throw new Error("Cloudinary is not configured — set CLOUDINARY_URL");

  return parsed;
};

/** Points the SDK at this account. Idempotent, so every upload may call it. */
const configure = () => {
  const { cloudName, apiKey, apiSecret } = credentials();
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
};

export const uploadImage = async (file: File) => {
  configure();

  const bytes = Buffer.from(await file.arrayBuffer());

  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: CLOUDINARY_FOLDER,
        allowed_formats: ALLOWED_IMAGE_FORMATS.split(","),
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result?.secure_url)
          return reject(new Error("Cloudinary returned no URL for the upload"));
        resolve(result.secure_url);
      },
    );

    stream.end(bytes);
  });
};


/**
 * Where a static site image lives in the media library — the slot's own path
 * under `jemai/site`, with the picture's key as the file name.
 *
 * Deterministic on purpose. A location's picture is replaced far more often
 * than the catalogue's is, and a random id per upload would leave the studio
 * with a folder of supplanted photographs and no way to tell which one the site
 * is drawing. Keyed this way, the replacement *is* the old asset: same id, new
 * bytes, CDN copies purged.
 */
export const siteImagePublicId = (slot: string, key: string) =>
  `${CLOUDINARY_FOLDER}/site/${slot.replace(/\./g, "/")}/${key}`;

/**
 * Puts a picture in a site image location, over whatever was there.
 *
 * `slot` and `key` reach here from the browser, so both are checked against the
 * registry by the action before this is called — an unchecked key would write
 * outside the folder this console owns.
 */
export const uploadSiteImage = async (file: File, slot: string, key: string) => {
  configure();

  const bytes = Buffer.from(await file.arrayBuffer());

  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: siteImagePublicId(slot, key),
        // The id is the whole path, so the folder must not be prepended again,
        // and neither the picked file's name nor a uniquifying suffix may be
        // allowed to move it.
        use_filename: false,
        unique_filename: false,
        overwrite: true,
        // Purges the CDN copies of the id being written over. Without it the
        // old photograph is served from the edge for hours after the swap.
        invalidate: true,
        allowed_formats: ALLOWED_IMAGE_FORMATS.split(","),
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result?.secure_url)
          return reject(new Error("Cloudinary returned no URL for the upload"));
        // The URL carries the asset's version, so it changes on every
        // overwrite — which is what gets the new picture past Next's image
        // cache as well as the browser's.
        resolve(result.secure_url);
      },
    );

    stream.end(bytes);
  });
};

/**
 * Drops the asset behind a picture that has been taken out of a location.
 *
 * Best effort: the location has already been saved without it by the time this
 * runs, and a left-behind asset in the media library is not a reason to tell
 * the studio their save failed. `not found` is the ordinary answer for a
 * picture that was never replaced — its source is still the file the site
 * shipped with, which Cloudinary has never held.
 */
export const destroySiteImage = async (slot: string, key: string) => {
  configure();

  try {
    await cloudinary.uploader.destroy(siteImagePublicId(slot, key), {
      invalidate: true,
      resource_type: "image",
    });
  } catch (error) {
    console.error(`Could not remove ${siteImagePublicId(slot, key)}`, error);
  }
};

export const isAllowedImageSource = (src: string) => {
  if (src.startsWith("/")) return !src.startsWith("//");

  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return false;
  }

  const cloudName = cloudinaryCloudName();

  return (
    url.protocol === "https:" &&
    url.hostname === "res.cloudinary.com" &&
    // …and on our own cloud, not merely somewhere on Cloudinary's. With no
    // cloud configured there is no upload this site trusts, so nothing passes.
    Boolean(cloudName) &&
    url.pathname.startsWith(`/${cloudName}/`)
  );
};

export const imageAssetSchema = Yup.object({
  src: Yup
    .string()
    .trim()
    .required("Every uploaded image needs a source.")
    .test(
      "allowed-source",
      "Images must be uploaded through this form.",
      (value) => !value || isAllowedImageSource(value),
    ),
});
