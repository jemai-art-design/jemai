import { notFound } from "next/navigation";

import { updateChristmasProjectAction } from "@/app/admin/(dashboard)/christmas-projects/actions";
import { ProjectForm, type ProjectFormValues } from "@/components/admin/project-form";
import { toContentAsset } from "@/lib/admin/content";
import { getProjectOfKind } from "@/lib/admin/projects";

/**
 * Edit — the same form, handed the project as defaults. The action is the
 * update one with the current slug bound to it, so a renamed project still
 * resolves.
 */
const AdminChristmasProjectEditPage = async ({
  params,
}: PageProps<"/admin/christmas-projects/[slug]/edit">) => {
  const { slug } = await params;
  const project = await getProjectOfKind("christmas", slug);
  if (!project) notFound();

  const values: ProjectFormValues = {
    name: project.name,
    slug: project.slug,
    meta: project.meta,
    summary: project.summary,
    description: project.description,
    images: project.images.map((image) => ({
      ...toContentAsset(image.src),
      alt: image.alt,
    })),
    isActive: project.isActive,
  };

  return (
    <ProjectForm
      kind="christmas"
      project={values}
      action={updateChristmasProjectAction.bind(null, project.slug)}
      cancelHref={`/admin/christmas-projects/${project.slug}`}
      heading={`Edit ${project.name}`}
      submitLabel="Save changes"
    />
  );
};

export default AdminChristmasProjectEditPage;
