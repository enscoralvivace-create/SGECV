import type { ReactNode } from "react";

interface ReportPrintHeaderProps {
  organization: string;
  reportTitle: string;
  subtitle?: string;
  generatedAt: string;
  logoSrc?: string;
  rightContent?: ReactNode;
}

export default function ReportPrintHeader({
  organization,
  reportTitle,
  subtitle,
  generatedAt,
  logoSrc = "/images/logo.png",
  rightContent,
}: ReportPrintHeaderProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <img
            src={logoSrc}
            alt={organization}
            className="h-14 w-auto object-contain"
          />

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
              {organization}
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {reportTitle}
            </h2>

            {subtitle ? (
              <p className="mt-1 text-sm text-slate-500">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>

        <div className="text-left sm:text-right">
          {rightContent}

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

function formatGeneratedAt(
  value: string,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}