import { requireAdminPermission } from "@/lib/admin/auth/session";

const ChristmasProjectsLayout = async ({
  children,
}: LayoutProps<"/admin/christmas-projects">) => {
  await requireAdminPermission("christmas-projects");
  return children;
};

export default ChristmasProjectsLayout;
