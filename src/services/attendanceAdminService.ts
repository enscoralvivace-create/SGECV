import { supabase } from "@/lib/supabase";
import {
  requireCurrentUserAccess,
} from "@/services/userAccessService";

import type {
  AttendanceRecord,
  AttendanceSession,
  AttendanceStatus,
} from "@/types/attendance";

export interface AttendanceSessionSummary {
  session: AttendanceSession;
  registered: number;
  present: number;
  late: number;
  justified: number;
  absent: number;
  attendancePercentage: number;
}

export interface AttendanceDashboardData {
  activeMembers: number;
  totalSessions: number;
  totalRecords: number;
  averageAttendance: number;
  sessions: AttendanceSessionSummary[];
}

interface MemberStatusRow {
  status: string | null;
}

function isActiveMemberStatus(
  status: string | null,
): boolean {
  return (
    status
      ?.trim()
      .toLowerCase() === "activo"
  );
}

async function ensureCurrentUserCanReadAttendance(): Promise<void> {
  const access = await requireCurrentUserAccess();

  const canAdministerAttendance =
    access.permissions.includes(
      "attendance.viewAll",
    ) ||
    access.permissions.includes(
      "attendance.manage",
    );

  if (!canAdministerAttendance) {
    throw new Error(
      "No tienes permisos para administrar asistencias.",
    );
  }
}

async function ensureCurrentUserCanMutateAttendance(): Promise<void> {
  const access = await requireCurrentUserAccess();

  if (
    !access.permissions.includes(
      "attendance.manage",
    )
  ) {
    throw new Error(
      "No tienes permisos para modificar sesiones de asistencia.",
    );
  }
}

function countStatus(
  records: AttendanceRecord[],
  status: AttendanceStatus,
): number {
  return records.filter(
    (record) => record.status === status,
  ).length;
}

export async function getAttendanceDashboardData(): Promise<AttendanceDashboardData> {
  await ensureCurrentUserCanReadAttendance();

  const { data: membersData, error: membersError } =
    await supabase
      .from("members")
      .select("status");

  if (membersError) {
    throw new Error(
      `No fue posible consultar los integrantes activos: ${membersError.message}`,
    );
  }

  const activeMembers = (
    (membersData as MemberStatusRow[] | null) ?? []
  ).filter(
    (member) =>
      isActiveMemberStatus(
        member.status,
      ),
  ).length;

  const { data: sessionsData, error: sessionsError } =
    await supabase
      .from("attendance_sessions")
      .select("*")
      .order("rehearsal_date", {
        ascending: false,
      })
      .order("starts_at", {
        ascending: false,
      })
      .limit(30);

  if (sessionsError) {
    throw new Error(
      `No fue posible consultar las sesiones: ${sessionsError.message}`,
    );
  }

  const sessions =
    (sessionsData as AttendanceSession[] | null) ?? [];

  if (sessions.length === 0) {
    return {
      activeMembers,
      totalSessions: 0,
      totalRecords: 0,
      averageAttendance: 0,
      sessions: [],
    };
  }

  const sessionIds = sessions.map(
    (session) => session.id,
  );

  const { data: recordsData, error: recordsError } =
    await supabase
      .from("attendance_records")
      .select("*")
      .in("session_id", sessionIds);

  if (recordsError) {
    throw new Error(
      `No fue posible consultar los registros: ${recordsError.message}`,
    );
  }

  const records =
    (recordsData as AttendanceRecord[] | null) ?? [];

  const sessionSummaries = sessions.map((session) => {
    const sessionRecords = records.filter(
      (record) => record.session_id === session.id,
    );

    const present = countStatus(
      sessionRecords,
      "present",
    );

    const late = countStatus(sessionRecords, "late");

    const justified = countStatus(
      sessionRecords,
      "justified",
    );

    const registered = sessionRecords.length;

    const absent = Math.max(
      activeMembers - registered,
      0,
    );

    const attendancePercentage =
      activeMembers > 0
        ? Math.round(
            ((present + late + justified) /
              activeMembers) *
              100,
          )
        : 0;

    return {
      session,
      registered,
      present,
      late,
      justified,
      absent,
      attendancePercentage,
    };
  });

  const averageAttendance =
    sessionSummaries.length > 0
      ? Math.round(
          sessionSummaries.reduce(
            (total, item) =>
              total + item.attendancePercentage,
            0,
          ) / sessionSummaries.length,
        )
      : 0;

  return {
    activeMembers,
    totalSessions: sessions.length,
    totalRecords: records.length,
    averageAttendance,
    sessions: sessionSummaries,
  };
}

export async function updateAttendanceSessionStatus(
  sessionId: string,
  isActive: boolean,
): Promise<void> {
  await ensureCurrentUserCanMutateAttendance();

  const { error } = await supabase
    .from("attendance_sessions")
    .update({
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId);

  if (error) {
    throw new Error(
      `No fue posible actualizar la sesión: ${error.message}`,
    );
  }
}
