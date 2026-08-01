"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
} from "react";

import AttendanceExportButton from "@/components/reports/attendance/AttendanceExportButton";
import AttendanceFilterPanel, {
  type AttendanceDateFilterState,
} from "@/components/reports/attendance/AttendanceFilterPanel";
import AttendanceMemberTable from "@/components/reports/attendance/AttendanceMemberTable";
import AttendanceOverviewCard from "@/components/reports/attendance/AttendanceOverviewCard";
import AttendancePrintHeader from "@/components/reports/attendance/AttendancePrintHeader";
import AttendanceSessionTable from "@/components/reports/attendance/AttendanceSessionTable";
import AttendanceStatusDistribution from "@/components/reports/attendance/AttendanceStatusDistribution";
import AttendanceSummaryCards from "@/components/reports/attendance/AttendanceSummaryCards";

import { exportAttendanceReportToPdf } from "@/services/reports/attendance/attendanceReportPdfService";
import { getAttendanceReportData } from "@/services/reports/attendance/attendanceReportService";

import type {
  AttendanceReportData,
  AttendanceReportFilters,
} from "@/types/attendanceReport";

const EMPTY_FILTERS: AttendanceDateFilterState = {
  startDate: "",
  endDate: "",
};

export default function AttendanceReportPage() {
  const [reportData, setReportData] =
    useState<AttendanceReportData | null>(null);

  const [filters, setFilters] =
    useState<AttendanceDateFilterState>(
      EMPTY_FILTERS,
    );

  const [appliedFilters, setAppliedFilters] =
    useState<AttendanceDateFilterState>(
      EMPTY_FILTERS,
    );

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
          await getAttendanceReportData(
            toServiceFilters(
              appliedFilters,
            ),
          );

        if (isMounted) {
          setReportData(data);
        }
      } catch (loadError: unknown) {
        console.error(loadError);

        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "No fue posible cargar el reporte de asistencias.",
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
  }, [appliedFilters]);

  function handleFilterChange(
    field: keyof AttendanceDateFilterState,
    value: string,
  ): void {
    setFilters((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleApplyFilters(): void {
    if (
      filters.startDate &&
      filters.endDate &&
      filters.startDate >
        filters.endDate
    ) {
      setError(
        "La fecha inicial no puede ser posterior a la fecha final.",
      );

      return;
    }

    setError("");
    setAppliedFilters(filters);
  }

  function handleClearFilters(): void {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setError("");
  }

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

      await exportAttendanceReportToPdf({
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
            Reporte de asistencias
          </h1>

          <p className="mt-2 max-w-3xl text-slate-600">
            Analiza la participación del ensamble,
            la puntualidad y las incidencias registradas
            durante el periodo seleccionado.
          </p>
        </div>

        <AttendanceExportButton
          isLoading={isLoading}
          isExporting={isExporting}
          isDisabled={!reportData}
          onExport={() => {
            void handleExportPdf();
          }}
        />
      </section>

      <AttendanceFilterPanel
        filters={filters}
        isLoading={isLoading}
        onChange={handleFilterChange}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />

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

      {!isLoading &&
        error && (
          <ErrorState
            message={error}
          />
        )}

      {!isLoading &&
        !error &&
        reportData && (
          <div
            ref={reportRef}
            className="space-y-8 bg-slate-50"
          >
            <AttendancePrintHeader
              generatedAt={
                reportData.document
                  .metadata.generatedAt
              }
              filters={
                reportData.filters
              }
            />

            <AttendanceSummaryCards
              summary={
                reportData.summary
              }
            />

            <section className="grid gap-6 xl:grid-cols-2">
              <AttendanceStatusDistribution
                rows={
                  reportData.summary
                    .statuses
                }
              />

              <AttendanceOverviewCard
                presentCount={
                  reportData.summary
                    .presentCount
                }
                lateCount={
                  reportData.summary
                    .lateCount
                }
                justifiedCount={
                  reportData.summary
                    .justifiedCount
                }
                absentCount={
                  reportData.summary
                    .absentCount
                }
                totalRecords={
                  reportData.summary
                    .totalRecords
                }
              />
            </section>

            <AttendanceMemberTable
              members={
                reportData.members
              }
            />

            <AttendanceSessionTable
              sessions={
                reportData.sessions
              }
            />
          </div>
        )}
    </main>
  );
}

function LoadingState() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-700" />

      <p className="mt-4 font-medium text-slate-700">
        Cargando reporte de asistencias...
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

function toServiceFilters(
  filters: AttendanceDateFilterState,
): AttendanceReportFilters {
  return {
    startDate:
      filters.startDate || null,
    endDate:
      filters.endDate || null,
  };
}