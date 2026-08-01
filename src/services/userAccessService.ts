import { supabase } from "@/lib/supabase";

import {
  applyPermissionOverrides,
  getPermissionsForRoles,
  isAppPermission,
  type AppRole,
  type PermissionOverride,
  type UserAccessProfile,
} from "@/types/accessControl";

interface MemberAccessRow {
  id: number;
  auth_user_id: string;
  role: string | null;
  status: string | null;
}

interface PermissionOverrideRow {
  permission: string;
  is_granted: boolean;
}

function normalizeRole(
  value: string | null,
): AppRole | null {
  switch (
    value
      ?.trim()
      .toLowerCase()
  ) {
    case "admin":
      return "admin";

    case "teacher":
      return "teacher";

    case "student":
      return "student";

    case "member":
      return "member";

    default:
      return null;
  }
}

function isActiveStatus(
  value: string | null,
): boolean {
  const normalizedStatus =
    value
      ?.trim()
      .toLowerCase();

  return (
    normalizedStatus === "active" ||
    normalizedStatus === "activo"
  );
}

function normalizeOverrides(
  rows:
    PermissionOverrideRow[] |
    null,
): PermissionOverride[] {
  if (!rows) {
    return [];
  }

  return rows.flatMap(
    (row) =>
      isAppPermission(
        row.permission,
      )
        ? [
            {
              permission:
                row.permission,
              isGranted:
                row.is_granted,
            },
          ]
        : [],
  );
}

export async function getCurrentUserAccess(): Promise<
  UserAccessProfile | null
> {
  const {
    data: {
      session,
    },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(
      `No fue posible consultar la sesión: ${sessionError.message}`,
    );
  }

  if (!session?.user.id) {
    return null;
  }

  const {
    data: {
      user,
    },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw new Error(
      `No fue posible validar la sesión: ${authError.message}`,
    );
  }

  if (!user?.id) {
    return null;
  }

  const [
    memberResult,
    overridesResult,
  ] = await Promise.all([
    supabase
      .from("members")
      .select(
        "id, auth_user_id, role, status",
      )
      .eq(
        "auth_user_id",
        user.id,
      )
      .maybeSingle(),
    supabase
      .from(
        "member_permission_overrides",
      )
      .select(
        "permission, is_granted",
      )
      .eq(
        "auth_user_id",
        user.id,
      ),
  ]);

  if (memberResult.error) {
    throw new Error(
      `No fue posible consultar los permisos del usuario: ${memberResult.error.message}`,
    );
  }

  if (overridesResult.error) {
    throw new Error(
      `No fue posible consultar los permisos individuales: ${overridesResult.error.message}`,
    );
  }

  if (!memberResult.data) {
    return {
      authUserId: user.id,
      memberId: null,
      roles: [],
      permissions: [],
      isActive: false,
    };
  }

  const row =
    memberResult.data as MemberAccessRow;

  const role =
    normalizeRole(
      row.role,
    );

  const roles: AppRole[] =
    role
      ? [role]
      : [];

  const basePermissions =
    getPermissionsForRoles(
      roles,
    );

  const overrides =
    normalizeOverrides(
      overridesResult.data as
        | PermissionOverrideRow[]
        | null,
    );

  return {
    authUserId:
      row.auth_user_id,
    memberId:
      Number(row.id),
    roles,
    permissions:
      applyPermissionOverrides(
        basePermissions,
        overrides,
      ),
    isActive:
      isActiveStatus(
        row.status,
      ),
  };
}

export async function currentUserHasRole(
  role: AppRole,
): Promise<boolean> {
  const access =
    await getCurrentUserAccess();

  return (
    access?.roles.includes(
      role,
    ) ?? false
  );
}

export async function currentUserHasPermission(
  permission:
    UserAccessProfile["permissions"][number],
): Promise<boolean> {
  const access =
    await getCurrentUserAccess();

  return (
    access?.permissions.includes(
      permission,
    ) ?? false
  );
}

export async function requireCurrentUserAccess(): Promise<
  UserAccessProfile
> {
  const access =
    await getCurrentUserAccess();

  if (!access) {
    throw new Error(
      "No existe una sesión activa.",
    );
  }

  if (!access.isActive) {
    throw new Error(
      "La cuenta actual no está activa.",
    );
  }

  if (
    access.roles.length === 0
  ) {
    throw new Error(
      "La cuenta actual no tiene roles asignados.",
    );
  }

  return access;
}
