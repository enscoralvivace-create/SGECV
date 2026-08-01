import { supabase } from "@/lib/supabase";

import { getAttendanceReportData } from "@/services/reports/attendance/attendanceReportService";
import { getMemberReportData } from "@/services/reports/members/memberReportService";
import { getRepertoireReportData } from "@/services/reports/repertoire/repertoireReportService";
import { buildReportMetadata } from "@/services/reportService";
import { getTrips } from "@/services/tripService";

import type {
  ReportDocument,
  ReportSection,
  ReportSummaryMetric,
} from "@/types/report";

import type {
  StatisticsReportData,
  StatisticsReportMetric,
  StatisticsReportModuleSummary,
  StatisticsReportSummary,
} from "@/types/statisticsReport";

interface PaymentAmountRow {
  amount: number | string | null;
}

interface ChargeWithPaymentsRow {
  amount: number | string | null;
  status: string;
  payments:
    | PaymentAmountRow[]
    | null;
}

interface FinancialStatistics {
  totalCharges: number;
  totalPaid: number;
  totalPending: number;
  recoveryPercentage: number;
}

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

function formatCurrency(
  value: number,
): string {
  return new Intl.NumberFormat(
    "es-MX",
    {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    },
  ).format(value);
}

async function getFinancialStatistics(): Promise<FinancialStatistics> {
  const { data, error } = await supabase
    .from("member_charges")
    .select(`
      amount,
      status,
      payments (
        amount
      )
    `);

  if (error) {
    throw new Error(
      `No fue posible consultar la información financiera: ${error.message}`,
    );
  }

  const charges = (
    (data ?? []) as ChargeWithPaymentsRow[]
  ).filter(
    (charge) =>
      charge.status !== "cancelled",
  );

  const totalCharges = charges.reduce(
    (total, charge) =>
      total +
      Number(charge.amount ?? 0),
    0,
  );

  const totalPaid = charges.reduce(
    (total, charge) =>
      total +
      (charge.payments ?? []).reduce(
        (paymentTotal, payment) =>
          paymentTotal +
          Number(payment.amount ?? 0),
        0,
      ),
    0,
  );

  const totalPending = Math.max(
    totalCharges - totalPaid,
    0,
  );

  return {
    totalCharges,
    totalPaid,
    totalPending,
    recoveryPercentage:
      calculatePercentage(
        totalPaid,
        totalCharges,
      ),
  };
}

function buildMetrics(
  summary: StatisticsReportSummary,
): StatisticsReportMetric[] {
  return [
    {
      id: "members-total",
      label: "Integrantes registrados",
      value: summary.totalMembers,
      description:
        `${summary.activeMembers} integrantes activos.`,
      category: "members",
    },
    {
      id: "members-active",
      label: "Integrantes activos",
      value: summary.activeMembers,
      description:
        `${calculatePercentage(
          summary.activeMembers,
          summary.totalMembers,
        ).toFixed(2)}% del total registrado.`,
      category: "members",
    },
    {
      id: "attendance-general",
      label: "Asistencia general",
      value:
        `${summary.attendancePercentage.toFixed(
          2,
        )}%`,
      description:
        "Presentes y retardos respecto de los registros.",
      category: "attendance",
    },
    {
      id: "attendance-punctuality",
      label: "Puntualidad",
      value:
        `${summary.punctualityPercentage.toFixed(
          2,
        )}%`,
      description:
        "Presentes respecto de quienes asistieron.",
      category: "attendance",
    },
    {
      id: "repertoire-total",
      label: "Obras registradas",
      value:
        summary.totalRepertoireWorks,
      description:
        `${summary.activeRepertoireWorks} obras activas.`,
      category: "repertoire",
    },
    {
      id: "repertoire-active",
      label: "Obras activas",
      value:
        summary.activeRepertoireWorks,
      description:
        "Obras disponibles para programación.",
      category: "repertoire",
    },
    {
      id: "finances-charged",
      label: "Cargos generados",
      value:
        formatCurrency(
          summary.totalCharges,
        ),
      description:
        "Total de cargos no cancelados.",
      category: "finances",
    },
    {
      id: "finances-paid",
      label: "Pagos recibidos",
      value:
        formatCurrency(summary.totalPaid),
      description:
        `${summary.recoveryPercentage.toFixed(
          2,
        )}% de recuperación.`,
      category: "finances",
    },
    {
      id: "finances-pending",
      label: "Saldo pendiente",
      value:
        formatCurrency(
          summary.totalPending,
        ),
      description:
        "Importe pendiente de recuperación.",
      category: "finances",
    },
    {
      id: "trips-total",
      label: "Viajes registrados",
      value: summary.totalTrips,
      description:
        `${summary.activeTrips} activos y ${summary.completedTrips} finalizados.`,
      category: "trips",
    },
    {
      id: "trips-active",
      label: "Viajes activos",
      value: summary.activeTrips,
      description:
        "Viajes actualmente en desarrollo.",
      category: "trips",
    },
    {
      id: "trips-completed",
      label: "Viajes finalizados",
      value: summary.completedTrips,
      description:
        "Viajes concluidos en el sistema.",
      category: "trips",
    },
  ];
}

function buildModules(
  metrics: StatisticsReportMetric[],
): StatisticsReportModuleSummary[] {
  const definitions:
  Array<
    Omit<
      StatisticsReportModuleSummary,
      "metrics"
    >
  > = [
    {
      category: "members",
      title: "Integrantes",
      description:
        "Estado general de la comunidad del ensamble.",
    },
    {
      category: "attendance",
      title: "Asistencias",
      description:
        "Participación y puntualidad registradas.",
    },
    {
      category: "repertoire",
      title: "Repertorio",
      description:
        "Estado y disponibilidad de las obras.",
    },
    {
      category: "finances",
      title: "Finanzas",
      description:
        "Cargos, pagos y recuperación general.",
    },
    {
      category: "trips",
      title: "Viajes",
      description:
        "Actividad general de los viajes registrados.",
    },
  ];

  return definitions.map(
    (definition) => ({
      ...definition,
      metrics: metrics.filter(
        (metric) =>
          metric.category ===
          definition.category,
      ),
    }),
  );
}

function buildSummaryMetrics(
  summary: StatisticsReportSummary,
): ReportSummaryMetric[] {
  return [
    {
      id: "executive-members",
      label: "Integrantes activos",
      value: summary.activeMembers,
      description:
        `${summary.totalMembers} registros totales.`,
    },
    {
      id: "executive-attendance",
      label: "Asistencia general",
      value:
        `${summary.attendancePercentage.toFixed(
          2,
        )}%`,
      description:
        "Promedio del historial disponible.",
    },
    {
      id: "executive-repertoire",
      label: "Obras activas",
      value:
        summary.activeRepertoireWorks,
      description:
        `${summary.totalRepertoireWorks} obras registradas.`,
    },
    {
      id: "executive-recovery",
      label: "Recuperación financiera",
      value:
        `${summary.recoveryPercentage.toFixed(
          2,
        )}%`,
      description:
        formatCurrency(summary.totalPaid),
    },
    {
      id: "executive-trips",
      label: "Viajes activos",
      value: summary.activeTrips,
      description:
        `${summary.totalTrips} viajes registrados.`,
    },
  ];
}

function buildSections(
  metrics: StatisticsReportMetric[],
  summary: StatisticsReportSummary,
): ReportSection<StatisticsReportMetric>[] {
  return [
    {
      id: "statistics-executive-summary",
      title: "Resumen ejecutivo",
      description:
        "Indicadores generales de Vivace Suite.",
      metrics:
        buildSummaryMetrics(summary),
    },
    {
      id: "statistics-module-metrics",
      title: "Indicadores por módulo",
      description:
        "Concentrado general de métricas operativas.",
      rows: metrics,
    },
  ];
}

export async function getStatisticsReportData(): Promise<StatisticsReportData> {
  const [
    memberReport,
    attendanceReport,
    repertoireReport,
    financialStatistics,
    trips,
  ] = await Promise.all([
    getMemberReportData(),
    getAttendanceReportData(),
    getRepertoireReportData(),
    getFinancialStatistics(),
    getTrips(),
  ]);

  const summary:
  StatisticsReportSummary = {
    totalMembers:
      memberReport.summary.totalMembers,
    activeMembers:
      memberReport.summary.activeMembers,
    attendancePercentage:
      attendanceReport.summary
        .attendancePercentage,
    punctualityPercentage:
      attendanceReport.summary
        .punctualityPercentage,
    totalRepertoireWorks:
      repertoireReport.summary.totalWorks,
    activeRepertoireWorks:
      repertoireReport.summary.activeWorks,
    totalCharges:
      financialStatistics.totalCharges,
    totalPaid:
      financialStatistics.totalPaid,
    totalPending:
      financialStatistics.totalPending,
    recoveryPercentage:
      financialStatistics
        .recoveryPercentage,
    totalTrips: trips.length,
    activeTrips: trips.filter(
      (trip) =>
        trip.status === "active",
    ).length,
    completedTrips: trips.filter(
      (trip) =>
        trip.status === "completed",
    ).length,
  };

  const metrics =
    buildMetrics(summary);

  const modules =
    buildModules(metrics);

  const document:
  ReportDocument<StatisticsReportMetric> = {
    metadata:
      buildReportMetadata({
        reportId:
          "statistics-general-report",
        title:
          "Reporte estadístico general",
        category: "general",
      }),
    sections: buildSections(
      metrics,
      summary,
    ),
  };

  return {
    document,
    summary,
    modules,
    metrics,
  };
}