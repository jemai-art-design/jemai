import * as Yup from "yup";

import {
  ALLOWED_VIDEO_LABEL,
  ALLOWED_VIDEO_TYPES,
  MAX_VIDEO_SIZE_BYTES,
  MAX_VIDEO_SIZE_MB,
} from "@/lib/constants";

/**
 * What the server hands the browser so it may put one film on Cloudinary
 * directly.
 *
 * A film does not go through `uploadImageAction` the way a photograph does. A
 * server action is a POST to our own app, and a 100MB body has to be held in
 * memory by whatever is serving it — behind most hosts it is simply refused.
 * So the secret stays here, the signature goes out, and the bytes never touch
 * our server.
 *
 * `folder` and `allowedFormats` are part of what was signed, which is the point
 * of signing them: the browser has to send them back unchanged, so a hand-made
 * request holding this signature still cannot land an executable outside the
 * folder this console owns.
 *
 * The type lives here rather than beside the signing code because the uploader
 * reading it is a client component, and `lib/cloudinary` carries the Cloudinary
 * SDK and our API secret — neither of which has any business in a browser
 * bundle.
 */
export type SignedVideoUpload = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  allowedFormats: string;
};

const isFile = (value: unknown): value is File =>
  typeof File !== "undefined" && value instanceof File;

/**
 * Whether a picked file is a film rather than a photograph. Read off the MIME
 * type the browser reports, which is also what the format check tests — so
 * anything claiming to be video and is not one of ours is refused as a bad
 * video rather than quietly uploaded as a picture.
 */
export const isVideoFile = (file: File) => file.type.startsWith("video/");

export const videoFileValidation = Yup.mixed<File>()
  .nullable()
  .test("is-file", "A video must be a file", (value) => !value || isFile(value))
  .test(
    "file-type",
    `Videos must be ${ALLOWED_VIDEO_LABEL}`,
    (value) =>
      !isFile(value) ||
      (ALLOWED_VIDEO_TYPES as readonly string[]).includes(value.type),
  )
  .test(
    "file-size",
    `Each video must be ${MAX_VIDEO_SIZE_MB}MB or smaller`,
    (value) => !isFile(value) || value.size <= MAX_VIDEO_SIZE_BYTES,
  );

/** The first thing wrong with these films, as the picker prints it. */
export const validateVideoBatch = async (files: File[]) => {
  try {
    for (const file of files) await videoFileValidation.validate(file);
    return null;
  } catch (error) {
    if (error instanceof Yup.ValidationError) return error.errors[0] ?? error.message;
    throw error;
  }
};

/**
 * Posts one film to Cloudinary on the signature the server handed out, and
 * answers with the URL the project will store.
 *
 * `XMLHttpRequest` rather than `fetch`: a 100MB upload over a Lagos connection
 * takes long enough that a picker with no progress reads as a hung page, and
 * upload progress is the one thing `fetch` still cannot report.
 */
export const uploadVideo = (
  file: File,
  signed: SignedVideoUpload,
  onProgress?: (percent: number) => void,
) =>
  new Promise<string>((resolve, reject) => {
    const body = new FormData();
    body.append("file", file);
    body.append("api_key", signed.apiKey);
    body.append("timestamp", String(signed.timestamp));
    body.append("signature", signed.signature);
    // Both were signed, so both must go back exactly as they came.
    body.append("folder", signed.folder);
    body.append("allowed_formats", signed.allowedFormats);

    const request = new XMLHttpRequest();
    // The resource type is in the path and is not part of the signature, so a
    // signed video upload cannot be replayed against the image endpoint.
    request.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${signed.cloudName}/video/upload`,
    );

    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable)
        onProgress?.(Math.round((event.loaded / event.total) * 100));
    });

    request.addEventListener("load", () => {
      let payload: { secure_url?: string; error?: { message?: string; }; };
      try {
        payload = JSON.parse(request.responseText);
      } catch {
        return reject(new Error("Cloudinary returned something we could not read."));
      }

      if (request.status >= 400 || payload.error)
        return reject(
          new Error(payload.error?.message ?? "Cloudinary refused the upload."),
        );
      if (!payload.secure_url)
        return reject(new Error("Cloudinary returned no URL for the upload."));

      resolve(payload.secure_url);
    });

    request.addEventListener("error", () =>
      reject(new Error("The upload could not reach Cloudinary.")),
    );
    request.addEventListener("abort", () => reject(new Error("The upload was stopped.")));

    request.send(body);
  });
