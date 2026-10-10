import { slugify, uniqueSlug } from "@/lib/admin/content";
import { prisma } from "@/lib/prisma";
import type { ProjectKind } from "@/lib/project-kinds";
import { videoEmbed, type ProjectMedia } from "@/lib/project-media";
import { readProjectMedia, type Project } from "@/lib/projects";
import type {
  Prisma,
  Project as ProjectRecord,
} from "@/lib/generated/prisma/client";

/**
 * Whether the storefront draws it. Unlike an exhibition's status this is a
 * column rather than a reading of the dates: a project has no run, so nothing
 * but the studio's own decision can say when it appears.
 */
export const projectStatuses = ["Visible", "Hidden"] as const;

export type ProjectStatus = (typeof projectStatuses)[number];

export const projectStatus = (isActive: boolean): ProjectStatus =>
  isActive ? "Visible" : "Hidden";

/** The same question in SQL, so the index's filter narrows the query. */
export const statusWhere = (status?: ProjectStatus): Prisma.ProjectWhereInput => {
  if (status === "Visible") return { isActive: true };
  if (status === "Hidden") return { isActive: false };
  return {};
};

/** A project as the console holds it: the storefront shape plus its own state. */
export type AdminProject = Project & {
  id: string;
  /** Which rail it is on. Settled on create; an edit never moves it. */
  kind: ProjectKind;
  isActive: boolean;
  status: ProjectStatus;
  position: number;
  /** ISO string; the index sorts on it. */
  updatedAt: string;
};

const toProject = (record: ProjectRecord): AdminProject => ({
  id: record.id,
  kind: record.kind,
  slug: record.slug,
  name: record.name,
  meta: record.meta,
  summary: record.summary,
  description: record.description,
  media: readProjectMedia(record.media),
  isActive: record.isActive,
  status: projectStatus(record.isActive),
  position: record.position,
  updatedAt: record.updatedAt.toISOString(),
});

export type ProjectQuery = {
  kind: ProjectKind;
  search?: string;
  status?: ProjectStatus;
};

/**
 * One kind's rows, in carousel order rather than newest-first: this screen is
 * where that order is read off, so it draws the sequence the site draws.
 */
export const listProjects = async ({ kind, search, status }: ProjectQuery) => {
  const records = await prisma.project.findMany({
    where: {
      kind,
      ...statusWhere(status),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { meta: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });
  return records.map(toProject);
};

/** One project by slug, whatever kind it is. */
const getProject = async (slug: string) => {
  const record = await prisma.project.findUnique({ where: { slug } });
  return record ? toProject(record) : null;
};

/**
 * One project, narrowed to the section asking for it. Every screen reads through
 * this rather than by slug alone: a festive project opened under the design
 * routes is not that section's record to show or edit, so it is simply missing.
 */
export const getProjectOfKind = async (kind: ProjectKind, slug: string) => {
  const project = await getProject(slug);
  return project && project.kind === kind ? project : null;
};

export type ProjectInput = Omit<
  AdminProject,
  "id" | "slug" | "status" | "position" | "updatedAt"
> & { slug: string; };

/**
 * What a project form sends once its own schema has checked it. The two
 * sections validate with their own messages but produce the same shape, and
 * `toProjectInput` is where that shape becomes the store's.
 */
export type ProjectFormPayload = {
  name: string;
  slug: string;
  meta: string;
  summary: string;
  description: string;
  media: ProjectMedia[];
  isActive: boolean;
};

/**
 * An entry saved without alt text falls back to the project's name, so the
 * markup never carries an empty `alt` on the photograph — or an unnamed player
 * on the film — that is the whole point of the card. Shared by both sections
 * rather than written twice; this is the rule that would quietly drift.
 *
 * An embed is also stored in one shape rather than in whichever one the link
 * was copied in. The picker already canonicalises what an author pastes, but an
 * action is a POST endpoint like any other, so the rule belongs on the write
 * rather than in the browser — a `youtu.be` short link and a watch URL for the
 * same video must not become two different rows.
 */
export const toProjectInput = (
  kind: ProjectKind,
  values: ProjectFormPayload,
): ProjectInput => ({
  kind,
  slug: values.slug,
  name: values.name,
  meta: values.meta,
  summary: values.summary,
  description: values.description,
  media: values.media.map((entry) => ({
    type: entry.type,
    src: entry.type === "embed" ? (videoEmbed(entry.src)?.src ?? entry.src) : entry.src,
    alt: entry.alt || values.name,
  })),
  isActive: values.isActive,
});

/**
 * A slug no other project holds, suffixed `-2`, `-3`, … if one does. Only the
 * candidate's own family is fetched, and `ignore` is the record's current slug
 * so re-saving it unchanged does not push it to `-2`.
 */
const availableSlug = async (candidate: string, name: string, ignore?: string) => {
  const base = slugify(candidate || name) || "project";
  const taken = await prisma.project.findMany({
    where: { slug: { startsWith: base } },
    select: { slug: true },
  });
  return uniqueSlug(taken.map((row) => row.slug), base, "project", ignore);
};

/**
 * The columns both writes set — everything but the slug, the position and the
 * kind. The kind is settled when the project is created: a record belongs to
 * the section it was written in, and an edit cannot move it to the other rail.
 */
const columns = (input: ProjectInput) => ({
  name: input.name,
  meta: input.meta,
  summary: input.summary,
  description: input.description,
  media: input.media,
  isActive: input.isActive,
});

/**
 * One past the last of the same kind, so a new project joins the end of its own
 * carousel. The two rails are ordered independently.
 */
const nextPosition = async (kind: ProjectKind) => {
  const last = await prisma.project.findFirst({
    where: { kind },
    orderBy: { position: "desc" },
    select: { position: true },
  });
  return (last?.position ?? -1) + 1;
};

export const createProject = async (input: ProjectInput) => {
  const record = await prisma.project.create({
    data: {
      kind: input.kind,
      slug: await availableSlug(input.slug, input.name),
      position: await nextPosition(input.kind),
      ...columns(input),
    },
  });
  return toProject(record);
};

export const updateProject = async (slug: string, input: ProjectInput) => {
  // Narrowed by kind as well as slug: the section doing the writing only ever
  // edits its own records, whatever slug it was handed.
  const existing = await prisma.project.findFirst({
    where: { slug, kind: input.kind },
    select: { id: true },
  });
  if (!existing) return null;

  const record = await prisma.project.update({
    where: { id: existing.id },
    data: {
      slug: await availableSlug(input.slug, input.name, slug),
      ...columns(input),
    },
  });
  return toProject(record);
};

/**
 * The show/hide switch, on the index and on the record. A one-column write, so
 * it goes straight to the store rather than round-tripping the whole form —
 * hiding a project must not depend on it passing validation.
 */
export const setProjectVisibility = async (
  kind: ProjectKind,
  slug: string,
  isActive: boolean,
) => {
  const existing = await prisma.project.findFirst({
    where: { slug, kind },
    select: { id: true },
  });
  if (!existing) return null;

  const record = await prisma.project.update({
    where: { id: existing.id },
    data: { isActive },
  });
  return toProject(record);
};

export const deleteProject = async (kind: ProjectKind, slug: string) => {
  const { count } = await prisma.project.deleteMany({ where: { slug, kind } });
  return count > 0;
};
