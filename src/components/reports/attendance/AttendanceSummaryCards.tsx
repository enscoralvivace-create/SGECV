import type {
  AttendanceReportSummary,
} from "@/types/attendanceReport";

interface AttendanceSummaryCardsProps {
  summary: AttendanceReportSummary;
}

export default function AttendanceSummaryCards({
  summary,
}: AttendanceSummaryCardsProps) {
  return (
    <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        label="Sesiones registradas"
        value={summary.totalSessions}
        description="Incluidas en el periodo"
      />

      <SummaryCard
        label="Asistencia general"
        value={`${summary.attendancePercentage.toFixed(
          2,
        )}%`}
        description="Presentes y retardos"
      />

      <SummaryCard
        label="Puntualidad"
        value={`${summary.punctualityPercentage.toFixed(
          2,
        )}%`}
        description="Presentes entre quienes asistieron"
      />

      <SummaryCard
        label="Faltas registradas"
        value={summary.absentCount}
        description="Faltas no justificadas"
      />
    </section>
  );
}

interface SummaryCardProps {
  label: string;
  value: string | number;
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