import Link from "next/link";

import { setProjectVisibilityAction } from "@/app/admin/(dashboard)/design-projects/actions";
import {
  ALL_STATUSES,
  ProjectTable,
  type ProjectRow,
} from "@/components/admin/project-table";
import { Button } from "@/components/ui/button";
import { listProjects, projectStatuses } from "@/lib/admin/projects";
import { mediaCount } from "@/lib/project-media";
import { param, paramOneOf } from "@/lib/admin/table-query";

/**
 * Design projects — the index behind the JEMAI Designs carousel. The store is
 * read here and flattened to the columns the table draws, so the photography
 * and the long copy never cross to the client.
 */
const AdminDesignProjectsPage = async ({
  searchParams,
}: PageProps<"/admin/design-projects">) => {
  // The search box and the visibility filter live in the URL, so the view
  // survives a reload and can be sent as a link; the narrowing runs in the
  // query rather than over rows already sent.
  const query = await searchParams;
  const search = param(query, "q") ?? "";
  const status = paramOneOf(query, "status", projectStatuses);

  const projects = await listProjects({ kind: "design", search, status });
  const rows: ProjectRow[] = projects.map((project) => ({
    slug: project.slug,
    name: project.name,
    meta: project.meta,
    media: mediaCount(project.media),
    isActive: project.isActive,
    status: project.status,
  }));

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-text-primary text-2xl font-semibold">Design projects</h1>
          <p className="text-text-secondary max-w-[70ch] text-sm">
            The studio&rsquo;s own work, as the JEMAI Designs carousel draws it on the
            home page and the consultation page. A project is written up here and
            shown with the switch beside it, so nothing half-finished reaches the
            site. The rows are listed in the order the carousel runs them.
          </p>
        </div>
        <Button asChild size="lg" className="h-11 shrink-0 px-5 text-sm">
          <Link href="/admin/design-projects/new">Create project</Link>
        </Button>
      </header>

      <ProjectTable
        kind="design"
        rows={rows}
        statuses={projectStatuses}
        search={search}
        status={status ?? ALL_STATUSES}
        onToggle={setProjectVisibilityAction}
      />
    </div>
  );
};

export default AdminDesignProjectsPage;
