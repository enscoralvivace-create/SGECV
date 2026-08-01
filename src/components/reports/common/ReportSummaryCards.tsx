interface ReportMetric {
  label: string;
  value: string | number;
  description: string;
}

interface ReportSummaryCardsProps {
  metrics: ReportMetric[];
  columns?: 2 | 3 | 4;
}

export default function ReportSummaryCards({
  metrics,
  columns = 4,
}: ReportSummaryCardsProps) {
  const gridClass = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 xl:grid-cols-3",
    4: "sm:grid-cols-2 xl:grid-cols-4",
  }[columns];

  return (
    <section className={`grid gap-5 ${gridClass}`}>
      {metrics.map((metric) => (
        <article
          key={metric.label}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <p className="text-sm font-medium text-slate-500">
            {metric.label}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {metric.value}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            {metric.description}
          </p>
        </article>
      ))}
    </section>
  );
}

export type { ReportMetric };