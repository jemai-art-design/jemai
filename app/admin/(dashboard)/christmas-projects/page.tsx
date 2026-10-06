import Link from "next/link";

import { setChristmasProjectVisibilityAction } from "@/app/admin/(dashboard)/christmas-projects/actions";
import {
  ALL_STATUSES,
  ProjectTable,
  type ProjectRow,
} from "@/components/admin/project-table";
import { Button } from "@/components/ui/button";
import { listProjects, projectStatuses } from "@/lib/admin/projects";
import { param, paramOneOf } from "@/lib/admin/table-query";

/**
 * Christmas projects — the seasons JEMAI has already styled, as the Christmas
 * styling page shows them. The same records as the design projects and the same
 * screens; only the rail they are drawn on differs.
 */
const AdminChristmasProjectsPage = async ({
  searchParams,
}: PageProps<"/admin/christmas-projects">) => {
  const query = await searchParams;
  const search = param(query, "q") ?? "";
  const status = paramOneOf(query, "status", projectStatuses);

  const projects = await listProjects({ kind: "christmas", search, status });
  const rows: ProjectRow[] = projects.map((project) => ({
    slug: project.slug,
    name: project.name,
    meta: project.meta,
    images: project.images.length,
    isActive: project.isActive,
    status: project.status,
  }));

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-text-primary text-2xl font-semibold">Christmas projects</h1>
          <p className="text-text-secondary max-w-[70ch] text-sm">
            Festive settings JEMAI has already styled, drawn on the Christmas
            styling page between the services and the request form. They are the
            proof a visitor reads before asking for a consultation, so note the
            season in the location field &mdash; &ldquo;Residence &middot; Lagos
            &middot; Christmas 2025&rdquo;. The rows are listed in the order the
            carousel runs them.
          </p>
        </div>
        <Button asChild size="lg" className="h-11 shrink-0 px-5 text-sm">
          <Link href="/admin/christmas-projects/new">Create Christmas project</Link>
        </Button>
      </header>

      <ProjectTable
        kind="christmas"
        rows={rows}
        statuses={projectStatuses}
        search={search}
        status={status ?? ALL_STATUSES}
        onToggle={setChristmasProjectVisibilityAction}
      />
    </div>
  );
};

export default AdminChristmasProjectsPage;
