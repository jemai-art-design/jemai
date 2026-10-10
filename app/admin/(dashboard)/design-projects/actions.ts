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

const requireProjectAccess = async (): Promise<ActionResult<string>> => {
  const session = await readActiveAdmin();
  if (!session) return fail("Your session has expired. Sign in again.");
  if (!hasPermission(session.permissions, "design-projects"))
    return fail("You do not have access to the design projects.");
  return ok(session.id);
};

const projectPayload = () =>
  Yup.object({
    name: Yup.string().trim().required("A project name is required."),
    slug: Yup.string().trim().default(""),
    meta: Yup.string().trim().default(""),
    summary: Yup.string().trim().default(""),
    description: Yup.string().trim().default(""),
    /**
     * The media, each entry with its own alt text. The list may be empty — a
     * project is written up over several sittings, and one still short of its
     * photography is saved rather than refused. It simply draws nothing on the
     * site until it has a first entry, visible or not.
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

/** Everything below writes design projects; the festive rail has its own module. */
const toInput = toProjectInput.bind(null, "design");

const revalidateProject = (slug?: string) => {
  revalidatePath("/admin/design-projects");
  // Both storefront frames draw the carousel: the home page's section and the
  // consultation page it titles.
  revalidatePath("/consultation");
  revalidatePath("/");
  if (slug) revalidatePath(`/admin/design-projects/${slug}`);
};

/** Creates the project. The caller navigates to the slug that comes back. */
export const createProjectAction = async (
  values: unknown,
): Promise<ActionResult<{ slug: string; name: string; }>> => {
  const access = await requireProjectAccess();
  if (access.error) return access;

  const parsed = await validate(projectPayload(), values);
  if (parsed.error) return parsed;

  try {
    const created = await createProject(toInput(parsed.data));
    revalidateProject(created.slug);
    return ok({ slug: created.slug, name: created.name });
  } catch (error) {
    return failWith("Could not save this project. Try again.", error);
  }
};

/** Same trip for an edit — the slug can change, so the new one comes back. */
export const updateProjectAction = async (
  slug: string,
  values: unknown,
): Promise<ActionResult<{ slug: string; name: string; }>> => {
  const access = await requireProjectAccess();
  if (access.error) return access;

  const parsed = await validate(projectPayload(), values);
  if (parsed.error) return parsed;

  try {
    const updated = await updateProject(slug, toInput(parsed.data));
    if (!updated) return fail("That project no longer exists.");

    revalidateProject(updated.slug);
    if (updated.slug !== slug) revalidateProject(slug);

    return ok({ slug: updated.slug, name: updated.name });
  } catch (error) {
    return failWith("Could not save this project. Try again.", error);
  }
};

/**
 * The show/hide switch on the index and the record. A one-column write, so it
 * does not go back through the form: holding a half-written project back must
 * not wait on it validating.
 */
export const setProjectVisibilityAction = async (
  slug: string,
  isActive: boolean,
): Promise<ActionResult<string>> => {
  const access = await requireProjectAccess();
  if (access.error) return access;

  try {
    const project = await setProjectVisibility("design", slug, isActive);
    if (!project) return fail("That project no longer exists.");

    revalidateProject(slug);
    return ok(
      isActive
        ? `${project.name} is now on the site`
        : `${project.name} is hidden`,
    );
  } catch (error) {
    return failWith("Could not change this project's visibility. Try again.", error);
  }
};

export const deleteProjectAction = async (
  slug: string,
): Promise<ActionResult<string>> => {
  const access = await requireProjectAccess();
  if (access.error) return access;

  try {
    const deleted = await deleteProject("design", slug);
    if (!deleted) return fail("That project no longer exists.");

    revalidateProject(slug);
    return ok("Project deleted");
  } catch (error) {
    return failWith("Could not delete this project. Try again.", error);
  }
};
