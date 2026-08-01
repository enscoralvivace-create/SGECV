import type {
  AttendanceReportFilters,
} from "@/types/attendanceReport";

interface AttendancePrintHeaderProps {
  generatedAt: string;
  filters: AttendanceReportFilters;
}

export default function AttendancePrintHeader({
  generatedAt,
  filters,
}: AttendancePrintHeaderProps) {
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
              Reporte general de asistencias
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {formatReportPeriod(filters)}
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