interface ReportTableCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function ReportTableCard({
  title,
  description,
  children,
  footer,
}: ReportTableCardProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-xl font-semibold text-slate-900">
          {title}
        </h2>

        {description ? (
          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        ) : null}
      </div>

      {children}

      {footer ? (
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
          {footer}
        </div>
      ) : null}
    </section>
  );
}