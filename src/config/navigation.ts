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
  permissions: AppPermission[];
  permissionMatch?: "all" | "any";
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
    permissions: [
      "dashboard.view",
    ],
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
    permissions: [
      "dashboard.view",
    ],
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
    permissions: [
      "members.view",
      "members.manage",
    ],
    permissionMatch: "any",
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
    permissions: [
      "events.view",
      "events.manage",
    ],
    permissionMatch: "any",
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
    permissions: [
      "attendance.viewAll",
      "attendance.manage",
    ],
    permissionMatch: "any",
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
    permissions: [
      "repertoire.view",
      "repertoire.manage",
    ],
    permissionMatch: "any",
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
    permissions: [
      "fees.viewOwn",
      "fees.viewAll",
      "fees.manage",
    ],
    permissionMatch: "any",
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
    permissions: [
      "trips.viewOwn",
      "trips.viewAll",
      "trips.manage",
    ],
    permissionMatch: "any",
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
    permissions: [
      "reports.view",
    ],
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
    permissions: [
      "roles.manage",
    ],
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

function hasNavigationPermission(
  item: NavigationItem,
  permissions: AppPermission[],
): boolean {
  const match =
    item.permissionMatch ??
    "all";

  if (match === "any") {
    return item.permissions.some(
      (permission) =>
        permissions.includes(
          permission,
        ),
    );
  }

  return item.permissions.every(
    (permission) =>
      permissions.includes(
        permission,
      ),
  );
}

export function filterNavigationItems(
  items: NavigationItem[],
  permissions: AppPermission[],
): NavigationItem[] {
  return items.filter(
    (item) =>
      hasNavigationPermission(
        item,
        permissions,
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
