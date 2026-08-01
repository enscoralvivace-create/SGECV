"use client";

import {
  useRef,
  useState,
} from "react";

import ReportErrorState from "@/components/reports/common/ReportErrorState";
import ReportExportButton from "@/components/reports/common/ReportExportButton";
import ReportLoadingState from "@/components/reports/common/ReportLoadingState";
import ReportPageHeader from "@/components/reports/common/ReportPageHeader";
import ReportPrintHeader from "@/components/reports/common/ReportPrintHeader";
import ReportSummaryCards, {
  type ReportMetric,
} from "@/components/reports/common/ReportSummaryCards";

import useReportLoader from "@/hooks/useReportLoader";

import { exportStatisticsReportToPdf } from "@/services/reports/statistics/statisticsReportPdfService";
import { getStatisticsReportData } from "@/services/reports/statistics/statisticsReportService";

import type {
  StatisticsReportData,
  StatisticsReportMetric,
  StatisticsReportModuleSummary,
} from "@/types/statisticsReport";

import {
  formatReportCurrency,
} from "@/utils/reportFormatters";

export default function StatisticsReportPage() {
  const {
    data: reportData,
    isLoading,
    error,
  } = useReportLoader(
    getStatisticsReportData,
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

      await exportStatisticsReportToPdf({
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
        eyebrow="Resumen ejecutivo"
        title="Estadísticas generales"
        description="Consulta los principales indicadores operativos del Ensamble Coral Vivace en una sola vista."
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
        <ReportLoadingState message="Cargando estadísticas generales..." />
      ) : null}

      {!isLoading && error ? (
        <ReportErrorState message={error} />
      ) : null}

      {!isLoading &&
      !error &&
      reportData ? (
        <StatisticsReportContent
          reportData={reportData}
          reportRef={reportRef}
        />
      ) : null}
    </main>
  );
}

interface StatisticsReportContentProps {
  reportData: StatisticsReportData;
  reportRef:
    React.RefObject<HTMLDivElement | null>;
}

function StatisticsReportContent({
  reportData,
  reportRef,
}: StatisticsReportContentProps) {
  const {
    document,
    summary,
    modules,
  } = reportData;

  const executiveMetrics: ReportMetric[] = [
    {
      label: "Integrantes activos",
      value: summary.activeMembers,
      description:
        `${summary.totalMembers} integrantes registrados`,
    },
    {
      label: "Asistencia general",
      value:
        `${summary.attendancePercentage.toFixed(
          2,
        )}%`,
      description:
        "Presentes y retardos",
    },
    {
      label: "Obras activas",
      value:
        summary.activeRepertoireWorks,
      description:
        `${summary.totalRepertoireWorks} obras registradas`,
    },
    {
      label: "Recuperación financiera",
      value:
        `${summary.recoveryPercentage.toFixed(
          2,
        )}%`,
      description:
        formatReportCurrency(
          summary.totalPaid,
        ),
    },
  ];

  return (
    <div
      ref={reportRef}
      className="space-y-8 bg-slate-50"
    >
      <ReportPrintHeader
        organization="Ensamble Coral Vivace"
        reportTitle="Reporte estadístico general"
        subtitle="Resumen ejecutivo de Vivace Suite"
        generatedAt={
          document.metadata.generatedAt
        }
      />

      <ReportSummaryCards
        metrics={executiveMetrics}
        columns={4}
      />

      <section className="grid gap-6 xl:grid-cols-2">
        {modules.map((module) => (
          <ModuleStatisticsCard
            key={module.category}
            module={module}
          />
        ))}
      </section>

      <section className="rounded-2xl border border-emerald-200 bg-emerald-950 p-6 text-white shadow-sm">
        <div className="grid gap-6 md:grid-cols-3">
          <ExecutiveHighlight
            label="Saldo pendiente"
            value={formatReportCurrency(
              summary.totalPending,
            )}
            description="Importe aún no recuperado"
          />

          <ExecutiveHighlight
            label="Viajes activos"
            value={summary.activeTrips}
            description={`${summary.totalTrips} viajes registrados`}
          />

          <ExecutiveHighlight
            label="Viajes finalizados"
            value={summary.completedTrips}
            description="Viajes concluidos en el sistema"
          />
        </div>
      </section>
    </div>
  );
}

interface ModuleStatisticsCardProps {
  module: StatisticsReportModuleSummary;
}

function ModuleStatisticsCard({
  module,
}: ModuleStatisticsCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
          {getCategoryLabel(
            module.category,
          )}
        </p>

        <h2 className="mt-2 text-xl font-semibold text-slate-900">
          {module.title}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {module.description}
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {module.metrics.map((metric) => (
          <ModuleMetricCard
            key={metric.id}
            metric={metric}
          />
        ))}
      </div>
    </article>
  );
}

interface ModuleMetricCardProps {
  metric: StatisticsReportMetric;
}

function ModuleMetricCard({
  metric,
}: ModuleMetricCardProps) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-sm font-medium text-slate-500">
        {metric.label}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {metric.value}
      </p>

      <p className="mt-2 text-sm leading-5 text-slate-500">
        {metric.description}
      </p>
    </div>
  );
}

interface ExecutiveHighlightProps {
  label: string;
  value: string | number;
  description: string;
}

function ExecutiveHighlight({
  label,
  value,
  description,
}: ExecutiveHighlightProps) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/10 p-5">
      <p className="text-sm font-medium text-emerald-100">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>

      <p className="mt-2 text-sm text-emerald-100">
        {description}
      </p>
    </article>
  );
}

function getCategoryLabel(
  category:
    StatisticsReportModuleSummary["category"],
): string {
  const labels = {
    members: "Comunidad",
    attendance: "Participación",
    repertoire: "Actividad artística",
    finances: "Administración",
    trips: "Proyectos",
  } satisfies Record<
    StatisticsReportModuleSummary["category"],
    string
  >;

  return labels[category];
}
