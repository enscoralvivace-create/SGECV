import { supabase } from "@/lib/supabase";
import type {
  Member,
  MemberPayload,
  MemberStatus,
} from "@/types/member";

const MEMBERS_TABLE = "members";

/**
 * Obtiene todos los integrantes registrados.
 */
export async function getMembers(): 
Promise<Member[]> {
  const { data, error } = await supabase
    .from(MEMBERS_TABLE)
    .select("*")
    .order("last_name", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Member[];
}

/**
 * Obtiene únicamente los integrantes activos.
 *
 * Se utiliza en formularios operativos donde no deben aparecer
 * integrantes pendientes, inactivos o dados de baja.
 */
export async function getActiveMembers(): Promise<Member[]> {
  const { data, error } = await supabase
    .from(MEMBERS_TABLE)
    .select("*")
    .eq("status", "Activo")
    .order("last_name", {
      ascending: true,
    })
    .order("name", {
      ascending: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Member[];
}

/**
 * Crea un integrante nuevo.
 *
 * Este método crea únicamente el registro en public.members.
 * No crea una cuenta en Supabase Authentication.
 */
export async function createMember(
  member: MemberPayload,
): Promise<void> {
  const { error } = await supabase
    .from(MEMBERS_TABLE)
    .insert(member);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Actualiza la información completa de un integrante.
 */
export async function updateMember(
  id: number,
  member: MemberPayload,
): Promise<void> {
  const { error } = await supabase
    .from(MEMBERS_TABLE)
    .update(member)
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Actualiza solamente el estado de un integrante.
 *
 * Es preferible utilizar esta función para aprobar, rechazar,
 * dar de baja o reactivar integrantes, ya que evita enviar y
 * sobrescribir innecesariamente todos los demás campos.
 */
export async function updateMemberStatus(
  id: number,
  status: MemberStatus,
): Promise<void> {
  const { error } = await supabase
    .from(MEMBERS_TABLE)
    .update({ status })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Da de baja definitivamente a un integrante sin eliminar
 * su registro ni su cuenta de Supabase Authentication.
 *
 * Esto permite conservar su historial y reactivarlo posteriormente.
 */
export async function deactivateMember(
  id: number,
): Promise<void> {
  await updateMemberStatus(id, "Baja definitiva");
}

/**
 * Obtiene la cantidad total de integrantes activos.
 */
export async function getActiveMembersCount(): Promise<number> {
  const { count, error } = await supabase
    .from(MEMBERS_TABLE)
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("status", "Activo");

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}