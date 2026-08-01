import { supabase } from "@/lib/supabase";

import {
  getPermissionsForRoles,
  type AppPermission,
  type AppRole,
} from "@/types/accessControl";

export interface PermissionAdminMember {
  id: number;
  authUserId: string | null;
  fullName: string;
  email: string | null;
  role: AppRole;
  status: string;
}

export interface PermissionOverrideRecord {
  id: string;
  authUserId: string;
  permission: AppPermission;
  isGranted: boolean;
}

interface MemberRow {
  id: number;
  auth_user_id: string | null;
  name: string;
  last_name: string;
  email: string | null;
  role: string;
  status: string;
}

interface OverrideRow {
  id: string;
  auth_user_id: string;
  permission: AppPermission;
  is_granted: boolean;
}

function normalizeRole(
  value: string,
): AppRole {
  switch (
    value
      .trim()
      .toLowerCase()
  ) {
    case "admin":
      return "admin";

    case "teacher":
      return "teacher";

    case "student":
      return "student";

    default:
      return "member";
  }
}

export async function getPermissionAdminMembers(): Promise<
  PermissionAdminMember[]
> {
  const {
    data,
    error,
  } = await supabase
    .from("members")
    .select(
      "id, auth_user_id, name, last_name, email, role, status",
    )
    .order(
      "last_name",
      {
        ascending: true,
      },
    )
    .order(
      "name",
      {
        ascending: true,
      },
    );

  if (error) {
    throw new Error(
      `No fue posible consultar los usuarios: ${error.message}`,
    );
  }

  return (
    (data ?? []) as MemberRow[]
  ).map(
    (row) => ({
      id: Number(row.id),
      authUserId:
        row.auth_user_id,
      fullName: [
        row.name,
        row.last_name,
      ]
        .filter(Boolean)
        .join(" "),
      email: row.email,
      role:
        normalizeRole(
          row.role,
        ),
      status: row.status,
    }),
  );
}

export async function getPermissionOverrides(): Promise<
  PermissionOverrideRecord[]
> {
  const {
    data,
    error,
  } = await supabase
    .from(
      "member_permission_overrides",
    )
    .select(
      "id, auth_user_id, permission, is_granted",
    )
    .order(
      "permission",
      {
        ascending: true,
      },
    );

  if (error) {
    throw new Error(
      `No fue posible consultar los permisos individuales: ${error.message}`,
    );
  }

  return (
    (data ?? []) as OverrideRow[]
  ).map(
    (row) => ({
      id: row.id,
      authUserId:
        row.auth_user_id,
      permission:
        row.permission,
      isGranted:
        row.is_granted,
    }),
  );
}

export async function setPermissionOverride(
  authUserId: string,
  permission: AppPermission,
  isGranted: boolean,
): Promise<void> {
  const {
    error,
  } = await supabase
    .from(
      "member_permission_overrides",
    )
    .upsert(
      {
        auth_user_id:
          authUserId,
        permission,
        is_granted:
          isGranted,
        updated_at:
          new Date().toISOString(),
      },
      {
        onConflict:
          "auth_user_id,permission",
      },
    );

  if (error) {
    throw new Error(
      `No fue posible guardar el permiso: ${error.message}`,
    );
  }
}

export async function removePermissionOverride(
  authUserId: string,
  permission: AppPermission,
): Promise<void> {
  const {
    error,
  } = await supabase
    .from(
      "member_permission_overrides",
    )
    .delete()
    .eq(
      "auth_user_id",
      authUserId,
    )
    .eq(
      "permission",
      permission,
    );

  if (error) {
    throw new Error(
      `No fue posible restaurar el permiso heredado: ${error.message}`,
    );
  }
}

export function getInheritedPermissions(
  role: AppRole,
): AppPermission[] {
  return getPermissionsForRoles(
    [role],
  );
}
