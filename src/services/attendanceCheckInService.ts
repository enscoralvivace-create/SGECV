import { supabase } from "@/lib/supabase";

import type {
  AttendanceRecord,
  AttendanceSession,
  AttendanceStatus,
} from "@/types/attendance";

interface MemberIdentity {
  id: number;
  name: string;
  email: string;
}

export interface AttendanceCheckInResult {
  session: AttendanceSession;
  record: AttendanceRecord;
  member: MemberIdentity;
  alreadyRegistered: boolean;
}

export async function getAttendanceSessionByToken(
  token: string,
): Promise<AttendanceSession | null> {
  const { data, error } = await supabase
    .from("attendance_sessions")
    .select("*")
    .eq("qr_token", token)
    .maybeSingle();

  if (error) {
    throw new Error(
      `No fue posible validar el código QR: ${error.message}`,
    );
  }

  return data as AttendanceSession | null;
}

async function getAuthenticatedMember(): Promise<MemberIdentity> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw new Error(
      `No fue posible consultar tu sesión: ${authError.message}`,
    );
  }

  if (!user?.id) {
    throw new Error(
      "Debes iniciar sesión para registrar tu asistencia.",
    );
  }

  const { data, error } = await supabase
    .from("members")
    .select("id, name, last_name, email, status")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(
      `No fue posible identificar al integrante: ${error.message}`,
    );
  }

  if (!data) {
    throw new Error(
      "Tu cuenta todavía no tiene un perfil de integrante.",
    );
  }

  if (String(data.status).toLowerCase() !== "activo") {
    throw new Error(
      "Tu cuenta aún debe ser aprobada por la administración.",
    );
  }

  const fullName = [
    String(data.name),
    data.last_name ? String(data.last_name) : "",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    id: Number(data.id),
    name: fullName,
    email: String(data.email),
  };
}

function getAttendanceStatus(
  session: AttendanceSession,
  currentDate: Date,
): AttendanceStatus {
  const startsAt = new Date(session.starts_at);
  const presentUntil = new Date(session.present_until);
  const lateUntil = new Date(session.late_until);
  const endsAt = new Date(session.ends_at);

  if (currentDate < startsAt) {
    throw new Error(
      "El registro de asistencia todavía no está disponible.",
    );
  }

  if (currentDate <= presentUntil) {
    return "present";
  }

  if (
    currentDate <= lateUntil &&
    currentDate <= endsAt
  ) {
    return "late";
  }

  throw new Error(
    "El periodo para registrar asistencia ya terminó.",
  );
}

export async function registerAttendanceByToken(
  token: string,
): Promise<AttendanceCheckInResult> {
  const session = await getAttendanceSessionByToken(token);

  if (!session) {
    throw new Error(
      "El código QR no corresponde a una sesión válida.",
    );
  }

  if (!session.is_active) {
    throw new Error(
      "Esta sesión de asistencia se encuentra cerrada.",
    );
  }

  const member = await getAuthenticatedMember();

  const { data: existingRecord, error: existingError } =
    await supabase
      .from("attendance_records")
      .select("*")
      .eq("session_id", session.id)
      .eq("member_id", member.id)
      .maybeSingle();

  if (existingError) {
    throw new Error(
      `No fue posible verificar tu asistencia: ${existingError.message}`,
    );
  }

  if (existingRecord) {
    return {
      session,
      member,
      record: existingRecord as AttendanceRecord,
      alreadyRegistered: true,
    };
  }

  const now = new Date();
  const status = getAttendanceStatus(session, now);

  const { data: newRecord, error: insertError } =
    await supabase
      .from("attendance_records")
      .insert({
        session_id: session.id,
        member_id: member.id,
        status,
        check_in_method: "qr",
        checked_in_at: now.toISOString(),
      })
      .select("*")
      .single();

  if (insertError) {
    throw new Error(
      `No fue posible registrar tu asistencia: ${insertError.message}`,
    );
  }

  return {
    session,
    member,
    record: newRecord as AttendanceRecord,
    alreadyRegistered: false,
  };
}