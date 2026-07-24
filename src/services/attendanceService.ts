import { supabase } from "@/lib/supabase";
import type { AttendanceSession } from "@/types/attendance";
import type { Rehearsal } from "@/types/rehearsal";

function createDateTime(date: string, time: string): Date {
  const normalizedTime =
    time.length === 5 ? `${time}:00` : time;

  return new Date(`${date}T${normalizedTime}`);
}

function addMinutes(date: Date, minutes: number): Date {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
}

export async function getAttendanceSessionByDate(
  rehearsalDate: string,
): Promise<AttendanceSession | null> {
  const { data, error } = await supabase
    .from("attendance_sessions")
    .select("*")
    .eq("rehearsal_date", rehearsalDate)
    .maybeSingle();

  if (error) {
    throw new Error(
      `No fue posible consultar la sesión de asistencia: ${error.message}`,
    );
  }

  return data as AttendanceSession | null;
}

export async function createAttendanceSession(
  rehearsal: Rehearsal,
): Promise<AttendanceSession> {
  if (rehearsal.status === "cancelled") {
    throw new Error(
      "No se puede crear una sesión para un ensayo cancelado.",
    );
  }

  const startsAt = createDateTime(
    rehearsal.date,
    rehearsal.startTime,
  );

  const endsAt = createDateTime(
    rehearsal.date,
    rehearsal.endTime,
  );

  /*
   * Presente hasta 10 minutos después del inicio.
   * Retardo permitido hasta 30 minutos después del inicio.
   */
  const presentUntil = addMinutes(startsAt, 10);
  const lateUntilCandidate = addMinutes(startsAt, 30);

  const lateUntil =
    lateUntilCandidate < endsAt
      ? lateUntilCandidate
      : endsAt;

  const { data, error } = await supabase
    .from("attendance_sessions")
    .insert({
      rehearsal_date: rehearsal.date,
      title: rehearsal.title,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      present_until: presentUntil.toISOString(),
      late_until: lateUntil.toISOString(),
      is_active: true,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `No fue posible crear la sesión de asistencia: ${error.message}`,
    );
  }

  return data as AttendanceSession;
}

export async function getOrCreateAttendanceSession(
  rehearsal: Rehearsal,
): Promise<AttendanceSession> {
  const existingSession =
    await getAttendanceSessionByDate(rehearsal.date);

  if (existingSession) {
    return existingSession;
  }

  return createAttendanceSession(rehearsal);
}

export async function getAttendanceCount(
  sessionId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("attendance_records")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("session_id", sessionId);

  if (error) {
    throw new Error(
      `No fue posible consultar las asistencias: ${error.message}`,
    );
  }

  return count ?? 0;
}