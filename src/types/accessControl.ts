export type AppRole =
  | "admin"
  | "teacher"
  | "member"
  | "student";

export type AppPermission =
  | "dashboard.view"
  | "members.view"
  | "members.manage"
  | "events.view"
  | "events.manage"
  | "attendance.viewOwn"
  | "attendance.viewAll"
  | "attendance.manage"
  | "repertoire.view"
  | "repertoire.manage"
  | "fees.viewOwn"
  | "fees.viewAll"
  | "fees.manage"
  | "trips.viewOwn"
  | "trips.viewAll"
  | "trips.manage"
  | "reports.view"
  | "settings.manage"
  | "classes.viewOwn"
  | "classes.viewAssigned"
  | "classes.manage"
  | "progress.viewOwn"
  | "progress.viewAssigned"
  | "progress.manage"
  | "roles.manage";

export interface UserAccessProfile {
  authUserId: string;
  memberId: number | null;
  roles: AppRole[];
  permissions: AppPermission[];
  isActive: boolean;
}

export const ROLE_LABELS:
Record<AppRole, string> = {
  admin: "Administrador",
  teacher: "Profesor",
  member: "Integrante",
  student: "Alumno",
};

export const ROLE_PERMISSIONS:
Record<AppRole, AppPermission[]> = {
  admin: [
    "dashboard.view",
    "members.view",
    "members.manage",
    "events.view",
    "events.manage",
    "attendance.viewOwn",
    "attendance.viewAll",
    "attendance.manage",
    "repertoire.view",
    "repertoire.manage",
    "fees.viewOwn",
    "fees.viewAll",
    "fees.manage",
    "trips.viewOwn",
    "trips.viewAll",
    "trips.manage",
    "reports.view",
    "settings.manage",
    "classes.viewOwn",
    "classes.viewAssigned",
    "classes.manage",
    "progress.viewOwn",
    "progress.viewAssigned",
    "progress.manage",
    "roles.manage",
  ],
  teacher: [
    "dashboard.view",
    "events.view",
    "attendance.viewOwn",
    "repertoire.view",
    "fees.viewOwn",
    "trips.viewOwn",
    "classes.viewOwn",
    "classes.viewAssigned",
    "classes.manage",
    "progress.viewOwn",
    "progress.viewAssigned",
    "progress.manage",
  ],
  member: [
    "dashboard.view",
    "events.view",
    "attendance.viewOwn",
    "repertoire.view",
    "fees.viewOwn",
    "trips.viewOwn",
    "classes.viewOwn",
    "progress.viewOwn",
  ],
  student: [
    "dashboard.view",
    "classes.viewOwn",
    "attendance.viewOwn",
    "progress.viewOwn",
    "fees.viewOwn",
  ],
};

export function getPermissionsForRoles(
  roles: AppRole[],
): AppPermission[] {
  return Array.from(
    new Set(
      roles.flatMap(
        (role) =>
          ROLE_PERMISSIONS[role],
      ),
    ),
  );
}

export function hasPermission(
  permissions: AppPermission[],
  permission: AppPermission,
): boolean {
  return permissions.includes(
    permission,
  );
}

export function hasRole(
  roles: AppRole[],
  role: AppRole,
): boolean {
  return roles.includes(role);
}