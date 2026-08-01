"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
} from "react";

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
    if (!reportRef.current || !reportData) {
      return;
    }

    try {
      setIsExporting(true);
      setExportError("");

      await exportMemberReportToPdf({
        element: reportRef.current,
      });
    } catch (exportPdfError: unknown) {
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
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link
            href="/reportes"
            className="text-sm font-semibold text-emerald-800 transition hover:text-emerald-950"
          >
            ← Volver a Reportes
          </Link>

          <p className="mt-6 text-sm font-medium text-slate-500">
            Reporte administrativo
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Reporte de integrantes
          </h1>

          <p className="mt-2 max-w-3xl text-slate-600">
            Consulta el estado general de los integrantes,
            su distribución por voces y la información
            registrada en Vivace Suite.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            void handleExportPdf();
          }}
          disabled={
            isLoading ||
            isExporting ||
            !reportData
          }
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <DownloadIcon />

          {isExporting
            ? "Generando PDF..."
            : "Exportar PDF"}
        </button>
      </section>

      {exportError && (
        <section className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4">
          <p className="text-sm font-medium text-rose-800">
            {exportError}
          </p>
        </section>
      )}

      {isLoading && (
        <LoadingState />
      )}

      {!isLoading && error && (
        <ErrorState message={error} />
      )}

      {!isLoading &&
        !error &&
        reportData && (
          <div
            ref={reportRef}
            className="space-y-8 bg-slate-50"
          >
            <ReportPrintHeader
              generatedAt={
                reportData.document.metadata.generatedAt
              }
            />

            <ReportContent
              reportData={reportData}
            />
          </div>
        )}
    </main>
  );
}

interface ReportPrintHeaderProps {
  generatedAt: string;
}

function ReportPrintHeader({
  generatedAt,
}: ReportPrintHeaderProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <img
            src="/images/logo.png"
            alt="Ensamble Coral Vivace"
            className="h-14 w-auto object-contain"
          />

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
              Ensamble Coral Vivace
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Reporte general de integrantes
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Vivace Suite
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Generado
          </p>

          <p className="mt-1 text-sm font-medium text-slate-700">
            {formatGeneratedAt(generatedAt)}
          </p>
        </div>
      </div>
    </section>
  );
}

interface ReportContentProps {
  reportData: MemberReportData;
}

function ReportContent({
  reportData,
}: ReportContentProps) {
  const {
    summary,
    members,
    document,
  } = reportData;

  return (
    <>
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Integrantes registrados"
          value={summary.totalMembers}
          description="Total incluido en el reporte"
        />

        <SummaryCard
          label="Integrantes activos"
          value={summary.activeMembers}
          description={`${summary.activePercentage.toFixed(
            2,
          )}% del total`}
        />

        <SummaryCard
          label="Permisos temporales"
          value={summary.temporaryLeaveMembers}
          description="Integrantes con permiso"
        />

        <SummaryCard
          label="Inactivos y bajas"
          value={
            summary.inactiveMembers +
            summary.permanentlyInactiveMembers
          }
          description="Registros no activos"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <DistributionCard
          title="Distribución por voz o función"
          description="Integrantes agrupados por su participación dentro del ensamble."
          rows={summary.voices.map(
            (item) => ({
              label: item.voice,
              value: item.total,
              percentage: item.percentage,
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
              percentage: item.percentage,
            }),
          )}
        />
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Listado general
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {members.length}{" "}
                {members.length === 1
                  ? "integrante incluido"
                  : "integrantes incluidos"}
                .
              </p>
            </div>

            <p className="text-xs font-medium text-slate-400">
              Generado:{" "}
              {formatGeneratedAt(
                document.metadata.generatedAt,
              )}
            </p>
          </div>
        </div>

        <MemberReportTable
          members={members}
        />
      </section>
    </>
  );
}

interface SummaryCardProps {
  label: string;
  value: number;
  description: string;
}

function SummaryCard({
  label,
  value,
  description,
}: SummaryCardProps) {
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
          <p className="text-sm text-slate-500">
            No hay información disponible.
          </p>
        ) : (
          rows.map((row) => (
            <div key={row.label}>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="font-medium text-slate-700">
                  {row.label}
                </span>

                <span className="text-slate-500">
                  {row.value} ·{" "}
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

interface MemberReportTableProps {
  members: MemberReportRow[];
}

function MemberReportTable({
  members,
}: MemberReportTableProps) {
  if (members.length === 0) {
    return (
      <div className="px-6 py-12 text-center">
        <p className="font-medium text-slate-700">
          No hay integrantes registrados.
        </p>

        <p className="mt-1 text-sm text-slate-500">
          El reporte se actualizará cuando existan registros.
        </p>
      </div>
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
              <TableCell
                className="font-semibold text-slate-900"
              >
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

function LoadingState() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-700" />

      <p className="mt-4 font-medium text-slate-700">
        Cargando reporte de integrantes...
      </p>
    </section>
  );
}

interface ErrorStateProps {
  message: string;
}

function ErrorState({
  message,
}: ErrorStateProps) {
  return (
    <section className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-8">
      <h2 className="font-semibold text-rose-900">
        No fue posible cargar el reporte
      </h2>

      <p className="mt-2 text-sm text-rose-700">
        {message}
      </p>
    </section>
  );
}

function DownloadIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
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