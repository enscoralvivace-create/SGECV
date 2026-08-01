"use client";

import {
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

import VivaceCard from "@/components/ui/VivaceCard";

import type {
  MemberAttendanceStats,
} from "@/types/memberAttendanceStats";

interface MemberAttendanceStatsSummaryProps {
  stats: MemberAttendanceStats;
  className?: string;
}

interface MetricCardProps {
  label: string;
  value: string | number;
  description: string;
  icon: typeof CalendarCheck2;
  tone:
    | "brand"
    | "success"
    | "warning"
    | "danger"
    | "neutral";
}

function formatPercentage(
  value: number,
): string {
  return `${value.toFixed(1)}%`;
}

function getMetricStyles(
  tone: MetricCardProps["tone"],
): {
  icon: string;
  accent: string;
} {
  switch (tone) {
    case "success":
      return {
        icon:
          "bg-emerald-100 text-emerald-800",
        accent:
          "from-emerald-600 to-emerald-800",
      };

    case "warning":
      return {
        icon:
          "bg-amber-100 text-amber-800",
        accent:
          "from-amber-500 to-amber-700",
      };

    case "danger":
      return {
        icon:
          "bg-rose-100 text-rose-800",
        accent:
          "from-rose-500 to-rose-700",
      };

    case "neutral":
      return {
        icon:
          "bg-slate-100 text-slate-700",
        accent:
          "from-slate-500 to-slate-700",
      };

    case "brand":
    default:
      return {
        icon:
          "bg-emerald-950 text-white",
        accent:
          "from-emerald-800 to-emerald-950",
      };
  }
}

function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  tone,
}: MetricCardProps) {
  const styles =
    getMetricStyles(
      tone,
    );

  return (
    <VivaceCard
      elevated
      className="relative min-w-0 overflow-hidden"
    >
      <div
        aria-hidden="true"
        className={[
          "absolute inset-x-0 top-0 h-1 bg-gradient-to-r",
          styles.accent,
        ].join(" ")}
      />

      <VivaceCard.Body className="p-3.5 sm:p-5">
        <div className="flex items-start justify-between gap-2 sm:gap-4">
          <div className="min-w-0">
            <p className="line-clamp-2 text-[10px] font-bold uppercase leading-4 tracking-[0.11em] text-slate-500 sm:text-xs sm:tracking-[0.14em]">
              {label}
            </p>

            <p className="mt-2 truncate text-2xl font-bold tracking-tight text-slate-950 sm:mt-3 sm:text-3xl">
              {value}
            </p>

            <p className="mt-1.5 line-clamp-2 text-[11px] leading-4 text-slate-500 sm:mt-2 sm:text-xs sm:leading-5">
              {description}
            </p>
          </div>

          <div
            className={[
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 sm:rounded-2xl",
              styles.icon,
            ].join(" ")}
          >
            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>
      </VivaceCard.Body>
    </VivaceCard>
  );
}

export default function MemberAttendanceStatsSummary({
  stats,
  className = "",
}: MemberAttendanceStatsSummaryProps) {
  const {
    totals,
    percentages,
  } = stats;

  const attendedCount =
    totals.presentCount +
    totals.lateCount;

  return (
    <section
      className={[
        "space-y-3 sm:space-y-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-end sm:justify-between sm:gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-800 sm:text-[11px] sm:tracking-[0.18em]">
            Resumen del periodo
          </p>

          <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-950 sm:text-xl">
            Indicadores de asistencia
          </h2>
        </div>

        <p className="text-xs font-semibold text-slate-500 sm:text-sm">
          {totals.totalSessions}{" "}
          {totals.totalSessions === 1
            ? "sesión evaluada"
            : "sesiones evaluadas"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <MetricCard
          label="Asistencia general"
          value={formatPercentage(
            percentages.attendancePercentage,
          )}
          description={`${attendedCount} de ${totals.totalSessions} sesiones`}
          icon={CalendarCheck2}
          tone="brand"
        />

        <MetricCard
          label="Puntualidad"
          value={formatPercentage(
            percentages.punctualityPercentage,
          )}
          description="Sobre asistencias registradas"
          icon={Clock3}
          tone="success"
        />

        <MetricCard
          label="Presentes"
          value={totals.presentCount}
          description="Registros puntuales"
          icon={CheckCircle2}
          tone="success"
        />

        <MetricCard
          label="Ausencias"
          value={totals.absentCount}
          description={
            totals.absentCount > 0
              ? "Requiere seguimiento"
              : "Sin ausencias"
          }
          icon={TriangleAlert}
          tone={
            totals.absentCount > 0
              ? "danger"
              : "neutral"
          }
        />

        <MetricCard
          label="Retardos"
          value={totals.lateCount}
          description="Llegadas posteriores al horario"
          icon={Clock3}
          tone={
            totals.lateCount > 0
              ? "warning"
              : "neutral"
          }
        />

        <MetricCard
          label="Justificadas"
          value={totals.justifiedCount}
          description={formatPercentage(
            percentages.justifiedPercentage,
          )}
          icon={ShieldCheck}
          tone="warning"
        />

        <MetricCard
          label="Ausencia porcentual"
          value={formatPercentage(
            percentages.absencePercentage,
          )}
          description="Del periodo consultado"
          icon={TriangleAlert}
          tone={
            percentages.absencePercentage > 0
              ? "danger"
              : "neutral"
          }
        />
      </div>
    </section>
  );
}
