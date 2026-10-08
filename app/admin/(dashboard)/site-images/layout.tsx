import { requireAdminPermission } from "@/lib/admin/auth/session";

const SiteImagesLayout = async ({
  children,
}: LayoutProps<"/admin/site-images">) => {
  await requireAdminPermission("site-images");
  return children;
};

export default SiteImagesLayout;
