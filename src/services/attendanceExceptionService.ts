import { supabase } from "@/lib/supabase";
import {
  requireCurrentUserAccess,
} from "@/services/userAccessService";

export interface AttendanceExceptionMember {
  id: number;
  name: string;
  last_name: string;
  voice: string;
  hasException: boolean;
  reason: string;
}

export interface AttendanceExceptionSelection {
  memberId: number;
  reason: string;
}

interface ActiveMemberRow {
  id: number;
  name: string;
  last_name: string;
  voice: string;
}

interface ExceptionRow {
  member_id: number;
  reason: string | null;
}

async function ensureCanManageAttendance(): Promise<void> {
  const access = await requireCurrentUserAccess();

  if (
    !access.permissions.includes(
      "attendance.manage",
    )
  ) {
    throw new Error(
      "No tienes permiso para administrar excepciones de asistencia.",
    );
  }
}

export async function getAttendanceSessionExceptions(
  sessionId: string,
): Promise<AttendanceExceptionMember[]> {
  await ensureCanManageAttendance();

  const [membersResult, exceptionsResult] =
    await Promise.all([
      supabase
        .from("members")
        .select("id, name, last_name, voice")
        .eq("status", "Activo")
        .order("last_name", { ascending: true })
        .order("name", { ascending: true }),
      supabase
        .from(
          "attendance_session_check_in_exceptions",
        )
        .select("member_id, reason")
        .eq("session_id", sessionId),
    ]);

  if (membersResult.error) {
    throw new Error(
      `No fue posible consultar los integrantes activos: ${membersResult.error.message}`,
    );
  }

  if (exceptionsResult.error) {
    throw new Error(
      `No fue posible consultar las excepciones: ${exceptionsResult.error.message}`,
    );
  }

  const exceptionsByMember = new Map(
    ((exceptionsResult.data as ExceptionRow[] | null) ?? [])
      .map((exception) => [
        exception.member_id,
        exception.reason ?? "",
      ]),
  );

  return (
    (membersResult.data as ActiveMemberRow[] | null) ?? []
  ).map((member) => ({
    ...member,
    hasException: exceptionsByMember.has(member.id),
    reason: exceptionsByMember.get(member.id) ?? "",
  }));
}

export async function saveAttendanceSessionExceptions(
  sessionId: string,
  selections: AttendanceExceptionSelection[],
): Promise<void> {
  await ensureCanManageAttendance();

  const normalizedSelections = selections.map(
    (selection) => ({
      member_id: selection.memberId,
      reason: selection.reason.trim() || null,
    }),
  );

  const invalidReason = normalizedSelections.some(
    (selection) =>
      (selection.reason?.length ?? 0) > 250,
  );

  if (invalidReason) {
    throw new Error(
      "Los motivos no pueden superar 250 caracteres.",
    );
  }

  const { error } = await supabase.rpc(
    "sync_attendance_session_check_in_exceptions",
    {
      p_session_id: sessionId,
      p_exceptions: normalizedSelections,
    },
  );

  if (error) {
    throw new Error(
      `No fue posible guardar las excepciones: ${error.message}`,
    );
  }
}
