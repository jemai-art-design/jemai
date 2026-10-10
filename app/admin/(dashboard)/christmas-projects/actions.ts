"use server";

import { revalidatePath } from "next/cache";
import * as Yup from "yup";

import { failWith, ok, validate, fail, type ActionResult } from "@/lib/action-result";
import { readActiveAdmin } from "@/lib/admin/auth/session";
import { hasPermission } from "@/lib/admin/auth/permissions";
import {
  createProject,
  deleteProject,
  setProjectVisibility,
  toProjectInput,
  updateProject,
} from "@/lib/admin/projects";
import { projectMediaSchema } from "@/lib/cloudinary";

const requireChristmasProjectAccess = async (): Promise<ActionResult<string>> => {
  const session = await readActiveAdmin();
  if (!session) return fail("Your session has expired. Sign in again.");
  if (!hasPermission(session.permissions, "christmas-projects"))
    return fail("You do not have access to the Christmas projects.");
  return ok(session.id);
};

const christmasProjectPayload = () =>
  Yup.object({
    name: Yup.string().trim().required("A Christmas project needs a name."),
    slug: Yup.string().trim().default(""),
    meta: Yup.string().trim().default(""),
    summary: Yup.string().trim().default(""),
    description: Yup.string().trim().default(""),
    /**
     * The media, each entry with its own alt text. The list may be empty — a
     * season is written up long after it is over, and a record still waiting on
     * its shots is saved rather than refused. It simply draws nothing on the
     * Christmas page until it has a first one.
     */
    media: Yup
      .array(
        projectMediaSchema.shape({
          alt: Yup.string().trim().default(""),
        }),
      )
      .default([]),
    isActive: Yup.boolean().default(false),
  });

/** Everything below writes festive projects; the design rail has its own module. */
const toInput = toProjectInput.bind(null, "christmas");

const revalidateChristmasProject = (slug?: string) => {
  revalidatePath("/admin/christmas-projects");
  revalidatePath("/christmas-styling");
  if (slug) revalidatePath(`/admin/christmas-projects/${slug}`);
};

/** Creates the project. The caller navigates to the slug that comes back. */
export const createChristmasProjectAction = async (
  values: unknown,
): Promise<ActionResult<{ slug: string; name: string; }>> => {
  const access = await requireChristmasProjectAccess();
  if (access.error) return access;

  const parsed = await validate(christmasProjectPayload(), values);
  if (parsed.error) return parsed;

  try {
    const created = await createProject(toInput(parsed.data));
    revalidateChristmasProject(created.slug);
    return ok({ slug: created.slug, name: created.name });
  } catch (error) {
    return failWith("Could not save this Christmas project. Try again.", error);
  }
};

/** Same trip for an edit — the slug can change, so the new one comes back. */
export const updateChristmasProjectAction = async (
  slug: string,
  values: unknown,
): Promise<ActionResult<{ slug: string; name: string; }>> => {
  const access = await requireChristmasProjectAccess();
  if (access.error) return access;

  const parsed = await validate(christmasProjectPayload(), values);
  if (parsed.error) return parsed;

  try {
    const updated = await updateProject(slug, toInput(parsed.data));
    if (!updated) return fail("That Christmas project no longer exists.");

    revalidateChristmasProject(updated.slug);
    if (updated.slug !== slug) revalidateChristmasProject(slug);

    return ok({ slug: updated.slug, name: updated.name });
  } catch (error) {
    return failWith("Could not save this Christmas project. Try again.", error);
  }
};

/**
 * The show/hide switch on the index and the record. A one-column write, so it
 * does not go back through the form: a season can be taken down the moment the
 * studio wants it down, whatever state its write-up is in.
 */
export const setChristmasProjectVisibilityAction = async (
  slug: string,
  isActive: boolean,
): Promise<ActionResult<string>> => {
  const access = await requireChristmasProjectAccess();
  if (access.error) return access;

  try {
    const project = await setProjectVisibility("christmas", slug, isActive);
    if (!project) return fail("That Christmas project no longer exists.");

    revalidateChristmasProject(slug);
    return ok(
      isActive
        ? `${project.name} is now on the site`
        : `${project.name} is hidden`,
    );
  } catch (error) {
    return failWith("Could not change this project's visibility. Try again.", error);
  }
};

export const deleteChristmasProjectAction = async (
  slug: string,
): Promise<ActionResult<string>> => {
  const access = await requireChristmasProjectAccess();
  if (access.error) return access;

  try {
    const deleted = await deleteProject("christmas", slug);
    if (!deleted) return fail("That Christmas project no longer exists.");

    revalidateChristmasProject(slug);
    return ok("Christmas project deleted");
  } catch (error) {
    return failWith("Could not delete this Christmas project. Try again.", error);
  }
};
