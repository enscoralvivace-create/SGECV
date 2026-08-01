import type {
  AttendanceStatusSummary,
} from "@/types/attendanceReport";

interface AttendanceStatusDistributionProps {
  rows: AttendanceStatusSummary[];
}

export default function AttendanceStatusDistribution({
  rows,
}: AttendanceStatusDistributionProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        Distribución por estado
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Proporción de registros de asistencia por resultado.
      </p>

      <div className="mt-6 space-y-4">
        {rows.length === 0 ? (
          <p className="text-sm text-slate-500">
            No hay información disponible.
          </p>
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