"use server";

import { revalidatePath } from "next/cache";
import * as Yup from "yup";

import { fail, failWith, ok, validate, type ActionResult } from "@/lib/action-result";
import { hasPermission } from "@/lib/admin/auth/permissions";
import { readActiveAdmin } from "@/lib/admin/auth/session";
import { resetSiteImages, writeSiteImages } from "@/lib/admin/site-images";
import { imageAssetSchema, uploadSiteImage } from "@/lib/cloudinary";
import { ALLOWED_IMAGE_LABEL, MAX_IMAGE_SIZE_MB } from "@/lib/constants";
import { imageFileValidation } from "@/lib/image-upload";
import {
  findSiteImageSlot,
  isSlotKey,
  slotCapacity,
  SITE_IMAGE_KEY,
  type SiteImageSlotMeta,
} from "@/lib/site-image-slots";

const requireSiteImageAccess = async (): Promise<ActionResult<string>> => {
  const session = await readActiveAdmin();
  if (!session) return fail("Your session has expired. Sign in again.");
  if (!hasPermission(session.permissions, "site-images"))
    return fail("You do not have access to the site images.");
  return ok(session.id);
};

/**
 * The location being written to, as the registry declares it. Everything below
 * resolves the slot through this rather than trusting the name it was given: a
 * slot name reaches these actions from the browser, and it ends up in a
 * Cloudinary public id.
 */
const requireSlot = (slot: unknown): ActionResult<SiteImageSlotMeta> => {
  if (typeof slot !== "string") return fail("That image location does not exist.");
  const meta = findSiteImageSlot(slot);
  if (!meta) return fail("That image location does not exist.");
  return ok(meta);
};

/**
 * Every storefront page, rather than the pages the slot is drawn on.
 *
 * The shared locations are drawn on four routes and two of them are catalogue
 * detail pages, so a per-slot list would be a list to keep in step with the
 * components by hand. A site image is swapped rarely and deliberately, and the
 * failure this avoids — the studio uploading a photograph and still seeing the
 * old one — is the one worth spending a cache purge on.
 */
const revalidateStorefront = () => {
  revalidatePath("/admin/site-images");
  revalidatePath("/", "layout");
};

/**
 * The picture itself, posted one at a time as it is picked — the same shape as
 * the catalogue's uploader, and for the same reasons.
 *
 * What is different is where it lands: `jemai/site/<slot>/<key>`, written with
 * `overwrite`, so replacing a location's photograph replaces the asset behind
 * it instead of adding a second one beside it. Both halves of that id come from
 * the browser, so both are checked here — the slot against the registry, the
 * key against the pattern a public id segment may hold.
 */
export const uploadSiteImageAction = async (
  formData: FormData,
): Promise<ActionResult<string>> => {
  const access = await requireSiteImageAccess();
  if (access.error) return access;

  const slot = requireSlot(formData.get("slot"));
  if (slot.error) return slot;

  // Against the location's own key space, not merely the shape of a public id
  // segment: an upload to a key the location cannot hold would be refused on
  // save anyway, having already left an asset in the media library.
  const key = formData.get("key");
  if (typeof key !== "string" || !isSlotKey(slot.data, key))
    return fail("That image slot does not exist.");

  const file = formData.get("file");
  if (!(file instanceof File) || !file.size) return fail("Choose an image to upload.");

  try {
    await imageFileValidation.validate(file);
  } catch {
    return fail(
      `Images must be ${ALLOWED_IMAGE_LABEL}, ${MAX_IMAGE_SIZE_MB}MB or smaller.`,
    );
  }

  try {
    return ok(await uploadSiteImage(file, slot.data.slot, key));
  } catch (error) {
    return failWith("Could not upload that image. Try again.", error);
  }
};

const imagesPayload = (meta: SiteImageSlotMeta) =>
  Yup.object({
    images: Yup
      .array(
        imageAssetSchema.shape({
          key: Yup
            .string()
            .trim()
            .required("Every image needs a slot.")
            .matches(SITE_IMAGE_KEY, "That image slot is not a valid one.")
            .test(
              "slot-key",
              "That image slot is not one this location holds.",
              (value) => !value || isSlotKey(meta, value),
            ),
          alt: Yup.string().trim().default(""),
          fit: Yup
            .string()
            .oneOf(["cover", "contain"], "An image is either contained or cropped.")
            .default("cover"),
        }),
      )
      .required()
      .min(1, "A location needs at least one image.")
      .max(
        slotCapacity(meta),
        `This location holds ${slotCapacity(meta)} ${slotCapacity(meta) === 1 ? "image" : "images"}.`,
      )
      .test(
        "unique-keys",
        "Two images cannot share a slot.",
        (value) => new Set(value?.map((image) => image.key)).size === value?.length,
      )
      /**
       * A fixed location is a composition with a set number of holes, each
       * holding the picture the page draws in that place — so the list it is
       * saved with has to be exactly those holes. Only the manage screen's own
       * UI produces that, which is the point: a request that skips it cannot
       * add a fifth square to a four-square mosaic.
       */
      .test(
        "fixed-keys",
        "This location's images cannot be added to or removed.",
        (value) =>
          !meta.fixed ||
          (value?.length === meta.defaults.length &&
            meta.defaults.every((image, index) => value[index]?.key === image.key)),
      ),
  });

/** Saves what a location draws. The caller refreshes; this revalidates the site. */
export const saveSiteImagesAction = async (
  slot: string,
  values: unknown,
): Promise<ActionResult<string>> => {
  const access = await requireSiteImageAccess();
  if (access.error) return access;

  const meta = requireSlot(slot);
  if (meta.error) return meta;

  const parsed = await validate(imagesPayload(meta.data), values);
  if (parsed.error) return parsed;

  try {
    await writeSiteImages(meta.data.slot, parsed.data.images);
    revalidateStorefront();
    return ok(`${meta.data.label} saved`);
  } catch (error) {
    return failWith("Could not save these images. Try again.", error);
  }
};

/** Puts a location back to the photography the site shipped with. */
export const resetSiteImagesAction = async (
  slot: string,
): Promise<ActionResult<string>> => {
  const access = await requireSiteImageAccess();
  if (access.error) return access;

  const meta = requireSlot(slot);
  if (meta.error) return meta;

  try {
    const reset = await resetSiteImages(meta.data.slot);
    if (!reset) return ok(`${meta.data.label} is already the original`);

    revalidateStorefront();
    return ok(`${meta.data.label} restored`);
  } catch (error) {
    return failWith("Could not restore these images. Try again.", error);
  }
};
