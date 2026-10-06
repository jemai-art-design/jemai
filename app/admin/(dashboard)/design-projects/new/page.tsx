import { createProjectAction } from "@/app/admin/(dashboard)/design-projects/actions";
import { ProjectForm } from "@/components/admin/project-form";

/** Add new Design project — the create half of the shared project form. */
const AdminDesignProjectNewPage = () => (
  <ProjectForm
    kind="design"
    action={createProjectAction}
    cancelHref="/admin/design-projects"
    heading="Add new Design project"
    submitLabel="Add project"
  />
);

export default AdminDesignProjectNewPage;
