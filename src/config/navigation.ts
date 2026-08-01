import type {
  AppPermission,
} from "@/types/accessControl";

export type NavigationItemId =
  | "dashboard"
  | "myAccount"
  | "members"
  | "events"
  | "attendance"
  | "repertoire"
  | "fees"
  | "trips"
  | "reports"
  | "settings";

export type NavigationIconName =
  | "home"
  | "userCircle"
  | "users"
  | "calendar"
  | "checkCircle"
  | "music"
  | "wallet"
  | "plane"
  | "chart"
  | "settings";

export interface NavigationItem {
  id: NavigationItemId;
  label: string;
  shortLabel: string;
  href: string;
  icon: NavigationIconName;
  permission: AppPermission;
  showInDesktop: boolean;
  showInMobileMenu: boolean;
  showInMobileBar: boolean;
}

export const MAIN_NAVIGATION_ITEMS:
NavigationItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    shortLabel: "Inicio",
    href: "/",
    icon: "home",
    permission: "dashboard.view",
    showInDesktop: true,
    showInMobileMenu: true,
    showInMobileBar: true,
  },
  {
    id: "myAccount",
    label: "Mi cuenta",
    shortLabel: "Mi cuenta",
    href: "/mi-cuenta",
    icon: "userCircle",
    permission: "dashboard.view",
    showInDesktop: true,
    showInMobileMenu: true,
    showInMobileBar: true,
  },
  {
    id: "members",
    label: "Integrantes",
    shortLabel: "Personas",
    href: "/integrantes",
    icon: "users",
    permission: "members.manage",
    showInDesktop: true,
    showInMobileMenu: true,
    showInMobileBar: false,
  },
  {
    id: "events",
    label: "Ensayos y eventos",
    shortLabel: "Agenda",
    href: "/eventos",
    icon: "calendar",
    permission: "events.manage",
    showInDesktop: true,
    showInMobileMenu: true,
    showInMobileBar: true,
  },
  {
    id: "attendance",
    label: "Asistencias",
    shortLabel: "Asistencia",
    href: "/asistencias",
    icon: "checkCircle",
    permission: "attendance.viewAll",
    showInDesktop: true,
    showInMobileMenu: true,
    showInMobileBar: false,
  },
  {
    id: "repertoire",
    label: "Repertorio",
    shortLabel: "Repertorio",
    href: "/repertorio",
    icon: "music",
    permission: "repertoire.view",
    showInDesktop: true,
    showInMobileMenu: true,
    showInMobileBar: true,
  },
  {
    id: "fees",
    label: "Cuotas",
    shortLabel: "Pagos",
    href: "/cuotas",
    icon: "wallet",
    permission: "fees.viewAll",
    showInDesktop: true,
    showInMobileMenu: true,
    showInMobileBar: false,
  },
  {
    id: "trips",
    label: "Viajes",
    shortLabel: "Viajes",
    href: "/viajes",
    icon: "plane",
    permission: "trips.viewAll",
    showInDesktop: true,
    showInMobileMenu: true,
    showInMobileBar: false,
  },
  {
    id: "reports",
    label: "Reportes",
    shortLabel: "Reportes",
    href: "/reportes",
    icon: "chart",
    permission: "reports.view",
    showInDesktop: true,
    showInMobileMenu: true,
    showInMobileBar: false,
  },
];

export const SECONDARY_NAVIGATION_ITEMS:
NavigationItem[] = [
  {
    id: "settings",
    label: "Roles y permisos",
    shortLabel: "Permisos",
    href: "/configuracion",
    icon: "settings",
    permission: "roles.manage",
    showInDesktop: true,
    showInMobileMenu: true,
    showInMobileBar: false,
  },
];

export const ALL_NAVIGATION_ITEMS:
NavigationItem[] = [
  ...MAIN_NAVIGATION_ITEMS,
  ...SECONDARY_NAVIGATION_ITEMS,
];

export function filterNavigationItems(
  items: NavigationItem[],
  permissions: AppPermission[],
): NavigationItem[] {
  return items.filter(
    (item) =>
      permissions.includes(
        item.permission,
      ),
  );
}

export function getDesktopNavigationItems(
  permissions: AppPermission[],
): NavigationItem[] {
  return filterNavigationItems(
    ALL_NAVIGATION_ITEMS.filter(
      (item) =>
        item.showInDesktop,
    ),
    permissions,
  );
}

export function getMobileMenuNavigationItems(
  permissions: AppPermission[],
): NavigationItem[] {
  return filterNavigationItems(
    ALL_NAVIGATION_ITEMS.filter(
      (item) =>
        item.showInMobileMenu,
    ),
    permissions,
  );
}

export function getMobileBarNavigationItems(
  permissions: AppPermission[],
): NavigationItem[] {
  return filterNavigationItems(
    ALL_NAVIGATION_ITEMS.filter(
      (item) =>
        item.showInMobileBar,
    ),
    permissions,
  );
}

export function isNavigationItemActive(
  pathname: string,
  href: string,
): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return (
    pathname === href ||
    pathname.startsWith(
      `${href}/`,
    )
  );
}
