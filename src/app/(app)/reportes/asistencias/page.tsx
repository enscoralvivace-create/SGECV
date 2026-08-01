"use client";

import {
  useEffect,
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

import AttendanceFilterPanel, {
  type AttendanceDateFilterState,
} from "@/components/reports/attendance/AttendanceFilterPanel";
import AttendanceMemberTable from "@/components/reports/attendance/AttendanceMemberTable";
import AttendanceOverviewCard from "@/components/reports/attendance/AttendanceOverviewCard";
import AttendanceSessionTable from "@/components/reports/attendance/AttendanceSessionTable";
import AttendanceStatusDistribution from "@/components/reports/attendance/AttendanceStatusDistribution";

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
      <ReportPageHeader
        eyebrow="Reporte administrativo"
        title="Reporte de asistencias"
        description="Analiza la participación del ensamble, la puntualidad y las incidencias registradas durante el periodo seleccionado."
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

      <AttendanceFilterPanel
        filters={filters}
        isLoading={isLoading}
        onChange={handleFilterChange}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />

      {exportError ? (
        <ReportErrorState
          title="No fue posible exportar el reporte"
          message={exportError}
        />
      ) : null}

      {isLoading ? (
        <ReportLoadingState message="Cargando reporte de asistencias..." />
      ) : null}

      {!isLoading && error ? (
        <ReportErrorState message={error} />
      ) : null}

      {!isLoading &&
      !error &&
      reportData ? (
        <AttendanceReportContent
          reportData={reportData}
          reportRef={reportRef}
        />
      ) : null}
    </main>
  );
}

interface AttendanceReportContentProps {
  reportData: AttendanceReportData;
  reportRef:
    React.RefObject<HTMLDivElement | null>;
}

function AttendanceReportContent({
  reportData,
  reportRef,
}: AttendanceReportContentProps) {
  const metrics: ReportMetric[] = [
    {
      label: "Sesiones registradas",
      value:
        reportData.summary.totalSessions,
      description:
        "Incluidas en el periodo",
    },
    {
      label: "Asistencia general",
      value: `${reportData.summary.attendancePercentage.toFixed(
        2,
      )}%`,
      description:
        "Presentes y retardos",
    },
    {
      label: "Puntualidad",
      value: `${reportData.summary.punctualityPercentage.toFixed(
        2,
      )}%`,
      description:
        "Presentes entre quienes asistieron",
    },
    {
      label: "Faltas registradas",
      value:
        reportData.summary.absentCount,
      description:
        "Faltas no justificadas",
    },
  ];

  return (
    <div
      ref={reportRef}
      className="space-y-8 bg-slate-50"
    >
      <ReportPrintHeader
        organization="Ensamble Coral Vivace"
        reportTitle="Reporte general de asistencias"
        subtitle={formatReportPeriod(
          reportData.filters,
        )}
        generatedAt={
          reportData.document.metadata.generatedAt
        }
      />

      <ReportSummaryCards
        metrics={metrics}
        columns={4}
      />

      <section className="grid gap-6 xl:grid-cols-2">
        <AttendanceStatusDistribution
          rows={
            reportData.summary.statuses
          }
        />

        <AttendanceOverviewCard
          presentCount={
            reportData.summary.presentCount
          }
          lateCount={
            reportData.summary.lateCount
          }
          justifiedCount={
            reportData.summary.justifiedCount
          }
          absentCount={
            reportData.summary.absentCount
          }
          totalRecords={
            reportData.summary.totalRecords
          }
        />
      </section>

      <AttendanceMemberTable
        members={reportData.members}
      />

      <AttendanceSessionTable
        sessions={reportData.sessions}
      />
    </div>
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

function formatReportPeriod(
  filters: AttendanceReportFilters,
): string {
  if (
    !filters.startDate &&
    !filters.endDate
  ) {
    return "Historial completo";
  }

  if (
    filters.startDate &&
    filters.endDate
  ) {
    return `Del ${formatDateValue(
      filters.startDate,
    )} al ${formatDateValue(
      filters.endDate,
    )}`;
  }

  if (filters.startDate) {
    return `Desde ${formatDateValue(
      filters.startDate,
    )}`;
  }

  return `Hasta ${formatDateValue(
    filters.endDate ?? "",
  )}`;
}

function formatDateValue(
  value: string,
): string {
  const date = new Date(
    `${value}T00:00:00`,
  );

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