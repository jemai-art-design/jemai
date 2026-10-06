import { createChristmasProjectAction } from "@/app/admin/(dashboard)/christmas-projects/actions";
import { ProjectForm } from "@/components/admin/project-form";

/** Add new Christmas design — the create half of the shared project form. */
const AdminChristmasProjectNewPage = () => (
  <ProjectForm
    kind="christmas"
    action={createChristmasProjectAction}
    cancelHref="/admin/christmas-projects"
    heading="Add new Christmas project"
    submitLabel="Add Christmas project"
  />
);

export default AdminChristmasProjectNewPage;
