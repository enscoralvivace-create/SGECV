import { memberReportColumns } from "@/services/reports/members/memberReportColumns";

import type {
  MemberReportRow,
  MemberReportSummary,
} from "@/types/memberReport";

import type {
  ReportSection,
  ReportSummaryMetric,
} from "@/types/report";

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

export function buildMemberReportSections(
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
      columns: memberReportColumns,
      rows: members,
    },
  ];
}