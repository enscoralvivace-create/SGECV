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

import { exportRepertoireReportToPdf } from "@/services/reports/repertoire/repertoireReportPdfService";
import { getRepertoireReportData } from "@/services/reports/repertoire/repertoireReportService";

import type {
  RepertoireComposerSummary,
  RepertoireReportData,
  RepertoireReportRow,
  RepertoireStatusSummary,
} from "@/types/repertoireReport";

export default function RepertoireReportPage() {
  const {
    data: reportData,
    isLoading,
    error,
  } = useReportLoader(
    getRepertoireReportData,
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

      await exportRepertoireReportToPdf({
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
        eyebrow="Reporte artístico"
        title="Reporte de repertorio"
        description="Consulta el estado general de las obras, su duración acumulada y la distribución por compositor."
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
        <ReportLoadingState message="Cargando reporte de repertorio..." />
      ) : null}

      {!isLoading && error ? (
        <ReportErrorState message={error} />
      ) : null}

      {!isLoading &&
      !error &&
      reportData ? (
        <RepertoireReportContent
          reportData={reportData}
          reportRef={reportRef}
        />
      ) : null}
    </main>
  );
}

interface RepertoireReportContentProps {
  reportData: RepertoireReportData;
  reportRef:
    React.RefObject<HTMLDivElement | null>;
}

function RepertoireReportContent({
  reportData,
  reportRef,
}: RepertoireReportContentProps) {
  const {
    document,
    summary,
    works,
  } = reportData;

  const metrics: ReportMetric[] = [
    {
      label: "Obras registradas",
      value: summary.totalWorks,
      description:
        "Total incluido en el reporte",
    },
    {
      label: "Obras activas",
      value: summary.activeWorks,
      description:
        "Disponibles para programación",
    },
    {
      label: "En estudio",
      value: summary.studyWorks,
      description:
        "Actualmente en preparación",
    },
    {
      label: "Duración acumulada",
      value:
        summary.formattedTotalDuration,
      description:
        "Suma de duraciones registradas",
    },
  ];

  return (
    <div
      ref={reportRef}
      className="space-y-8 bg-slate-50"
    >
      <ReportPrintHeader
        organization="Ensamble Coral Vivace"
        reportTitle="Reporte general de repertorio"
        subtitle="Vivace Suite"
        generatedAt={
          document.metadata.generatedAt
        }
      />

      <ReportSummaryCards
        metrics={metrics}
        columns={4}
      />

      <section className="grid gap-6 xl:grid-cols-2">
        <StatusDistributionCard
          rows={summary.statuses}
        />

        <ComposerDistributionCard
          rows={summary.composers}
        />
      </section>

      <section className="grid gap-5 sm:grid-cols-2">
        <SecondaryMetricCard
          label="Obras con duración"
          value={summary.worksWithDuration}
          description="Registros con duración estimada"
        />

        <SecondaryMetricCard
          label="Obras sin duración"
          value={summary.worksWithoutDuration}
          description="Registros pendientes de completar"
        />
      </section>

      <ReportTableCard
        title="Listado general de obras"
        description={`${works.length} ${
          works.length === 1
            ? "obra incluida"
            : "obras incluidas"
        }.`}
      >
        <RepertoireTable
          works={works}
        />
      </ReportTableCard>
    </div>
  );
}

interface StatusDistributionCardProps {
  rows: RepertoireStatusSummary[];
}

function StatusDistributionCard({
  rows,
}: StatusDistributionCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        Distribución por estado
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Situación actual de las obras registradas.
      </p>

      <div className="mt-6 space-y-4">
        {rows.length === 0 ? (
          <EmptyReportState message="No hay obras registradas para analizar." />
        ) : (
          rows.map((row) => (
            <DistributionRow
              key={row.status}
              label={row.status}
              value={row.total}
              percentage={row.percentage}
            />
          ))
        )}
      </div>
    </article>
  );
}

interface ComposerDistributionCardProps {
  rows: RepertoireComposerSummary[];
}

function ComposerDistributionCard({
  rows,
}: ComposerDistributionCardProps) {
  const visibleRows = rows.slice(0, 8);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        Obras por compositor
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Principales compositores representados en el repertorio.
      </p>

      <div className="mt-6 space-y-4">
        {visibleRows.length === 0 ? (
          <EmptyReportState message="No hay compositores registrados." />
        ) : (
          visibleRows.map((row) => (
            <DistributionRow
              key={row.composer}
              label={row.composer}
              value={row.totalWorks}
              percentage={row.percentage}
            />
          ))
        )}
      </div>
    </article>
  );
}

interface DistributionRowProps {
  label: string;
  value: number;
  percentage: number;
}

function DistributionRow({
  label,
  value,
  percentage,
}: DistributionRowProps) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="font-medium text-slate-700">
          {label}
        </span>

        <span className="text-slate-500">
          {value} ·{" "}
          {percentage.toFixed(2)}%
        </span>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-emerald-700"
          style={{
            width: `${Math.min(
              percentage,
              100,
            )}%`,
          }}
        />
      </div>
    </div>
  );
}

interface SecondaryMetricCardProps {
  label: string;
  value: number;
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

      <p className="mt-2 text-3xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-2 text-sm text-slate-500">
        {description}
      </p>
    </article>
  );
}

interface RepertoireTableProps {
  works: RepertoireReportRow[];
}

function RepertoireTable({
  works,
}: RepertoireTableProps) {
  if (works.length === 0) {
    return (
      <EmptyReportState
        title="No hay obras registradas"
        message="El reporte se actualizará cuando exista repertorio disponible."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <TableHeader>Obra</TableHeader>
            <TableHeader>Compositor</TableHeader>
            <TableHeader>Arreglista</TableHeader>
            <TableHeader>Tonalidad</TableHeader>
            <TableHeader>Duración</TableHeader>
            <TableHeader>Estado</TableHeader>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 bg-white">
          {works.map((work) => (
            <tr
              key={work.id}
              className="transition hover:bg-slate-50"
            >
              <TableCell className="font-semibold text-slate-900">
                {work.title}
              </TableCell>
              <TableCell>{work.composer}</TableCell>
              <TableCell>{work.arranger}</TableCell>
              <TableCell>{work.key}</TableCell>
              <TableCell>{work.formattedDuration}</TableCell>
              <TableCell>
                <StatusBadge status={work.status} />
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

interface StatusBadgeProps {
  status: RepertoireReportRow["status"];
}

function StatusBadge({
  status,
}: StatusBadgeProps) {
  const styles = {
    Activo:
      "bg-emerald-100 text-emerald-800",
    "En estudio":
      "bg-amber-100 text-amber-800",
    Archivado:
      "bg-slate-200 text-slate-700",
  } satisfies Record<
    RepertoireReportRow["status"],
    string
  >;

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}
