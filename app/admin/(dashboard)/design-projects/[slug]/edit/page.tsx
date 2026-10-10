import { notFound } from "next/navigation";

import { updateProjectAction } from "@/app/admin/(dashboard)/design-projects/actions";
import { ProjectForm, type ProjectFormValues } from "@/components/admin/project-form";
import { toContentAsset } from "@/lib/admin/content";
import { getProjectOfKind } from "@/lib/admin/projects";

/**
 * Edit — the same form, handed the project as defaults. The action is the
 * update one with the current slug bound to it, so a renamed project still
 * resolves.
 */
const AdminDesignProjectEditPage = async ({
  params,
}: PageProps<"/admin/design-projects/[slug]/edit">) => {
  const { slug } = await params;
  const project = await getProjectOfKind("design", slug);
  if (!project) notFound();

  const values: ProjectFormValues = {
    name: project.name,
    slug: project.slug,
    meta: project.meta,
    summary: project.summary,
    description: project.description,
    media: project.media.map((entry) => ({
      ...toContentAsset(entry.src, entry.type),
      alt: entry.alt,
    })),
    isActive: project.isActive,
  };

  return (
    <ProjectForm
      kind="design"
      project={values}
      action={updateProjectAction.bind(null, project.slug)}
      cancelHref={`/admin/design-projects/${project.slug}`}
      heading={`Edit ${project.name}`}
      submitLabel="Save changes"
    />
  );
};

export default AdminDesignProjectEditPage;
