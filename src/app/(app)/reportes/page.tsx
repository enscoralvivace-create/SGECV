import Link from "next/link";

interface ReportCategory {
  title: string;
  description: string;
  href?: string;
  status: "available" | "planned";
  icon: ReportIconName;
  features: string[];
}

type ReportIconName =
  | "members"
  | "attendance"
  | "repertoire"
  | "finances"
  | "trips"
  | "statistics";

const reportCategories: ReportCategory[] = [
  {
    title: "Integrantes",
    description:
      "Consulta información general, distribución por voces y estado de los integrantes.",
    href: "/reportes/integrantes",
    status: "available",
    icon: "members",
    features: [
      "Listado general",
      "Distribución por voces",
      "Integrantes activos e inactivos",
    ],
  },
  {
    title: "Asistencias",
    description:
      "Analiza la participación del ensamble por integrante, ensayo y periodo.",
    status: "planned",
    icon: "attendance",
    features: [
      "Asistencia por periodo",
      "Puntualidad e incidencias",
      "Comparativa por integrante",
    ],
  },
  {
    title: "Repertorio",
    description:
      "Obtén una visión general de las obras registradas y su estado de preparación.",
    status: "planned",
    icon: "repertoire",
    features: [
      "Obras activas",
      "Repertorio en estudio",
      "Duración y distribución",
    ],
  },
  {
    title: "Finanzas",
    description:
      "Revisa cargos, pagos, saldos pendientes e ingresos registrados.",
    status: "planned",
    icon: "finances",
    features: [
      "Ingresos por periodo",
      "Cargos y pagos",
      "Saldos pendientes",
    ],
  },
  {
    title: "Viajes",
    description:
      "Accede a los reportes financieros profesionales de cada viaje registrado.",
    href: "/viajes",
    status: "available",
    icon: "trips",
    features: [
      "Presupuesto estimado",
      "Recuperación financiera",
      "Exportación profesional en PDF",
    ],
  },
  {
    title: "Estadísticas generales",
    description:
      "Visualiza indicadores globales sobre la actividad y evolución del ensamble.",
    status: "planned",
    icon: "statistics",
    features: [
      "Indicadores generales",
      "Tendencias históricas",
      "Resumen ejecutivo",
    ],
  },
];

export default function ReportsPage() {
  const availableReports = reportCategories.filter(
    (report) => report.status === "available",
  ).length;

  const plannedReports = reportCategories.filter(
    (report) => report.status === "planned",
  ).length;

  return (
    <main className="space-y-8">
      <section>
        <p className="text-sm font-medium text-slate-500">
          Análisis y exportación
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Reportes
        </h1>

        <p className="mt-2 max-w-3xl text-slate-600">
          Consulta, analiza y exporta la información más
          importante del Ensamble Coral Vivace desde un solo
          lugar.
        </p>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          title="Categorías"
          value={reportCategories.length}
          description="Áreas disponibles para análisis"
          icon="categories"
        />

        <SummaryCard
          title="Reportes disponibles"
          value={availableReports}
          description="Reportes listos para consultar"
          icon="available"
        />

        <SummaryCard
          title="En desarrollo"
          value={plannedReports}
          description="Nuevos reportes planificados"
          icon="development"
        />
      </section>

      <section>
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-slate-900">
            Centro de reportes
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Selecciona una categoría para consultar sus
            herramientas de análisis.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {reportCategories.map((report) => (
            <ReportCard
              key={report.title}
              report={report}
            />
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-950 text-white shadow-sm">
        <div className="grid gap-8 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-emerald-100">
              <ReportIcon name="statistics" />
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              Plataforma de análisis en crecimiento
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-emerald-100">
              El módulo de Reportes se ampliará progresivamente
              con filtros por periodo, indicadores comparativos,
              gráficas y exportaciones profesionales en PDF.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 px-6 py-5 text-center backdrop-blur-sm">
            <p className="text-3xl font-bold">
              {reportCategories.length}
            </p>

            <p className="mt-1 text-sm font-medium text-emerald-100">
              categorías planificadas
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

interface ReportCardProps {
  report: ReportCategory;
}

function ReportCard({
  report,
}: ReportCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
          <ReportIcon name={report.icon} />
        </div>

        <ReportStatusBadge status={report.status} />
      </div>

      <div className="mt-5">
        <h3 className="text-lg font-semibold text-slate-900">
          {report.title}
        </h3>

        <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">
          {report.description}
        </p>
      </div>

      <ul className="mt-5 space-y-2">
        {report.features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2 text-sm text-slate-600"
          >
            <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckIcon />
            </span>

            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 border-t border-slate-100 pt-5">
        {report.status === "available" ? (
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800">
            Consultar reporte
            <ArrowRightIcon />
          </span>
        ) : (
          <span className="text-sm font-medium text-slate-400">
            Disponible próximamente
          </span>
        )}
      </div>
    </>
  );

  const className =
    "flex h-full flex-col rounded-2xl border bg-white p-6 shadow-sm transition";

  if (report.status === "available" && report.href) {
    return (
      <Link
        href={report.href}
        className={`${className} border-slate-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md`}
      >
        {content}
      </Link>
    );
  }

  return (
    <article
      className={`${className} border-slate-200`}
    >
      {content}
    </article>
  );
}

interface ReportStatusBadgeProps {
  status: ReportCategory["status"];
}

function ReportStatusBadge({
  status,
}: ReportStatusBadgeProps) {
  if (status === "available") {
    return (
      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
        Disponible
      </span>
    );
  }

  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
      Próximamente
    </span>
  );
}

interface SummaryCardProps {
  title: string;
  value: number;
  description: string;
  icon:
    | "categories"
    | "available"
    | "development";
}

function SummaryCard({
  title,
  value,
  description,
  icon,
}: SummaryCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {value}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
          <SummaryIcon name={icon} />
        </div>
      </div>
    </article>
  );
}

interface ReportIconProps {
  name: ReportIconName;
}

function ReportIcon({
  name,
}: ReportIconProps) {
  const commonProps = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "members") {
    return (
      <svg {...commonProps}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }

  if (name === "attendance") {
    return (
      <svg {...commonProps}>
        <rect
          x="3"
          y="4"
          width="18"
          height="17"
          rx="2"
        />
        <path d="M16 2v4M8 2v4M3 10h18" />
        <path d="m8 15 2 2 5-5" />
      </svg>
    );
  }

  if (name === "repertoire") {
    return (
      <svg {...commonProps}>
        <path d="M9 18V5l11-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="17" cy="16" r="3" />
      </svg>
    );
  }

  if (name === "finances") {
    return (
      <svg {...commonProps}>
        <rect
          x="2"
          y="5"
          width="20"
          height="14"
          rx="2"
        />
        <path d="M2 10h20" />
        <path d="M7 15h2" />
      </svg>
    );
  }

  if (name === "trips") {
    return (
      <svg {...commonProps}>
        <path d="M3 11h18" />
        <path d="m5 11 2-6h10l2 6" />
        <path d="M5 11v7h14v-7" />
        <path d="M9 18v-4h6v4" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="M4 19V9" />
      <path d="M10 19V5" />
      <path d="M16 19v-7" />
      <path d="M22 19V3" />
      <path d="M2 19h22" />
    </svg>
  );
}

interface SummaryIconProps {
  name:
    | "categories"
    | "available"
    | "development";
}

function SummaryIcon({
  name,
}: SummaryIconProps) {
  const commonProps = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "categories") {
    return (
      <svg {...commonProps}>
        <rect
          x="3"
          y="3"
          width="7"
          height="7"
          rx="1"
        />
        <rect
          x="14"
          y="3"
          width="7"
          height="7"
          rx="1"
        />
        <rect
          x="3"
          y="14"
          width="7"
          height="7"
          rx="1"
        />
        <rect
          x="14"
          y="14"
          width="7"
          height="7"
          rx="1"
        />
      </svg>
    );
  }

  if (name === "available") {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 2.5 2.5L16 9" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="M12 2v4" />
      <path d="M12 18v4" />
      <path d="m4.93 4.93 2.83 2.83" />
      <path d="m16.24 16.24 2.83 2.83" />
      <path d="M2 12h4" />
      <path d="M18 12h4" />
      <path d="m4.93 19.07 2.83-2.83" />
      <path d="m16.24 7.76 2.83-2.83" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}