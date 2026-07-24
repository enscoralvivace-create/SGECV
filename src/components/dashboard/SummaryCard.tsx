import type { ReactNode } from "react";

interface SummaryCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: ReactNode;
}

export default function SummaryCard({
  title,
  value,
  description,
  icon,
}: SummaryCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {value}
          </p>

          {description && (
            <p className="mt-2 text-sm text-slate-500">
              {description}
            </p>
          )}
        </div>

        <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
          {icon}
        </div>
      </div>
    </article>
  );
}