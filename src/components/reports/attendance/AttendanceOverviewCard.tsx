interface AttendanceOverviewCardProps {
  presentCount: number;
  lateCount: number;
  justifiedCount: number;
  absentCount: number;
  totalRecords: number;
}

export default function AttendanceOverviewCard({
  presentCount,
  lateCount,
  justifiedCount,
  absentCount,
  totalRecords,
}: AttendanceOverviewCardProps) {
  const items = [
    {
      label: "Presentes",
      value: presentCount,
    },
    {
      label: "Retardos",
      value: lateCount,
    },
    {
      label: "Justificadas",
      value: justifiedCount,
    },
    {
      label: "Faltas",
      value: absentCount,
    },
  ];

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        Concentrado de registros
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Total de incidencias incluidas en el reporte.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-xl bg-slate-50 p-4"
          >
            <p className="text-sm font-medium text-slate-500">
              {item.label}
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
        <p className="text-sm text-emerald-900">
          Total de registros:{" "}
          <strong>{totalRecords}</strong>
        </p>
      </div>
    </article>
  );
}