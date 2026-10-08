/**
 * Limits the console's image pickers enforce, in one place because three sides
 * have to agree on them: the picker's own yup validation, the copy under the
 * drop zone, and the signature the server hands out — Cloudinary is told the
 * same ceiling, so a request that skips the picker entirely still cannot beat
 * it.
 */

export const MAX_IMAGE_SIZE_MB = 5;

export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

/** One save's worth of pictures — a gallery of twelve 5MB shots is not one. */
export const MAX_IMAGE_UPLOAD_TOTAL_MB = 25;

export const MAX_IMAGE_UPLOAD_TOTAL_BYTES = MAX_IMAGE_UPLOAD_TOTAL_MB * 1024 * 1024;

/** How many pictures a gallery slot holds. Single slots take one, always. */
export const MAX_GALLERY_IMAGES = 12;

/**
 * A design project's photography. A finished job is documented room by room, so
 * the ceiling is far above a catalogue gallery's dozen — pictures go up in
 * batches, since the total-size rule still caps any one pick.
 */
export const MAX_PROJECT_IMAGES = 48;

/**
 * A furniture variant's own shots. The detail frame swaps the whole rail when a
 * combination is picked, so a row carries a small, complete set rather than a
 * share of one product-wide gallery — one at the very least, three at the most.
 */
export const MIN_VARIANT_IMAGES = 1;

export const MAX_VARIANT_IMAGES = 3;

/**
 * The three formats the site serves. Anything else — HEIC off a phone, a TIFF,
 * an SVG that can carry script — is refused at the picker and again by
 * Cloudinary, which is signed with this same list.
 */
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

/** What Cloudinary calls them, for the signed `allowed_formats` parameter. */
export const ALLOWED_IMAGE_FORMATS = "jpg,jpeg,png,webp";

/**
 * Where uploads land in the Cloudinary media library. Not configuration: it is
 * signed into every upload, so it is the same folder on every environment and
 * one place to look for what the console has written.
 */
export const CLOUDINARY_FOLDER = "jemai";

/**
 * Where the storefront's own static photography lives — the heroes, tile sets
 * and plates the Site images screen manages.
 *
 * Its own top-level folder rather than a subfolder of the one above, because
 * the two hold different kinds of thing: `jemai` is the record photography an
 * author uploads against a product, a work or a show, and grows with the
 * catalogue. This one holds one asset per place the site draws a fixed
 * picture, so it is the size of the site and does not grow at all — every
 * upload lands on a deterministic id and writes over what was there.
 */
export const SITE_IMAGE_FOLDER = "site-images";

/** The `accept` attribute on the file input, so the OS dialog filters too. */
export const ALLOWED_IMAGE_ACCEPT = ALLOWED_IMAGE_TYPES.join(",");

/** "JPEG, PNG or WebP" — the line under the drop zone. */
export const ALLOWED_IMAGE_LABEL = "JPEG, PNG or WebP";

/**
 * The shortest password the console will open an admin account on. Here rather
 * than beside the account queries because the invite dialog reads it for its
 * placeholder, and that module carries Prisma — which has no business in a
 * browser bundle.
 */
export const MIN_ADMIN_PASSWORD_LENGTH = 8;
