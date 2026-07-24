import { supabase } from "@/lib/supabase";

export type UserRole = "admin" | "member";

export interface CurrentMemberProfile {
  id: number;
  name: string;
  lastName: string;
  email: string;
  status: string;
  role: UserRole;
  authUserId: string;
}

interface MemberProfileRow {
  id: number;
  name: string;
  last_name: string | null;
  email: string;
  status: string;
  role: UserRole;
  auth_user_id: string;
}

export async function getCurrentMemberProfile():
  Promise<CurrentMemberProfile | null> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw new Error(
      `No fue posible consultar la sesión: ${authError.message}`,
    );
  }

  if (!user?.id) {
    return null;
  }

  const { data, error } = await supabase
    .from("members")
    .select(
      "id, name, last_name, email, status, role, auth_user_id",
    )
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(
      `No fue posible consultar el perfil: ${error.message}`,
    );
  }

  if (!data) {
    return null;
  }

  const row = data as MemberProfileRow;

  return {
    id: Number(row.id),
    name: row.name,
    lastName: row.last_name ?? "",
    email: row.email,
    status: row.status,
    role: row.role,
    authUserId: row.auth_user_id,
  };
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const profile = await getCurrentMemberProfile();

  return profile?.role === "admin";
}