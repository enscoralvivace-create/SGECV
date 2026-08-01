import {
  supabase,
} from "@/lib/supabase";

import type {
  AttendanceRecord,
  AttendanceSession,
} from "@/types/attendance";

import type {
  MemberAttendancePercentages,
  MemberAttendanceRecord,
  MemberAttendanceStats,
  MemberAttendanceStatsFilters,
  MemberAttendanceStatus,
  MemberAttendanceTotals,
  MemberAttendanceTrendPoint,
} from "@/types/memberAttendanceStats";

interface MemberStatsRow {
  id: number;
  name: string;
  last_name: string | null;
  status: string;
  voice: string | null;
}

const DEFAULT_RECENT_LIMIT = 12;

function calculatePercentage(
  value: number,
  total: number,
): number {
  if (total <= 0) {
    return 0;
  }

  return Number(
    (
      (value / total) *
      100
    ).toFixed(2),
  );
}

function buildMemberName(
  row: MemberStatsRow,
): string {
  return [
    row.name.trim(),
    row.last_name?.trim() ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

function normalizeFilters(
  filters?: MemberAttendanceStatsFilters,
): Required<MemberAttendanceStatsFilters> {
  return {
    startDate:
      filters?.startDate?.trim() ?? "",
    endDate:
      filters?.endDate?.trim() ?? "",
    recentLimit:
      Math.max(
        1,
        filters?.recentLimit ??
          DEFAULT_RECENT_LIMIT,
      ),
  };
}

async function getMember(
  memberId: number,
): Promise<MemberStatsRow> {
  const {
    data,
    error,
  } = await supabase
    .from("members")
    .select(
      "id, name, last_name, status, voice",
    )
    .eq(
      "id",
      memberId,
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      `No fue posible consultar al integrante: ${error.message}`,
    );
  }

  if (!data) {
    throw new Error(
      "No se encontró el integrante solicitado.",
    );
  }

  return data as MemberStatsRow;
}

async function getSessions(
  filters: Required<MemberAttendanceStatsFilters>,
): Promise<AttendanceSession[]> {
  let query = supabase
    .from("attendance_sessions")
    .select("*")
    .order(
      "rehearsal_date",
      {
        ascending: true,
      },
    );

  if (filters.startDate) {
    query = query.gte(
      "rehearsal_date",
      filters.startDate,
    );
  }

  if (filters.endDate) {
    query = query.lte(
      "rehearsal_date",
      filters.endDate,
    );
  }

  const {
    data,
    error,
  } = await query;

  if (error) {
    throw new Error(
      `No fue posible consultar las sesiones de asistencia: ${error.message}`,
    );
  }

  return (
    data ?? []
  ) as AttendanceSession[];
}

async function getMemberRecords(
  memberId: number,
  sessionIds: string[],
): Promise<AttendanceRecord[]> {
  if (
    sessionIds.length === 0
  ) {
    return [];
  }

  const {
    data,
    error,
  } = await supabase
    .from("attendance_records")
    .select("*")
    .eq(
      "member_id",
      memberId,
    )
    .in(
      "session_id",
      sessionIds,
    );

  if (error) {
    throw new Error(
      `No fue posible consultar las asistencias del integrante: ${error.message}`,
    );
  }

  return (
    data ?? []
  ) as AttendanceRecord[];
}

function buildRecords(
  sessions: AttendanceSession[],
  records: AttendanceRecord[],
): MemberAttendanceRecord[] {
  const recordBySessionId =
    new Map(
      records.map(
        (record) => [
          record.session_id,
          record,
        ],
      ),
    );

  return sessions
    .map(
      (
        session,
      ): MemberAttendanceRecord => {
        const record =
          recordBySessionId.get(
            session.id,
          );

        return {
          attendanceId:
            record?.id ?? "",
          sessionId:
            session.id,
          sessionTitle:
            session.title,
          sessionDate:
            session.rehearsal_date,
          checkedInAt:
            record?.checked_in_at ??
            null,
          status:
            (record?.status ??
              "absent") as MemberAttendanceStatus,
          notes: null,
        };
      },
    )
    .sort(
      (first, second) =>
        second.sessionDate.localeCompare(
          first.sessionDate,
        ),
    );
}

function countStatus(
  records: MemberAttendanceRecord[],
  status: MemberAttendanceStatus,
): number {
  return records.filter(
    (record) =>
      record.status === status,
  ).length;
}

function buildTotals(
  records: MemberAttendanceRecord[],
): MemberAttendanceTotals {
  return {
    totalSessions:
      records.length,
    presentCount:
      countStatus(
        records,
        "present",
      ),
    lateCount:
      countStatus(
        records,
        "late",
      ),
    justifiedCount:
      countStatus(
        records,
        "justified",
      ),
    absentCount:
      countStatus(
        records,
        "absent",
      ),
  };
}

function buildPercentages(
  totals: MemberAttendanceTotals,
): MemberAttendancePercentages {
  const attendedCount =
    totals.presentCount +
    totals.lateCount;

  return {
    attendancePercentage:
      calculatePercentage(
        attendedCount,
        totals.totalSessions,
      ),
    punctualityPercentage:
      calculatePercentage(
        totals.presentCount,
        attendedCount,
      ),
    justifiedPercentage:
      calculatePercentage(
        totals.justifiedCount,
        totals.totalSessions,
      ),
    absencePercentage:
      calculatePercentage(
        totals.absentCount,
        totals.totalSessions,
      ),
  };
}

function getPeriodKey(
  dateValue: string,
): string {
  return dateValue.slice(
    0,
    7,
  );
}

function formatPeriodLabel(
  period: string,
): string {
  const [
    year,
    month,
  ] =
    period
      .split("-")
      .map(Number);

  if (
    !year ||
    !month
  ) {
    return period;
  }

  return new Intl.DateTimeFormat(
    "es-MX",
    {
      month: "short",
      year: "numeric",
    },
  ).format(
    new Date(
      year,
      month - 1,
      1,
    ),
  );
}

function buildTrend(
  records: MemberAttendanceRecord[],
): MemberAttendanceTrendPoint[] {
  const groupedRecords =
    new Map<
      string,
      MemberAttendanceRecord[]
    >();

  records.forEach(
    (record) => {
      const period =
        getPeriodKey(
          record.sessionDate,
        );

      const current =
        groupedRecords.get(
          period,
        ) ?? [];

      current.push(record);

      groupedRecords.set(
        period,
        current,
      );
    },
  );

  return Array.from(
    groupedRecords.entries(),
  )
    .sort(
      (
        [firstPeriod],
        [secondPeriod],
      ) =>
        firstPeriod.localeCompare(
          secondPeriod,
        ),
    )
    .map(
      (
        [
          period,
          periodRecords,
        ],
      ) => {
        const attendedSessions =
          periodRecords.filter(
            (record) =>
              record.status ===
                "present" ||
              record.status ===
                "late",
          ).length;

        return {
          period,
          label:
            formatPeriodLabel(
              period,
            ),
          totalSessions:
            periodRecords.length,
          attendedSessions,
          attendancePercentage:
            calculatePercentage(
              attendedSessions,
              periodRecords.length,
            ),
        };
      },
    );
}

export async function getMemberAttendanceStats(
  memberId: number,
  filters?: MemberAttendanceStatsFilters,
): Promise<MemberAttendanceStats> {
  if (
    !Number.isInteger(
      memberId,
    ) ||
    memberId <= 0
  ) {
    throw new Error(
      "El identificador del integrante no es válido.",
    );
  }

  const normalizedFilters =
    normalizeFilters(
      filters,
    );

  const [
    member,
    sessions,
  ] =
    await Promise.all([
      getMember(
        memberId,
      ),
      getSessions(
        normalizedFilters,
      ),
    ]);

  const records =
    await getMemberRecords(
      memberId,
      sessions.map(
        (session) =>
          session.id,
      ),
    );

  const attendanceRecords =
    buildRecords(
      sessions,
      records,
    );

  const totals =
    buildTotals(
      attendanceRecords,
    );

  return {
    memberId:
      member.id,
    memberName:
      buildMemberName(
        member,
      ),
    memberStatus:
      member.status,
    voice:
      member.voice,
    totals,
    percentages:
      buildPercentages(
        totals,
      ),
    recentRecords:
      attendanceRecords.slice(
        0,
        normalizedFilters.recentLimit,
      ),
    trend:
      buildTrend(
        attendanceRecords,
      ),
  };
}