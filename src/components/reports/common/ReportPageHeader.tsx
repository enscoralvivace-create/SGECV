import Link from "next/link";

interface ReportPageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
}

export default function ReportPageHeader({
  eyebrow,
  title,
  description,
  backHref = "/reportes",
  backLabel = "Volver a Reportes",
  actions,
}: ReportPageHeaderProps) {
  return (
    <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <Link
          href={backHref}
          className="text-sm font-semibold text-emerald-800 transition hover:text-emerald-950"
        >
          ← {backLabel}
        </Link>

        <p className="mt-6 text-sm font-medium text-slate-500">
          {eyebrow}
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>

        <p className="mt-2 max-w-3xl text-slate-600">
          {description}
        </p>
      </div>

      {actions ? (
        <div className="flex flex-wrap items-center gap-3">
          {actions}
        </div>
      ) : null}
    </section>
  );
}