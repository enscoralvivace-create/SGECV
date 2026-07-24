import { supabase } from "@/lib/supabase";

export type MemberApprovalStatus =
  | "Pendiente"
  | "Activo"
  | "Inactivo";

export interface PendingMember {
  id: number;
  name: string;
  lastName: string;
  email: string;
  phone: string | null;
  voice: string | null;
  status: MemberApprovalStatus;
  createdAt: string;
}

interface PendingMemberRow {
  id: number;
  name: string;
  last_name: string | null;
  email: string;
  phone: string | null;
  voice: string | null;
  status: MemberApprovalStatus;
  created_at: string;
}

function mapMember(row: PendingMemberRow): PendingMember {
  return {
    id: Number(row.id),
    name: row.name,
    lastName: row.last_name ?? "",
    email: row.email,
    phone: row.phone,
    voice: row.voice,
    status: row.status,
    createdAt: row.created_at,
  };
}

async function ensureCurrentUserIsAdmin(): Promise<void> {
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
    throw new Error("Debes iniciar sesión.");
  }

  const { data, error } = await supabase
    .from("members")
    .select("role, status")
    .eq("auth_user_id", user.id)
    .maybeSingle();
    
console.log("Usuario autenticado:", user.id);
console.log("Resultado members:", data);
console.log("Error members:", error);

  if (error) {
    throw new Error(
      `No fue posible consultar tus permisos: ${error.message}`,
    );
  }

  if (!data || data.role !== "admin") {
    throw new Error(
      "No tienes permisos para administrar integrantes.",
    );
  }

  if (String(data.status).toLowerCase() !== "activo") {
    throw new Error(
      "Tu cuenta administradora no se encuentra activa.",
    );
  }
}

export async function getPendingMembers(): Promise<
  PendingMember[]
> {
  await ensureCurrentUserIsAdmin();

  const { data, error } = await supabase
    .from("members")
    .select(
      "id, name, last_name, email, phone, voice, status, created_at",
    )
    .eq("status", "Pendiente")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(
      `No fue posible consultar los integrantes pendientes: ${error.message}`,
    );
  }

  return (data as PendingMemberRow[]).map(mapMember);
}

export async function updateMemberApprovalStatus(
  memberId: number,
  status: "Activo" | "Inactivo",
): Promise<void> {
  await ensureCurrentUserIsAdmin();

  const { error } = await supabase
    .from("members")
    .update({
      status,
    })
    .eq("id", memberId);

  if (error) {
    throw new Error(
      `No fue posible actualizar el integrante: ${error.message}`,
    );
  }
}