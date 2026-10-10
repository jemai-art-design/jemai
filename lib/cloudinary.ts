import { v2 as cloudinary } from "cloudinary";
import * as Yup from "yup";

import {
  ALLOWED_IMAGE_FORMATS,
  ALLOWED_VIDEO_FORMATS,
  CLOUDINARY_FOLDER,
  SITE_IMAGE_FOLDER,
} from "@/lib/constants";
import env from "@/lib/env";
import { projectMediaTypes, videoEmbed, type ProjectMediaType } from "@/lib/project-media";
import type { SignedVideoUpload } from "@/lib/video-upload";

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
 * The terms one film may go up on, signed, for the browser to post it directly.
 *
 * A photograph is small enough to travel through a server action; a film is
 * not — see `SignedVideoUpload`. What crosses instead is this: an hour's worth
 * of permission to write one video into our own folder, in one of our own
 * formats, and nothing else. The secret never leaves the server, and the
 * caller checks the admin session before asking for it.
 */
export const signVideoUpload = (): SignedVideoUpload => {
  const { cloudName, apiKey, apiSecret } = credentials();
  const timestamp = Math.floor(Date.now() / 1000);

  /* Every parameter the browser will send bar the file itself, the api key and
     the resource type — Cloudinary signs exactly this set, sorted, so the two
     sides have to agree on it to the character. */
  const signed = {
    allowed_formats: ALLOWED_VIDEO_FORMATS,
    folder: CLOUDINARY_FOLDER,
    timestamp,
  };

  return {
    cloudName,
    apiKey,
    timestamp,
    signature: cloudinary.utils.api_sign_request(signed, apiSecret),
    folder: signed.folder,
    allowedFormats: signed.allowed_formats,
  };
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
  `${SITE_IMAGE_FOLDER}/${slot.replace(/\./g, "/")}/${key}`;

/**
 * The terms every site image goes up on, however it got here — through the
 * console or through `scripts/upload-site-images.ts`. One definition, because
 * the two writing the same id on different terms is how a seeded default and a
 * replacement for it end up as two assets.
 */
const siteImageOptions = (slot: string, key: string) => ({
  public_id: siteImagePublicId(slot, key),
  // The id is the whole path, so the folder must not be prepended again, and
  // neither the picked file's name nor a uniquifying suffix may be allowed to
  // move it.
  use_filename: false,
  unique_filename: false,
  overwrite: true,
  // Purges the CDN copies of the id being written over. Without it the old
  // photograph is served from the edge for hours after the swap.
  invalidate: true,
  allowed_formats: ALLOWED_IMAGE_FORMATS.split(","),
  resource_type: "image" as const,
});

/**
 * The URL carries the asset's version, so it changes on every overwrite —
 * which is what gets the new picture past Next's image cache as well as the
 * browser's.
 */
const uploadedUrl = (secureUrl: string | undefined) => {
  if (!secureUrl) throw new Error("Cloudinary returned no URL for the upload");
  return secureUrl;
};

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
      siteImageOptions(slot, key),
      (error, result) => {
        if (error) return reject(error);
        try {
          resolve(uploadedUrl(result?.secure_url));
        } catch (failure) {
          reject(failure);
        }
      },
    );

    stream.end(bytes);
  });
};

/**
 * The same upload from a file on disk, which is what the seeding script has —
 * it is reading `public/`, not a multipart body.
 */
export const uploadSiteImageFile = async (
  path: string,
  slot: string,
  key: string,
) => {
  configure();
  const result = await cloudinary.uploader.upload(path, siteImageOptions(slot, key));
  return uploadedUrl(result.secure_url);
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

/**
 * The same rule for a film, narrowed to the video half of our own cloud.
 *
 * Narrower than the image rule in both directions: no root-relative path, since
 * nothing in `public/` is a film the console put there, and the delivery path
 * has to be `/video/`, so an image URL cannot be saved as a video entry and
 * left for the lightbox to try to play.
 */
export const isAllowedVideoSource = (src: string) => {
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
    Boolean(cloudName) &&
    url.pathname.startsWith(`/${cloudName}/video/`)
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

/**
 * One entry in a project's media list, checked by what it says it is.
 *
 * The three kinds are held to three different rules, which is the whole reason
 * this cannot be `imageAssetSchema`: an uploaded photograph and an uploaded
 * film must be on our own cloud, and an embed must be on neither — it is a
 * YouTube or Vimeo link, so what is checked is that it parses as one. Without
 * that split, `type: "embed"` would be the way to put any URL on the page.
 */
export const projectMediaSchema = Yup.object({
  type: Yup
    .string<ProjectMediaType>()
    .oneOf(projectMediaTypes, "That is not a kind of media this form takes.")
    .default("image")
    .required(),
  src: Yup
    .string()
    .trim()
    .required("Every entry needs a source.")
    .test({
      name: "allowed-source",
      test: (value, context) => {
        if (!value) return true;

        const { type } = context.parent as { type?: ProjectMediaType; };

        if (type === "embed")
          return (
            Boolean(videoEmbed(value)) ||
            context.createError({
              message: "A video link must be a YouTube or Vimeo URL.",
            })
          );

        if (type === "video")
          return (
            isAllowedVideoSource(value) ||
            context.createError({
              message: "Videos must be uploaded through this form.",
            })
          );

        return (
          isAllowedImageSource(value) ||
          context.createError({
            message: "Images must be uploaded through this form.",
          })
        );
      },
    }),
});
