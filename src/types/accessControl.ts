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

export interface PermissionOverride {
  permission: AppPermission;
  isGranted: boolean;
}

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
    "attendance.viewAll",
    "attendance.manage",
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
    "repertoire.view",
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

export function applyPermissionOverrides(
  permissions: AppPermission[],
  overrides: PermissionOverride[],
): AppPermission[] {
  const result =
    new Set(permissions);

  overrides.forEach(
    ({
      permission,
      isGranted,
    }) => {
      if (isGranted) {
        result.add(permission);
      } else {
        result.delete(permission);
      }
    },
  );

  return Array.from(result);
}

export function isAppPermission(
  value: string,
): value is AppPermission {
  const permissions =
    new Set<AppPermission>(
      Object.values(
        ROLE_PERMISSIONS,
      ).flat(),
    );

  return permissions.has(
    value as AppPermission,
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
