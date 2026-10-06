import { requireAdminPermission } from "@/lib/admin/auth/session";

const DesignProjectsLayout = async ({
  children,
}: LayoutProps<"/admin/design-projects">) => {
  await requireAdminPermission("design-projects");
  return children;
};

export default DesignProjectsLayout;
