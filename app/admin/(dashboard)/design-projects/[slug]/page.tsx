import Link from "next/link";
import { notFound } from "next/navigation";

import {
  deleteProjectAction,
  setProjectVisibilityAction,
} from "@/app/admin/(dashboard)/design-projects/actions";
import { ContentActionsMenu } from "@/components/admin/content-actions-menu";
import { ProjectVisibilityToggle } from "@/components/admin/project-visibility-toggle";
import { CopyPanel, DetailRow } from "@/components/admin/record-panels";
import { StatusBadge } from "@/components/admin/status-badge";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProjectOfKind } from "@/lib/admin/projects";

/**
 * A design project's detail screen: the record on the left, its photography on
 * the right. This is where a create or an edit lands.
 */
const AdminDesignProjectDetailPage = async ({
  params,
}: PageProps<"/admin/design-projects/[slug]">) => {
  const { slug } = await params;
  const project = await getProjectOfKind("design", slug);
  if (!project) notFound();

  const editHref = `/admin/design-projects/${project.slug}/edit`;

  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_420px]">
      <Card className="ring-border-default py-6">
        <CardHeader className="gap-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col items-start gap-2">
              <CardTitle className="text-text-primary font-sans text-xl font-semibold">
                {project.name}
              </CardTitle>
              <StatusBadge status={project.status} />
            </div>
            <ContentActionsMenu
              name={project.name}
              editHref={editHref}
              deleteLabel="Delete project"
              deletedHref="/admin/design-projects"
              onDelete={deleteProjectAction.bind(null, project.slug)}
            />
          </div>
          {project.summary ? (
            <p className="text-text-secondary max-w-[60ch] text-sm">{project.summary}</p>
          ) : null}
        </CardHeader>

        <CardContent className="flex flex-col gap-8">
          <section className="flex flex-col gap-1">
            <h2 className="text-text-primary mb-1 text-sm font-semibold">Details</h2>
            <dl className="divide-border-default/60 flex flex-col divide-y">
              <DetailRow label="slug" value={project.slug} />
              <DetailRow label="Discipline & location" value={project.meta || "—"} />
              <DetailRow
                label="Photographs"
                value={String(project.images.length)}
              />
            </dl>
          </section>

          {/* The switch sits on the record as well as the index: this is the
              screen a save lands on, and turning the project on is the next
              thing the author wants to do. */}
          <section className="border-border-default flex flex-col gap-3 rounded-lg border p-4">
            <h2 className="text-text-primary text-sm font-semibold">Visibility</h2>
            <ProjectVisibilityToggle
              slug={project.slug}
              name={project.name}
              isActive={project.isActive}
              onToggle={setProjectVisibilityAction}
              withLabel
            />
            <p className="text-text-secondary text-xs">
              {project.images.length
                ? "A project is drawn on the home page and the consultation page while this is on."
                : "This project has no photography yet, so the carousel leaves it out even while it is on — the card is its first shot."}
            </p>
          </section>

          {project.description ? (
            <Accordion type="multiple" defaultValue={["description"]} className="gap-3">
              <CopyPanel
                value="description"
                label="Project description"
                body={project.description}
              />
            </Accordion>
          ) : null}
        </CardContent>
      </Card>

      <Card className="ring-border-default py-6">
        <CardHeader>
          <CardTitle className="text-text-primary font-sans text-xl font-semibold">
            Photography
          </CardTitle>
          <div className="col-start-2 row-start-1 justify-self-end">
            <Button
              variant="outline"
              size="lg"
              asChild
              className="border-border-default h-9 text-sm"
            >
              <Link href={editHref}>Edit media</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-3 gap-3">
            {project.images.length ? (
              project.images.map((image, index) => (
                <li key={`${image.src}-${index}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="bg-surface-subtle aspect-square w-full rounded-md object-cover"
                  />
                </li>
              ))
            ) : (
              <li className="text-text-secondary col-span-3 text-sm">
                No photography yet.
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDesignProjectDetailPage;
