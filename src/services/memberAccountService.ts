import { supabase } from "@/lib/supabase";

export interface LinkedMember {
  id: number;
  name: string;
  lastName: string;
  email: string;
  status: string;
  authUserId: string;
}

interface MemberRow {
  id: number;
  name: string;
  last_name: string | null;
  email: string;
  status: string;
  auth_user_id: string | null;
}

function mapMember(row: MemberRow): LinkedMember {
  return {
    id: Number(row.id),
    name: row.name,
    lastName: row.last_name ?? "",
    email: row.email,
    status: row.status,
    authUserId: row.auth_user_id ?? "",
  };
}

export async function linkCurrentUserToMember(): Promise<LinkedMember> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw new Error(
      `No fue posible consultar la cuenta: ${authError.message}`,
    );
  }

  if (!user?.id || !user.email) {
    throw new Error(
      "Debes iniciar sesión para vincular tu cuenta.",
    );
  }

  const { data: member, error: memberError } = await supabase
    .from("members")
    .select(
      "id, name, last_name, email, status, auth_user_id",
    )
    .ilike("email", user.email)
    .maybeSingle();

  if (memberError) {
    throw new Error(
      `No fue posible buscar al integrante: ${memberError.message}`,
    );
  }

  if (!member) {
    throw new Error(
      "El correo de esta cuenta no está registrado en la lista de integrantes.",
    );
  }

  const memberRow = member as MemberRow;

  if (memberRow.status.toLowerCase() !== "activo") {
    throw new Error(
      "Tu registro de integrante no se encuentra activo.",
    );
  }

  if (
    memberRow.auth_user_id &&
    memberRow.auth_user_id !== user.id
  ) {
    throw new Error(
      "Este integrante ya está vinculado con otra cuenta.",
    );
  }

  if (memberRow.auth_user_id === user.id) {
    return mapMember(memberRow);
  }

  const { data: updatedMember, error: updateError } =
    await supabase
      .from("members")
      .update({
        auth_user_id: user.id,
      })
      .eq("id", memberRow.id)
      .is("auth_user_id", null)
      .select(
        "id, name, last_name, email, status, auth_user_id",
      )
      .single();

  if (updateError) {
    throw new Error(
      `No fue posible vincular la cuenta: ${updateError.message}`,
    );
  }

  return mapMember(updatedMember as MemberRow);
}

export async function getCurrentLinkedMember(): Promise<LinkedMember | null> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw new Error(
      `No fue posible consultar la cuenta: ${authError.message}`,
    );
  }

  if (!user?.id) {
    return null;
  }

  const { data, error } = await supabase
    .from("members")
    .select(
      "id, name, last_name, email, status, auth_user_id",
    )
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(
      `No fue posible consultar al integrante: ${error.message}`,
    );
  }

  return data ? mapMember(data as MemberRow) : null;
}