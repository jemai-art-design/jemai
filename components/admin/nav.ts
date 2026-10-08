import {
  Armchair,
  CalendarDays,
  ClipboardList,
  Compass,
  Snowflake,
  Frame,
  Gift,
  Images,
  LayoutDashboard,
  Mail,
  MessageSquare,
  ShoppingBag,
  Tags,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import { hasPermission, type AdminPermission } from "@/lib/admin/auth/permissions";

export type AdminNavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  permission?: AdminPermission;
  /**
   * For a screen that is not a section of its own: shown to anyone holding one
   * of these. Kept out of `permission` so it stays ungrantable — nobody is
   * given "categories" on the administrators screen, they are given the
   * catalogue whose vocabulary it is.
   */
  anyOf?: AdminPermission[];
};

export type AdminNavGroup = {
  title: string;
  items: AdminNavItem[];
};

export const adminNav: AdminNavGroup[] = [
  {
    title: "Content",
    items: [
      { title: "Overview", url: "/admin", icon: LayoutDashboard },
      { title: "Furniture", url: "/admin/furniture", icon: Armchair, permission: "furniture" },
      { title: "Artworks", url: "/admin/artworks", icon: Frame, permission: "artworks" },
      { title: "Exhibitions", url: "/admin/exhibitions", icon: CalendarDays, permission: "exhibitions" },
      {
        title: "Categories & mediums",
        url: "/admin/taxonomy",
        icon: Tags,
        anyOf: ["furniture", "artworks"],
      },
    ],
  },
  {
    title: "Operations",
    items: [
      { title: "Furniture orders", url: "/admin/orders", icon: ShoppingBag, permission: "orders" },
      {
        title: "Artwork enquiries",
        url: "/admin/artwork-enquiries",
        icon: MessageSquare,
        permission: "artwork-enquiries",
      },
      {
        title: "Consultation requests",
        url: "/admin/consultation-requests",
        icon: ClipboardList,
        permission: "consultation-requests",
      },
      {
        title: "Christmas requests",
        url: "/admin/christmas-requests",
        icon: Gift,
        permission: "christmas-requests",
      },
    ],
  },
  {
    title: "Showcase",
    items: [
      {
        title: "Design projects",
        url: "/admin/design-projects",
        icon: Compass,
        permission: "design-projects",
      },
      {
        title: "Christmas projects",
        url: "/admin/christmas-projects",
        icon: Snowflake,
        permission: "christmas-projects",
      },
      {
        title: "Site images",
        url: "/admin/site-images",
        icon: Images,
        permission: "site-images",
      },
    ],
  },
  {
    title: "Audience",
    items: [
      { title: "Newsletter", url: "/admin/newsletter", icon: Mail, permission: "newsletter" },
    ],
  },
  {
    title: "Team",
    items: [
      {
        title: "Administrators",
        url: "/admin/admins",
        icon: UsersRound,
        permission: "admins",
      },
    ],
  },
];

/** The nav entry a pathname sits under, used for the breadcrumb tail. */
export const findAdminNavItem = (pathname: string) => {
  const items = adminNav.flatMap((group) => group.items);
  const exact = items.find((item) => item.url === pathname);
  if (exact) return exact;
  return items
    .filter((item) => item.url !== "/admin" && pathname.startsWith(`${item.url}/`))
    .sort((a, b) => b.url.length - a.url.length)[0];
};

export const visibleAdminNav = (permissions: readonly string[]): AdminNavGroup[] =>
  adminNav
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (item.permission) return hasPermission(permissions, item.permission);
        if (item.anyOf) return item.anyOf.some((slug) => hasPermission(permissions, slug));
        return true;
      }),
    }))
    .filter((group) => group.items.length);

export const adminPermissionLabels: Record<AdminPermission, string> = Object.fromEntries(
  adminNav
    .flatMap((group) => group.items)
    .filter((item) => item.permission)
    .map((item) => [item.permission, item.title]),
) as Record<AdminPermission, string>;
