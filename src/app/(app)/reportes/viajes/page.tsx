"use client";

import {
  useRef,
  useState,
} from "react";

import EmptyReportState from "@/components/reports/common/EmptyReportState";
import ReportErrorState from "@/components/reports/common/ReportErrorState";
import ReportExportButton from "@/components/reports/common/ReportExportButton";
import ReportLoadingState from "@/components/reports/common/ReportLoadingState";
import ReportPageHeader from "@/components/reports/common/ReportPageHeader";
import ReportPrintHeader from "@/components/reports/common/ReportPrintHeader";
import ReportSummaryCards, {
  type ReportMetric,
} from "@/components/reports/common/ReportSummaryCards";
import ReportTableCard from "@/components/reports/common/ReportTableCard";

import useReportLoader from "@/hooks/useReportLoader";

import { exportTripReportToPdf } from "@/services/reports/trips/tripReportPdfService";
import { getTripReportData } from "@/services/reports/trips/tripReportService";

import type {
  TripReportBudgetRow,
  TripReportData,
  TripReportRow,
  TripReportStatusSummary,
} from "@/types/tripReport";

import type {
  TripStatus,
} from "@/types/trip";

import {
  formatReportCurrency,
  formatReportSignedCurrency,
} from "@/utils/reportFormatters";

export default function TripReportPage() {
  const {
    data: reportData,
    isLoading,
    error,
  } = useReportLoader(
    getTripReportData,
  );

  const [isExporting, setIsExporting] =
    useState(false);

  const [exportError, setExportError] =
    useState("");

  const reportRef =
    useRef<HTMLDivElement | null>(null);

  async function handleExportPdf(): Promise<void> {
    if (
      !reportRef.current ||
      !reportData
    ) {
      return;
    }

    try {
      setIsExporting(true);
      setExportError("");

      await exportTripReportToPdf({
        element: reportRef.current,
      });
    } catch (
      exportPdfError: unknown
    ) {
      console.error(exportPdfError);

      setExportError(
        exportPdfError instanceof Error
          ? exportPdfError.message
          : "No fue posible generar el archivo PDF.",
      );
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <main className="space-y-8">
      <ReportPageHeader
        eyebrow="Reporte de proyectos"
        title="Reporte general de viajes"
        description="Consulta participación, recuperación financiera, cobertura presupuestal y ejecución de gastos de los viajes registrados."
        actions={
          <ReportExportButton
            isLoading={isLoading}
            isExporting={isExporting}
            isDisabled={!reportData}
            onExport={() => {
              void handleExportPdf();
            }}
          />
        }
      />

      {exportError ? (
        <ReportErrorState
          title="No fue posible exportar el reporte"
          message={exportError}
        />
      ) : null}

      {isLoading ? (
        <ReportLoadingState message="Cargando reporte de viajes..." />
      ) : null}

      {!isLoading && error ? (
        <ReportErrorState message={error} />
      ) : null}

      {!isLoading &&
      !error &&
      reportData ? (
        <TripReportContent
          reportData={reportData}
          reportRef={reportRef}
        />
      ) : null}
    </main>
  );
}

interface TripReportContentProps {
  reportData: TripReportData;
  reportRef:
    React.RefObject<HTMLDivElement | null>;
}

function TripReportContent({
  reportData,
  reportRef,
}: TripReportContentProps) {
  const {
    document,
    summary,
    trips,
    budgets,
  } = reportData;

  const metrics: ReportMetric[] = [
    {
      label: "Viajes registrados",
      value: summary.totalTrips,
      description:
        `${summary.activeTrips} activos y ${summary.completedTrips} finalizados`,
    },
    {
      label: "Participaciones",
      value:
        summary.totalParticipants,
      description:
        "Participantes asociados a los viajes",
    },
    {
      label: "Total recaudado",
      value:
        formatReportCurrency(
          summary.totalPaid,
        ),
      description:
        `${summary.recoveryPercentage.toFixed(
          2,
        )}% de recuperación`,
    },
    {
      label: "Presupuesto acumulado",
      value:
        formatReportCurrency(
          summary.totalEstimatedBudget,
        ),
      description:
        `${summary.budgetCoveragePercentage.toFixed(
          2,
        )}% cubierto`,
    },
  ];

  return (
    <div
      ref={reportRef}
      className="space-y-8 bg-slate-50"
    >
      <ReportPrintHeader
        organization="Ensamble Coral Vivace"
        reportTitle="Reporte general de viajes"
        subtitle="Participación, finanzas y presupuesto"
        generatedAt={
          document.metadata.generatedAt
        }
      />

      <ReportSummaryCards
        metrics={metrics}
        columns={4}
      />

      <section className="grid gap-6 xl:grid-cols-2">
        <TripStatusDistribution
          rows={summary.statuses}
        />

        <TripFinancialOverview
          totalCharged={
            summary.totalCharged
          }
          totalPaid={
            summary.totalPaid
          }
          totalPending={
            summary.totalPending
          }
          recoveryPercentage={
            summary.recoveryPercentage
          }
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <SecondaryMetricCard
          label="Gasto estimado"
          value={formatReportCurrency(
            summary.totalEstimatedExpenses,
          )}
          description="Conceptos presupuestales registrados"
        />

        <SecondaryMetricCard
          label="Gasto real"
          value={formatReportCurrency(
            summary.totalActualExpenses,
          )}
          description={`${summary.budgetExecutionPercentage.toFixed(
            2,
          )}% de ejecución`}
        />

        <SecondaryMetricCard
          label="Variación presupuestal"
          value={formatReportSignedCurrency(
            summary.totalBudgetVariance,
          )}
          description={
            summary.totalBudgetVariance > 0
              ? "Gasto real superior al estimado"
              : summary.totalBudgetVariance < 0
                ? "Gasto real inferior al estimado"
                : "Sin variación registrada"
          }
        />
      </section>

      <ReportTableCard
        title="Consolidado por viaje"
        description={`${trips.length} ${
          trips.length === 1
            ? "viaje incluido"
            : "viajes incluidos"
        }.`}
      >
        <TripFinancialTable
          trips={trips}
        />
      </ReportTableCard>

      <ReportTableCard
        title="Ejecución presupuestal por viaje"
        description={`${budgets.length} ${
          budgets.length === 1
            ? "presupuesto incluido"
            : "presupuestos incluidos"
        }.`}
      >
        <TripBudgetTable
          budgets={budgets}
        />
      </ReportTableCard>
    </div>
  );
}

interface TripStatusDistributionProps {
  rows: TripReportStatusSummary[];
}

function TripStatusDistribution({
  rows,
}: TripStatusDistributionProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        Distribución por estado
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Situación actual de los viajes registrados.
      </p>

      <div className="mt-6 space-y-4">
        {rows.length === 0 ? (
          <EmptyReportState message="No hay viajes registrados para analizar." />
        ) : (
          rows.map((row) => (
            <div key={row.status}>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="font-medium text-slate-700">
                  {row.label}
                </span>

                <span className="text-slate-500">
                  {row.total} ·{" "}
                  {row.percentage.toFixed(2)}%
                </span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-700"
                  style={{
                    width: `${Math.min(
                      row.percentage,
                      100,
                    )}%`,
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </article>
  );
}

interface TripFinancialOverviewProps {
  totalCharged: number;
  totalPaid: number;
  totalPending: number;
  recoveryPercentage: number;
}

function TripFinancialOverview({
  totalCharged,
  totalPaid,
  totalPending,
  recoveryPercentage,
}: TripFinancialOverviewProps) {
  const rows = [
    {
      label: "Total cargado",
      value: formatReportCurrency(
        totalCharged,
      ),
    },
    {
      label: "Total pagado",
      value: formatReportCurrency(
        totalPaid,
      ),
    },
    {
      label: "Saldo pendiente",
      value: formatReportCurrency(
        totalPending,
      ),
    },
    {
      label: "Recuperación",
      value:
        `${recoveryPercentage.toFixed(
          2,
        )}%`,
    },
  ];

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        Concentrado financiero
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Cargos y pagos acumulados de todos los viajes.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4">
        {rows.map((row) => (
          <div
            key={row.label}
            className="rounded-xl bg-slate-50 p-4"
          >
            <p className="text-sm font-medium text-slate-500">
              {row.label}
            </p>

            <p className="mt-2 text-xl font-bold text-slate-900">
              {row.value}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}

interface SecondaryMetricCardProps {
  label: string;
  value: string;
  description: string;
}

function SecondaryMetricCard({
  label,
  value,
  description,
}: SecondaryMetricCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-2 text-sm text-slate-500">
        {description}
      </p>
    </article>
  );
}

interface TripFinancialTableProps {
  trips: TripReportRow[];
}

function TripFinancialTable({
  trips,
}: TripFinancialTableProps) {
  if (trips.length === 0) {
    return (
      <EmptyReportState
        title="No hay viajes registrados"
        message="El reporte se actualizará cuando existan viajes."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <TableHeader>
              Viaje
            </TableHeader>

            <TableHeader>
              Destino
            </TableHeader>

            <TableHeader>
              Estado
            </TableHeader>

            <TableHeader>
              Participantes
            </TableHeader>

            <TableHeader>
              Presupuesto
            </TableHeader>

            <TableHeader>
              Recaudado
            </TableHeader>

            <TableHeader>
              Pendiente
            </TableHeader>

            <TableHeader>
              Recuperación
            </TableHeader>

            <TableHeader>
              Cobertura
            </TableHeader>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 bg-white">
          {trips.map((trip) => (
            <tr
              key={trip.tripId}
              className="transition hover:bg-slate-50"
            >
              <TableCell className="font-semibold text-slate-900">
                {trip.tripName}
              </TableCell>

              <TableCell>
                {trip.destination}
              </TableCell>

              <TableCell>
                <TripStatusBadge
                  status={trip.status}
                />
              </TableCell>

              <TableCell>
                {trip.participantCount}
              </TableCell>

              <TableCell>
                {formatReportCurrency(
                  trip.estimatedBudget,
                )}
              </TableCell>

              <TableCell>
                {formatReportCurrency(
                  trip.totalPaid,
                )}
              </TableCell>

              <TableCell>
                {formatReportCurrency(
                  trip.totalPending,
                )}
              </TableCell>

              <TableCell className="font-semibold text-emerald-800">
                {trip.recoveryPercentage.toFixed(
                  2,
                )}
                %
              </TableCell>

              <TableCell className="font-semibold text-emerald-800">
                {trip.budgetCoveragePercentage.toFixed(
                  2,
                )}
                %
              </TableCell>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface TripBudgetTableProps {
  budgets: TripReportBudgetRow[];
}

function TripBudgetTable({
  budgets,
}: TripBudgetTableProps) {
  if (budgets.length === 0) {
    return (
      <EmptyReportState
        title="No hay presupuestos registrados"
        message="La información aparecerá cuando existan conceptos presupuestales."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <TableHeader>
              Viaje
            </TableHeader>

            <TableHeader>
              Conceptos
            </TableHeader>

            <TableHeader>
              Estimado
            </TableHeader>

            <TableHeader>
              Real
            </TableHeader>

            <TableHeader>
              Variación
            </TableHeader>

            <TableHeader>
              Ejecución
            </TableHeader>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 bg-white">
          {budgets.map((budget) => (
            <tr
              key={budget.tripId}
              className="transition hover:bg-slate-50"
            >
              <TableCell className="font-semibold text-slate-900">
                {budget.tripName}
              </TableCell>

              <TableCell>
                {budget.conceptCount}
              </TableCell>

              <TableCell>
                {formatReportCurrency(
                  budget.totalEstimated,
                )}
              </TableCell>

              <TableCell>
                {formatReportCurrency(
                  budget.totalActual,
                )}
              </TableCell>

              <TableCell
                className={
                  budget.variance > 0
                    ? "font-semibold text-rose-700"
                    : budget.variance < 0
                      ? "font-semibold text-emerald-800"
                      : ""
                }
              >
                {formatReportSignedCurrency(
                  budget.variance,
                )}
              </TableCell>

              <TableCell className="font-semibold text-emerald-800">
                {budget.executionPercentage.toFixed(
                  2,
                )}
                %
              </TableCell>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface TableHeaderProps {
  children: React.ReactNode;
}

function TableHeader({
  children,
}: TableHeaderProps) {
  return (
    <th
      scope="col"
      className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
    >
      {children}
    </th>
  );
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
}

function TableCell({
  children,
  className = "",
}: TableCellProps) {
  return (
    <td
      className={`whitespace-nowrap px-6 py-4 text-sm text-slate-600 ${className}`}
    >
      {children}
    </td>
  );
}

interface TripStatusBadgeProps {
  status: TripStatus;
}

function TripStatusBadge({
  status,
}: TripStatusBadgeProps) {
  const labels = {
    planning: "Planeación",
    active: "Activo",
    completed: "Finalizado",
    cancelled: "Cancelado",
  } satisfies Record<
    TripStatus,
    string
  >;

  const styles = {
    planning:
      "bg-sky-100 text-sky-800",
    active:
      "bg-emerald-100 text-emerald-800",
    completed:
      "bg-slate-200 text-slate-700",
    cancelled:
      "bg-rose-100 text-rose-800",
  } satisfies Record<
    TripStatus,
    string
  >;

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
