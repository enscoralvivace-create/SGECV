"use client";

import {
  forwardRef,
  useEffect,
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

import { exportMemberReportToPdf } from "@/services/reports/members/memberReportPdfService";
import { getMemberReportData } from "@/services/reports/members/memberReportService";

import type {
  MemberReportData,
  MemberReportRow,
} from "@/types/memberReport";

export default function MemberReportPage() {
  const [reportData, setReportData] =
    useState<MemberReportData | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isExporting, setIsExporting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [exportError, setExportError] =
    useState("");

  const reportRef =
    useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadReport(): Promise<void> {
      try {
        setIsLoading(true);
        setError("");

        const data =
          await getMemberReportData();

        if (isMounted) {
          setReportData(data);
        }
      } catch (loadError: unknown) {
        console.error(loadError);

        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "No fue posible cargar el reporte de integrantes.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadReport();

    return () => {
      isMounted = false;
    };
  }, []);

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

      await exportMemberReportToPdf({
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
        eyebrow="Reporte administrativo"
        title="Reporte de integrantes"
        description="Consulta el estado general de los integrantes, su distribución por voces y la información registrada en Vivace Suite."
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
        <ReportLoadingState message="Cargando reporte de integrantes..." />
      ) : null}

      {!isLoading && error ? (
        <ReportErrorState message={error} />
      ) : null}

      {!isLoading &&
      !error &&
      reportData ? (
        <MemberReportContent
          ref={reportRef}
          reportData={reportData}
        />
      ) : null}
    </main>
  );
}

interface MemberReportContentProps {
  reportData: MemberReportData;
}

const MemberReportContent = forwardRef<
  HTMLDivElement,
  MemberReportContentProps
>(function MemberReportContent(
  {
    reportData,
  },
  ref,
) {
  const {
    document,
    members,
    summary,
  } = reportData;

  const metrics: ReportMetric[] = [
    {
      label: "Integrantes registrados",
      value: summary.totalMembers,
      description:
        "Total incluido en el reporte",
    },
    {
      label: "Integrantes activos",
      value: summary.activeMembers,
      description: `${summary.activePercentage.toFixed(
        2,
      )}% del total`,
    },
    {
      label: "Permisos temporales",
      value:
        summary.temporaryLeaveMembers,
      description:
        "Integrantes con permiso",
    },
    {
      label: "Inactivos y bajas",
      value:
        summary.inactiveMembers +
        summary.permanentlyInactiveMembers,
      description:
        "Registros no activos",
    },
  ];

  return (
    <div
      ref={ref}
      className="space-y-8 bg-slate-50"
    >
      <ReportPrintHeader
        organization="Ensamble Coral Vivace"
        reportTitle="Reporte general de integrantes"
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
        <DistributionCard
          title="Distribución por voz o función"
          description="Integrantes agrupados por su participación dentro del ensamble."
          rows={summary.voices.map(
            (item) => ({
              label: item.voice,
              value: item.total,
              percentage:
                item.percentage,
            }),
          )}
        />

        <DistributionCard
          title="Distribución por estado"
          description="Situación administrativa actual de los integrantes registrados."
          rows={summary.statuses.map(
            (item) => ({
              label: item.status,
              value: item.total,
              percentage:
                item.percentage,
            }),
          )}
        />
      </section>

      <ReportTableCard
        title="Listado general"
        description={`${members.length} ${
          members.length === 1
            ? "integrante incluido"
            : "integrantes incluidos"
        }.`}
        footer={
          <p className="text-xs font-medium text-slate-500">
            Generado:{" "}
            {formatGeneratedAt(
              document.metadata.generatedAt,
            )}
          </p>
        }
      >
        <MemberReportTable
          members={members}
        />
      </ReportTableCard>
    </div>
  );
});

interface DistributionRow {
  label: string;
  value: number;
  percentage: number;
}

interface DistributionCardProps {
  title: string;
  description: string;
  rows: DistributionRow[];
}

function DistributionCard({
  title,
  description,
  rows,
}: DistributionCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        {title}
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        {description}
      </p>

      <div className="mt-6 space-y-4">
        {rows.length === 0 ? (
          <EmptyReportState message="El reporte se actualizará cuando existan registros." />
        ) : (
          rows.map((row) => (
            <div key={row.label}>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="font-medium text-slate-700">
                  {row.label}
                </span>

                <span className="text-slate-500">
                  {row.value} ·{" "}
                  {row.percentage.toFixed(
                    2,
                  )}
                  %
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

interface MemberReportTableProps {
  members: MemberReportRow[];
}

function MemberReportTable({
  members,
}: MemberReportTableProps) {
  if (members.length === 0) {
    return (
      <EmptyReportState
        title="No hay integrantes registrados"
        message="El reporte se actualizará cuando existan registros."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <TableHeader>
              Integrante
            </TableHeader>

            <TableHeader>
              Voz / función
            </TableHeader>

            <TableHeader>
              Estado
            </TableHeader>

            <TableHeader>
              Correo electrónico
            </TableHeader>

            <TableHeader>
              Teléfono
            </TableHeader>

            <TableHeader>
              Fecha de ingreso
            </TableHeader>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 bg-white">
          {members.map((member) => (
            <tr
              key={member.id}
              className="transition hover:bg-slate-50"
            >
              <TableCell className="font-semibold text-slate-900">
                {member.fullName}
              </TableCell>

              <TableCell>
                {member.voice}
              </TableCell>

              <TableCell>
                <StatusBadge
                  status={member.status}
                />
              </TableCell>

              <TableCell>
                {member.email}
              </TableCell>

              <TableCell>
                {member.phone}
              </TableCell>

              <TableCell>
                {member.joinDate}
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
  status: MemberReportRow["status"];
}

function StatusBadge({
  status,
}: StatusBadgeProps) {
  const styles = {
    Activo:
      "bg-emerald-100 text-emerald-800",
    "Permiso temporal":
      "bg-amber-100 text-amber-800",
    Inactivo:
      "bg-slate-200 text-slate-700",
    "Baja definitiva":
      "bg-rose-100 text-rose-800",
  } satisfies Record<
    MemberReportRow["status"],
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

function formatGeneratedAt(
  value: string,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "es-MX",
    {
      dateStyle: "long",
      timeStyle: "short",
    },
  ).format(date);
}