import {
  getTripFinancialSummary,
  getTrips,
} from "@/services/tripService";

import {
  calculateTripBudgetSummary,
  getTripBudgetItems,
} from "@/services/tripBudgetService";

import { buildReportMetadata } from "@/services/reportService";

import type {
  ReportColumn,
  ReportDocument,
  ReportSection,
  ReportSummaryMetric,
} from "@/types/report";

import type {
  Trip,
  TripStatus,
} from "@/types/trip";

import type {
  TripReportBudgetRow,
  TripReportData,
  TripReportRow,
  TripReportStatusSummary,
  TripReportSummary,
} from "@/types/tripReport";

const STATUS_ORDER: TripStatus[] = [
  "planning",
  "active",
  "completed",
  "cancelled",
];

const STATUS_LABELS: Record<
  TripStatus,
  string
> = {
  planning: "Planeación",
  active: "Activo",
  completed: "Finalizado",
  cancelled: "Cancelado",
};

const tripColumns:
ReportColumn<TripReportRow>[] = [
  {
    key: "tripName",
    header: "Viaje",
    align: "left",
  },
  {
    key: "destination",
    header: "Destino",
    align: "left",
  },
  {
    key: "status",
    header: "Estado",
    align: "center",
    format: (value) =>
      STATUS_LABELS[
        value as TripStatus
      ] ?? String(value ?? ""),
  },
  {
    key: "participantCount",
    header: "Participantes",
    align: "center",
  },
  {
    key: "estimatedBudget",
    header: "Presupuesto",
    align: "right",
    format: (value) =>
      formatCurrency(
        Number(value ?? 0),
      ),
  },
  {
    key: "totalPaid",
    header: "Recaudado",
    align: "right",
    format: (value) =>
      formatCurrency(
        Number(value ?? 0),
      ),
  },
  {
    key: "totalPending",
    header: "Pendiente",
    align: "right",
    format: (value) =>
      formatCurrency(
        Number(value ?? 0),
      ),
  },
  {
    key: "recoveryPercentage",
    header: "Recuperación",
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

function countTripsByStatus(
  trips: Trip[],
  status: TripStatus,
): number {
  return trips.filter(
    (trip) => trip.status === status,
  ).length;
}

function buildStatusSummary(
  trips: Trip[],
): TripReportStatusSummary[] {
  return STATUS_ORDER.map(
    (status) => {
      const total =
        countTripsByStatus(
          trips,
          status,
        );

      return {
        status,
        label:
          STATUS_LABELS[status],
        total,
        percentage:
          calculatePercentage(
            total,
            trips.length,
          ),
      };
    },
  );
}

async function buildTripRows(
  trips: Trip[],
): Promise<{
  trips: TripReportRow[];
  budgets: TripReportBudgetRow[];
}> {
  const rows = await Promise.all(
    trips.map(
      async (trip) => {
        const [
          financialSummary,
          budgetItems,
        ] = await Promise.all([
          getTripFinancialSummary(
            trip.id,
          ),
          getTripBudgetItems(
            trip.id,
          ),
        ]);

        const budgetSummary =
          calculateTripBudgetSummary(
            budgetItems,
          );

        const participantIds =
          new Set(
            financialSummary.members.map(
              (member) =>
                member.memberId,
            ),
          );

        const estimatedBudget =
          Number(
            trip.estimated_budget ??
              financialSummary.estimatedBudget ??
              0,
          );

        const tripRow:
        TripReportRow = {
          tripId: trip.id,
          tripName: trip.name,
          destination:
            trip.destination,
          status: trip.status,
          participantCount:
            participantIds.size,
          estimatedBudget,
          totalCharged:
            financialSummary.totalCharged,
          totalPaid:
            financialSummary.totalPaid,
          totalPending:
            financialSummary.totalPending,
          recoveryPercentage:
            financialSummary
              .recoveryPercentage,
          budgetCoveragePercentage:
            calculatePercentage(
              financialSummary.totalPaid,
              estimatedBudget,
            ),
        };

        const budgetRow:
        TripReportBudgetRow = {
          tripId: trip.id,
          tripName: trip.name,
          totalEstimated:
            budgetSummary.totalEstimated,
          totalActual:
            budgetSummary.totalActual,
          variance:
            budgetSummary.variance,
          executionPercentage:
            budgetSummary
              .executionPercentage,
          conceptCount:
            budgetItems.length,
        };

        return {
          tripRow,
          budgetRow,
        };
      },
    ),
  );

  return {
    trips: rows.map(
      (row) => row.tripRow,
    ),
    budgets: rows.map(
      (row) => row.budgetRow,
    ),
  };
}

function buildSummary(
  sourceTrips: Trip[],
  trips: TripReportRow[],
  budgets: TripReportBudgetRow[],
): TripReportSummary {
  const totalEstimatedBudget =
    trips.reduce(
      (total, trip) =>
        total +
        trip.estimatedBudget,
      0,
    );

  const totalCharged =
    trips.reduce(
      (total, trip) =>
        total +
        trip.totalCharged,
      0,
    );

  const totalPaid =
    trips.reduce(
      (total, trip) =>
        total +
        trip.totalPaid,
      0,
    );

  const totalPending =
    trips.reduce(
      (total, trip) =>
        total +
        trip.totalPending,
      0,
    );

  const totalEstimatedExpenses =
    budgets.reduce(
      (total, budget) =>
        total +
        budget.totalEstimated,
      0,
    );

  const totalActualExpenses =
    budgets.reduce(
      (total, budget) =>
        total +
        budget.totalActual,
      0,
    );

  return {
    totalTrips:
      sourceTrips.length,
    planningTrips:
      countTripsByStatus(
        sourceTrips,
        "planning",
      ),
    activeTrips:
      countTripsByStatus(
        sourceTrips,
        "active",
      ),
    completedTrips:
      countTripsByStatus(
        sourceTrips,
        "completed",
      ),
    cancelledTrips:
      countTripsByStatus(
        sourceTrips,
        "cancelled",
      ),
    totalParticipants:
      trips.reduce(
        (total, trip) =>
          total +
          trip.participantCount,
        0,
      ),
    totalEstimatedBudget,
    totalCharged,
    totalPaid,
    totalPending,
    recoveryPercentage:
      calculatePercentage(
        totalPaid,
        totalCharged,
      ),
    budgetCoveragePercentage:
      calculatePercentage(
        totalPaid,
        totalEstimatedBudget,
      ),
    totalEstimatedExpenses,
    totalActualExpenses,
    totalBudgetVariance:
      totalActualExpenses -
      totalEstimatedExpenses,
    budgetExecutionPercentage:
      calculatePercentage(
        totalActualExpenses,
        totalEstimatedExpenses,
      ),
    statuses:
      buildStatusSummary(
        sourceTrips,
      ),
  };
}

function buildSummaryMetrics(
  summary: TripReportSummary,
): ReportSummaryMetric[] {
  return [
    {
      id: "trips-total",
      label: "Viajes registrados",
      value: summary.totalTrips,
      description:
        `${summary.activeTrips} viajes activos.`,
    },
    {
      id: "trips-participants",
      label: "Participaciones acumuladas",
      value:
        summary.totalParticipants,
      description:
        "Participantes asociados mediante cargos de viaje.",
    },
    {
      id: "trips-paid",
      label: "Total recaudado",
      value:
        formatCurrency(
          summary.totalPaid,
        ),
      description:
        `${summary.recoveryPercentage.toFixed(
          2,
        )}% de recuperación.`,
    },
    {
      id: "trips-budget",
      label: "Presupuesto acumulado",
      value:
        formatCurrency(
          summary.totalEstimatedBudget,
        ),
      description:
        `${summary.budgetCoveragePercentage.toFixed(
          2,
        )}% cubierto.`,
    },
  ];
}

function buildSections(
  trips: TripReportRow[],
  summary: TripReportSummary,
): ReportSection<TripReportRow>[] {
  return [
    {
      id: "trips-summary",
      title: "Resumen general",
      description:
        "Indicadores principales de los viajes registrados.",
      metrics:
        buildSummaryMetrics(summary),
    },
    {
      id: "trips-list",
      title: "Consolidado por viaje",
      description:
        "Participación, presupuesto y recuperación financiera.",
      columns: tripColumns,
      rows: trips,
    },
  ];
}

export async function getTripReportData(): Promise<TripReportData> {
  const sourceTrips =
    await getTrips();

  const {
    trips,
    budgets,
  } = await buildTripRows(
    sourceTrips,
  );

  const summary =
    buildSummary(
      sourceTrips,
      trips,
      budgets,
    );

  const document:
  ReportDocument<TripReportRow> = {
    metadata:
      buildReportMetadata({
        reportId:
          "trips-general-report",
        title:
          "Reporte general de viajes",
        category: "trips",
      }),
    sections:
      buildSections(
        trips,
        summary,
      ),
  };

  return {
    document,
    summary,
    trips,
    budgets,
  };
}