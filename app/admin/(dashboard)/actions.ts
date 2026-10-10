"use server";

import { fail, failWith, ok, type ActionResult } from "@/lib/action-result";
import { readActiveAdmin } from "@/lib/admin/auth/session";
import { signVideoUpload, uploadImage } from "@/lib/cloudinary";
import { ALLOWED_IMAGE_LABEL, MAX_IMAGE_SIZE_MB } from "@/lib/constants";
import { imageFileValidation } from "@/lib/image-upload";
import type { SignedVideoUpload } from "@/lib/video-upload";

/**
 * The upload every picker in the console posts to. It serves the whole
 * dashboard tree rather than one screen, because the picker is one component
 * shared by the furniture, artwork and exhibition forms.
 *
 * One file per call: a gallery of a dozen pictures is a dozen requests rather
 * than one that has to fit them all under the body limit, and a single failure
 * costs one picture rather than the batch.
 *
 * The picker validates before sending, and this validates again on arrival —
 * an action is a POST endpoint like any other, and the checks that ran in the
 * browser are the ones an attacker simply skips.
 */
export const uploadImageAction = async (
  formData: FormData,
): Promise<ActionResult<string>> => {
  const session = await readActiveAdmin();
  if (!session) return fail("Your session has expired. Sign in again.");

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
    return ok(await uploadImage(file));
  } catch (error) {
    return failWith("Could not upload that image. Try again.", error);
  }
};

/**
 * An hour's permission to put one film on our own cloud, which the picker then
 * posts the bytes to directly.
 *
 * A film does not come through the action above. A server action is a POST to
 * this app, and a 100MB body is refused outright by most of what serves one —
 * so what crosses is the signature rather than the film. The session check is
 * the whole of the authorisation: a signature handed to a signed-out browser is
 * a write into the studio's media library.
 *
 * What may be written is fixed in `signVideoUpload` and sealed by the
 * signature, so a browser holding one still cannot choose the folder, the
 * format or the resource type.
 */
export const signVideoUploadAction = async (): Promise<
  ActionResult<SignedVideoUpload>
> => {
  const session = await readActiveAdmin();
  if (!session) return fail("Your session has expired. Sign in again.");

  try {
    return ok(signVideoUpload());
  } catch (error) {
    return failWith("Video uploads are not configured. Tell your developer.", error);
  }
};
