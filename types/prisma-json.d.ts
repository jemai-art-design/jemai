import type { ChristmasStatus as Status, RequestedArea } from "@/lib/christmas";
import type { ProjectImage } from "@/lib/projects";
import type { ProjectKind as Kind } from "@/lib/project-kinds";

/**
 * The types `prisma-json-types-generator` substitutes into the generated
 * client, so a `Json` column is not `unknown` at every call site and a status
 * string cannot be a typo.
 *
 * They are declared by reference rather than written out again: the shapes
 * belong to `lib/christmas`, which both the storefront form and the console
 * read, and duplicating them here is how the two drift apart.
 */
declare global {
  namespace PrismaJson {
    type ChristmasAreas = RequestedArea[];
    type ChristmasStatus = Status;
    type ProjectImages = ProjectImage[];
    type ProjectKind = Kind;
  }
}

export {};
