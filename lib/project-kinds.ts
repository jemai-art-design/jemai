import type { AdminPermission } from "@/lib/admin/auth/permissions";

/**
 * The two carousels a project can belong to, and what the console calls each
 * one. A festive project is the same record as a design project — same copy,
 * same photography, same switch — so they share a table, a form and a store,
 * and differ only in the page that draws them and the words around it.
 *
 * This sits apart from `lib/projects` because the form that reads it is a
 * client component, and that module carries Prisma — which has no business in
 * a browser bundle.
 */
export const projectKinds = ["design", "christmas"] as const;

export type ProjectKind = (typeof projectKinds)[number];

export type ProjectKindDetails = {
  /** The console section this kind lives in — every link is built off it. */
  basePath: string;
  permission: AdminPermission;
  /** "Design projects" — the index heading, and the nav entry it matches. */
  title: string;
  /** How one record is named in a button, a toast or a confirmation. */
  noun: string;
  /** What the naming fields suggest, so the conventions stay legible. */
  namePlaceholder: string;
  metaPlaceholder: string;
  /** What the meta field is for on this kind, as the form's hint explains it. */
  metaHint: string;
  /** Where the storefront draws it, named in the visibility copy. */
  shownOn: string;
};

export const projectKindDetails: Record<ProjectKind, ProjectKindDetails> = {
  design: {
    basePath: "/admin/design-projects",
    permission: "design-projects",
    title: "Design projects",
    noun: "project",
    namePlaceholder: "Crescendo",
    metaPlaceholder: "Residential · Lagos",
    metaHint:
      "Drawn in small caps above the name.\nResidential, Workplace, Retail, Hospitality — then the city.",
    shownOn: "the home page and the consultation page",
  },
  christmas: {
    basePath: "/admin/christmas-projects",
    permission: "christmas-projects",
    title: "Christmas projects",
    noun: "Christmas project",
    namePlaceholder: "Ikoyi Residence",
    metaPlaceholder: "Residence · Lagos · Christmas 2025",
    // The season is what makes a festive record legible, and it is the one
    // thing a design project's meta never needs.
    metaHint:
      "Drawn in small caps above the name.\nThe setting, the city, then the season it was styled for.",
    shownOn: "the Christmas styling page",
  },
};
