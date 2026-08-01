import { getMembers } from "@/services/memberService";
import { buildReportMetadata } from "@/services/reportService";

import type {
  ReportColumn,
  ReportDocument,
  ReportSection,
  ReportSummaryMetric,
} from "@/types/report";

import type {
  Member,
  MemberStatus,
  MemberVoice,
} from "@/types/member";

export interface MemberReportRow {
  id: number;
  fullName: string;
  voice: MemberVoice;
  status: MemberStatus;
  email: string;
  phone: string;
  joinDate: string;
}

export interface MemberVoiceSummary {
  voice: MemberVoice;
  total: number;
  percentage: number;
}

export interface MemberStatusSummary {
  status: MemberStatus;
  total: number;
  percentage: number;
}

export interface MemberReportSummary {
  totalMembers: number;
  activeMembers: number;
  temporaryLeaveMembers: number;
  inactiveMembers: number;
  permanentlyInactiveMembers: number;
  activePercentage: number;
  voices: MemberVoiceSummary[];
  statuses: MemberStatusSummary[];
}

export interface MemberReportData {
  document: ReportDocument<MemberReportRow>;
  summary: MemberReportSummary;
  members: MemberReportRow[];
}

const MEMBER_STATUS_ORDER: MemberStatus[] = [
  "Activo",
  "Permiso temporal",
  "Inactivo",
  "Baja definitiva",
];

const MEMBER_VOICE_ORDER: MemberVoice[] = [
  "Soprano",
  "Contralto",
  "Tenor",
  "Bajo",
  "Director",
  "Pianista",
  "Administración",
  "Otra",
];

const memberColumns: ReportColumn<MemberReportRow>[] = [
  {
    key: "fullName",
    header: "Integrante",
    align: "left",
  },
  {
    key: "voice",
    header: "Voz / función",
    align: "left",
  },
  {
    key: "status",
    header: "Estado",
    align: "center",
  },
  {
    key: "email",
    header: "Correo electrónico",
    align: "left",
  },
  {
    key: "phone",
    header: "Teléfono",
    align: "left",
  },
  {
    key: "joinDate",
    header: "Fecha de ingreso",
    align: "center",
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

function formatOptionalValue(
  value: string | null | undefined,
): string {
  const normalizedValue = value?.trim();

  return normalizedValue || "No registrado";
}

function formatDate(
  value: string | null,
): string {
  if (!value) {
    return "No registrada";
  }

  const date = new Date(`${value}T00:00:00`);

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

function buildFullName(
  member: Member,
): string {
  return [
    member.name.trim(),
    member.last_name.trim(),
  ]
    .filter(Boolean)
    .join(" ");
}

function mapMemberToReportRow(
  member: Member,
): MemberReportRow {
  return {
    id: member.id,
    fullName: buildFullName(member),
    voice: member.voice,
    status: member.status,
    email: formatOptionalValue(member.email),
    phone: formatOptionalValue(member.phone),
    joinDate: formatDate(member.join_date),
  };
}

function countMembersByStatus(
  members: Member[],
  status: MemberStatus,
): number {
  return members.filter(
    (member) => member.status === status,
  ).length;
}

function countMembersByVoice(
  members: Member[],
  voice: MemberVoice,
): number {
  return members.filter(
    (member) => member.voice === voice,
  ).length;
}

function buildVoiceSummary(
  members: Member[],
): MemberVoiceSummary[] {
  return MEMBER_VOICE_ORDER.map(
    (voice) => {
      const total = countMembersByVoice(
        members,
        voice,
      );

      return {
        voice,
        total,
        percentage: calculatePercentage(
          total,
          members.length,
        ),
      };
    },
  ).filter(
    (summary) => summary.total > 0,
  );
}

function buildStatusSummary(
  members: Member[],
): MemberStatusSummary[] {
  return MEMBER_STATUS_ORDER.map(
    (status) => {
      const total = countMembersByStatus(
        members,
        status,
      );

      return {
        status,
        total,
        percentage: calculatePercentage(
          total,
          members.length,
        ),
      };
    },
  );
}

function buildMemberReportSummary(
  members: Member[],
): MemberReportSummary {
  const totalMembers = members.length;

  const activeMembers = countMembersByStatus(
    members,
    "Activo",
  );

  const temporaryLeaveMembers =
    countMembersByStatus(
      members,
      "Permiso temporal",
    );

  const inactiveMembers =
    countMembersByStatus(
      members,
      "Inactivo",
    );

  const permanentlyInactiveMembers =
    countMembersByStatus(
      members,
      "Baja definitiva",
    );

  return {
    totalMembers,
    activeMembers,
    temporaryLeaveMembers,
    inactiveMembers,
    permanentlyInactiveMembers,
    activePercentage: calculatePercentage(
      activeMembers,
      totalMembers,
    ),
    voices: buildVoiceSummary(members),
    statuses: buildStatusSummary(members),
  };
}

function buildSummaryMetrics(
  summary: MemberReportSummary,
): ReportSummaryMetric[] {
  return [
    {
      id: "total-members",
      label: "Integrantes registrados",
      value: summary.totalMembers,
      description:
        "Total de integrantes incluidos en el reporte.",
    },
    {
      id: "active-members",
      label: "Integrantes activos",
      value: summary.activeMembers,
      description: `${summary.activePercentage.toFixed(
        2,
      )}% del total registrado.`,
    },
    {
      id: "temporary-leave-members",
      label: "Permisos temporales",
      value: summary.temporaryLeaveMembers,
      description:
        "Integrantes con permiso temporal vigente.",
    },
    {
      id: "inactive-members",
      label: "Inactivos y bajas",
      value:
        summary.inactiveMembers +
        summary.permanentlyInactiveMembers,
      description:
        "Integrantes inactivos o con baja definitiva.",
    },
  ];
}

function buildReportSections(
  members: MemberReportRow[],
  summary: MemberReportSummary,
): ReportSection<MemberReportRow>[] {
  return [
    {
      id: "member-summary",
      title: "Resumen general",
      description:
        "Indicadores principales de los integrantes registrados.",
      metrics: buildSummaryMetrics(summary),
    },
    {
      id: "member-list",
      title: "Listado de integrantes",
      description:
        "Relación general ordenada alfabéticamente por apellidos y nombre.",
      columns: memberColumns,
      rows: members,
    },
  ];
}

export async function getMemberReportData(): Promise<MemberReportData> {
  const sourceMembers = await getMembers();

  const members = sourceMembers.map(
    mapMemberToReportRow,
  );

  const summary =
    buildMemberReportSummary(sourceMembers);

  const document: ReportDocument<MemberReportRow> = {
    metadata: buildReportMetadata({
      reportId: "members-general-report",
      title: "Reporte general de integrantes",
      category: "members",
    }),
    sections: buildReportSections(
      members,
      summary,
    ),
  };

  return {
    document,
    summary,
    members,
  };}