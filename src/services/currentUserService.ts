import { supabase } from "@/lib/supabase";

export interface CurrentUserProfile {
  id: number;
  authUserId: string;
  name: string;
  lastName: string;
  fullName: string;
  initials: string;
  email: string;
  voice: string | null;
  role: string;
  status: string;
}

interface CurrentUserRow {
  id: number;
  auth_user_id: string;
  name: string;
  last_name: string | null;
  email: string;
  voice: string | null;
  role: string;
  status: string;
}

function createInitials(
  name: string,
  lastName: string,
): string {
  const values = [name, lastName]
    .map((value) => value.trim())
    .filter(Boolean);

  if (values.length === 0) {
    return "VS";
  }

  return values
    .map((value) => value.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

export async function getCurrentUserProfile(): Promise<CurrentUserProfile> {
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
    throw new Error("No existe una sesión activa.");
  }

  const { data, error } = await supabase
    .from("members")
    .select(
      "id, auth_user_id, name, last_name, email, voice, role, status",
    )
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(
      `No fue posible consultar el perfil: ${error.message}`,
    );
  }

  if (!data) {
    throw new Error(
      "La cuenta actual no tiene un perfil de integrante vinculado.",
    );
  }

  const row = data as CurrentUserRow;
  const lastName = row.last_name ?? "";
  const fullName = [row.name, lastName]
    .filter(Boolean)
    .join(" ");

  return {
    id: Number(row.id),
    authUserId: row.auth_user_id,
    name: row.name,
    lastName,
    fullName,
    initials: createInitials(row.name, lastName),
    email: row.email,
    voice: row.voice,
    role: row.role,
    status: row.status,
  };
}