import { supabase } from "@/lib/supabase";

import { getActiveMembers } from "@/services/memberService";
import { buildReportMetadata } from "@/services/reportService";

import type {
  AttendanceRecord,
  AttendanceSession,
  AttendanceStatus,
} from "@/types/attendance";

import type {
  AttendanceReportData,
  AttendanceReportFilters,
  AttendanceReportMemberRow,
  AttendanceReportSessionRow,
  AttendanceReportSummary,
  AttendanceStatusSummary,
} from "@/types/attendanceReport";

import type {
  Member,
} from "@/types/member";

import type {
  ReportColumn,
  ReportDocument,
  ReportSection,
  ReportSummaryMetric,
} from "@/types/report";

const STATUS_LABELS: Record<
  AttendanceStatus,
  string
> = {
  present: "Presente",
  late: "Retardo",
  justified: "Falta justificada",
  absent: "Falta",
};

const STATUS_ORDER: AttendanceStatus[] = [
  "present",
  "late",
  "justified",
  "absent",
];

const memberColumns:
ReportColumn<AttendanceReportMemberRow>[] = [
  {
    key: "memberName",
    header: "Integrante",
    align: "left",
  },
  {
    key: "voice",
    header: "Voz / función",
    align: "left",
  },
  {
    key: "totalSessions",
    header: "Sesiones",
    align: "center",
  },
  {
    key: "presentCount",
    header: "Presentes",
    align: "center",
  },
  {
    key: "lateCount",
    header: "Retardos",
    align: "center",
  },
  {
    key: "justifiedCount",
    header: "Justificadas",
    align: "center",
  },
  {
    key: "absentCount",
    header: "Faltas",
    align: "center",
  },
  {
    key: "attendancePercentage",
    header: "Asistencia",
    align: "right",
    format: (value) =>
      `${Number(value ?? 0).toFixed(2)}%`,
  },
];

function calculatePercentage(
  value: number,
  total: number,
): number {
  if (total <= 0) {
    return 0;
  }

  return Number(
    ((value / total) * 100).toFixed(2),
  );
}

function buildMemberName(
  member: Member,
): string {
  return [
    member.name.trim(),
    member.last_name.trim(),
  ]
    .filter(Boolean)
    .join(" ");
}

function formatDate(
  value: string,
): string {
  const date = new Date(
    `${value}T00:00:00`,
  );

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "es-MX",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    },
  ).format(date);
}

function normalizeFilters(
  filters?: Partial<AttendanceReportFilters>,
): AttendanceReportFilters {
  return {
    startDate:
      filters?.startDate?.trim() || null,
    endDate:
      filters?.endDate?.trim() || null,
  };
}

async function getAttendanceSessions(
  filters: AttendanceReportFilters,
): Promise<AttendanceSession[]> {
  let query = supabase
    .from("attendance_sessions")
    .select("*")
    .order("rehearsal_date", {
      ascending: true,
    });

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

  const { data, error } = await query;

  if (error) {
    throw new Error(
      `No fue posible consultar las sesiones de asistencia: ${error.message}`,
    );
  }

  return (data ?? []) as AttendanceSession[];
}

async function getAttendanceRecords(
  sessionIds: string[],
): Promise<AttendanceRecord[]> {
  if (sessionIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("attendance_records")
    .select("*")
    .in("session_id", sessionIds);

  if (error) {
    throw new Error(
      `No fue posible consultar los registros de asistencia: ${error.message}`,
    );
  }

  return (data ?? []) as AttendanceRecord[];
}

function countStatus(
  records: AttendanceRecord[],
  status: AttendanceStatus,
): number {
  return records.filter(
    (record) => record.status === status,
  ).length;
}

function buildStatusSummary(
  records: AttendanceRecord[],
): AttendanceStatusSummary[] {
  return STATUS_ORDER.map(
    (status) => {
      const total = countStatus(
        records,
        status,
      );

      return {
        status,
        label: STATUS_LABELS[status],
        total,
        percentage: calculatePercentage(
          total,
          records.length,
        ),
      };
    },
  );
}

function buildSummary(
  sessions: AttendanceSession[],
  members: Member[],
  records: AttendanceRecord[],
): AttendanceReportSummary {
  const presentCount = countStatus(
    records,
    "present",
  );

  const lateCount = countStatus(
    records,
    "late",
  );

  const justifiedCount = countStatus(
    records,
    "justified",
  );

  const absentCount = countStatus(
    records,
    "absent",
  );

  const attendedCount =
    presentCount + lateCount;

  return {
    totalSessions: sessions.length,
    totalMembers: members.length,
    totalRecords: records.length,
    presentCount,
    lateCount,
    justifiedCount,
    absentCount,
    attendedCount,
    attendancePercentage:
      calculatePercentage(
        attendedCount,
        records.length,
      ),
    punctualityPercentage:
      calculatePercentage(
        presentCount,
        attendedCount,
      ),
    statuses:
      buildStatusSummary(records),
  };
}

function buildMemberRows(
  members: Member[],
  sessions: AttendanceSession[],
  records: AttendanceRecord[],
): AttendanceReportMemberRow[] {
  return members.map((member) => {
    const memberRecords = records.filter(
      (record) =>
        record.member_id === member.id,
    );

    const presentCount = countStatus(
      memberRecords,
      "present",
    );

    const lateCount = countStatus(
      memberRecords,
      "late",
    );

    const justifiedCount = countStatus(
      memberRecords,
      "justified",
    );

    const absentCount = countStatus(
      memberRecords,
      "absent",
    );

    const attendedCount =
      presentCount + lateCount;

    return {
      memberId: member.id,
      memberName: buildMemberName(member),
      voice: member.voice,
      totalSessions: sessions.length,
      presentCount,
      lateCount,
      justifiedCount,
      absentCount,
      attendedCount,
      attendancePercentage:
        calculatePercentage(
          attendedCount,
          sessions.length,
        ),
    };
  });
}

function buildSessionRows(
  sessions: AttendanceSession[],
  members: Member[],
  records: AttendanceRecord[],
): AttendanceReportSessionRow[] {
  return sessions.map((session) => {
    const sessionRecords = records.filter(
      (record) =>
        record.session_id === session.id,
    );

    const presentCount = countStatus(
      sessionRecords,
      "present",
    );

    const lateCount = countStatus(
      sessionRecords,
      "late",
    );

    const justifiedCount = countStatus(
      sessionRecords,
      "justified",
    );

    const absentCount = countStatus(
      sessionRecords,
      "absent",
    );

    return {
      sessionId: session.id,
      rehearsalDate: formatDate(
        session.rehearsal_date,
      ),
      title: session.title,
      totalMembers: members.length,
      presentCount,
      lateCount,
      justifiedCount,
      absentCount,
      attendancePercentage:
        calculatePercentage(
          presentCount + lateCount,
          members.length,
        ),
    };
  });
}

function buildSummaryMetrics(
  summary: AttendanceReportSummary,
): ReportSummaryMetric[] {
  return [
    {
      id: "total-sessions",
      label: "Sesiones registradas",
      value: summary.totalSessions,
      description:
        "Sesiones incluidas en el periodo.",
    },
    {
      id: "attendance-percentage",
      label: "Asistencia general",
      value:
        `${summary.attendancePercentage.toFixed(
          2,
        )}%`,
      description:
        "Presentes y retardos respecto de los registros.",
    },
    {
      id: "punctuality-percentage",
      label: "Puntualidad",
      value:
        `${summary.punctualityPercentage.toFixed(
          2,
        )}%`,
      description:
        "Presentes respecto de quienes asistieron.",
    },
    {
      id: "absences",
      label: "Faltas registradas",
      value: summary.absentCount,
      description:
        "Faltas no justificadas en el periodo.",
    },
  ];
}

function buildSections(
  members: AttendanceReportMemberRow[],
  summary: AttendanceReportSummary,
): ReportSection<AttendanceReportMemberRow>[] {
  return [
    {
      id: "attendance-summary",
      title: "Resumen general",
      description:
        "Indicadores principales de asistencia.",
      metrics: buildSummaryMetrics(summary),
    },
    {
      id: "attendance-members",
      title: "Asistencia por integrante",
      description:
        "Concentrado individual del periodo seleccionado.",
      columns: memberColumns,
      rows: members,
    },
  ];
}

export async function getAttendanceReportData(
  filters?: Partial<AttendanceReportFilters>,
): Promise<AttendanceReportData> {
  const normalizedFilters =
    normalizeFilters(filters);

  const [sessions, members] =
    await Promise.all([
      getAttendanceSessions(
        normalizedFilters,
      ),
      getActiveMembers(),
    ]);

  const records =
    await getAttendanceRecords(
      sessions.map(
        (session) => session.id,
      ),
    );

  const summary = buildSummary(
    sessions,
    members,
    records,
  );

  const memberRows = buildMemberRows(
    members,
    sessions,
    records,
  );

  const sessionRows = buildSessionRows(
    sessions,
    members,
    records,
  );

  const document:
  ReportDocument<AttendanceReportMemberRow> = {
    metadata: buildReportMetadata({
      reportId:
        "attendance-general-report",
      title:
        "Reporte general de asistencias",
      category: "attendance",
      filters: {
        dateRange: {
          startDate:
            normalizedFilters.startDate,
          endDate:
            normalizedFilters.endDate,
        },
      },
    }),
    sections: buildSections(
      memberRows,
      summary,
    ),
  };

  return {
    document,
    filters: normalizedFilters,
    summary,
    members: memberRows,
    sessions: sessionRows,
  };
}