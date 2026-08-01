"use client";

import {
  CalendarRange,
  TrendingUp,
} from "lucide-react";

import VivaceBadge from "@/components/ui/VivaceBadge";
import VivaceCard from "@/components/ui/VivaceCard";
import VivaceEmptyState from "@/components/ui/VivaceEmptyState";

import type {
  MemberAttendanceTrendPoint,
} from "@/types/memberAttendanceStats";

interface MemberAttendanceTrendProps {
  trend: MemberAttendanceTrendPoint[];
  className?: string;
}

function getTone(
  percentage: number,
):
  | "success"
  | "warning"
  | "danger"
  | "neutral" {
  if (percentage >= 90) {
    return "success";
  }

  if (percentage >= 75) {
    return "warning";
  }

  if (percentage > 0) {
    return "danger";
  }

  return "neutral";
}

function getBarClass(
  percentage: number,
): string {
  if (percentage >= 90) {
    return "bg-emerald-700";
  }

  if (percentage >= 75) {
    return "bg-amber-500";
  }

  if (percentage > 0) {
    return "bg-rose-600";
  }

  return "bg-slate-300";
}

function clampPercentage(
  value: number,
): number {
  return Math.min(
    100,
    Math.max(
      0,
      value,
    ),
  );
}

function getAveragePercentage(
  trend: MemberAttendanceTrendPoint[],
): number {
  if (trend.length === 0) {
    return 0;
  }

  const total =
    trend.reduce(
      (
        sum,
        point,
      ) =>
        sum +
        point.attendancePercentage,
      0,
    );

  return Number(
    (
      total /
      trend.length
    ).toFixed(1),
  );
}

export default function MemberAttendanceTrend({
  trend,
  className = "",
}: MemberAttendanceTrendProps) {
  if (trend.length === 0) {
    return (
      <VivaceEmptyState
        title="Sin tendencia disponible"
        description="No existen suficientes sesiones para construir la evolución mensual de asistencia."
        icon={
          <CalendarRange className="h-8 w-8" />
        }
        className={className}
      />
    );
  }

  const averagePercentage =
    getAveragePercentage(
      trend,
    );

  const maxSessions =
    Math.max(
      1,
      ...trend.map(
        (point) =>
          point.totalSessions,
      ),
    );

  return (
    <VivaceCard
      className={[
        "overflow-hidden",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <VivaceCard.Header className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="flex min-w-0 items-start gap-3 sm:gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-950 text-white shadow-sm sm:h-11 sm:w-11 sm:rounded-2xl">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-800 sm:text-xs sm:tracking-[0.2em]">
                Evolución
              </p>

              <h2 className="mt-1 text-lg font-bold text-slate-950 sm:text-xl">
                Tendencia mensual
              </h2>

              <p className="mt-1 hidden text-sm text-slate-500 sm:block">
                Porcentaje de asistencia por periodo.
              </p>
            </div>
          </div>

          <div className="shrink-0 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-right sm:rounded-2xl sm:px-4 sm:py-3">
            <p className="text-[9px] font-bold uppercase tracking-wide text-emerald-800 sm:text-[11px]">
              Promedio
            </p>

            <p className="mt-0.5 text-xl font-bold text-emerald-950 sm:mt-1 sm:text-2xl">
              {averagePercentage.toFixed(
                1,
              )}
              %
            </p>
          </div>
        </div>
      </VivaceCard.Header>

      <VivaceCard.Body className="p-3 sm:p-5">
        <div className="grid min-h-[250px] grid-cols-[30px_1fr] gap-2 sm:min-h-[300px] sm:grid-cols-[auto_1fr] sm:gap-4">
          <div className="flex flex-col justify-between pb-8 text-[9px] font-semibold text-slate-400 sm:text-[11px]">
            <span>100%</span>
            <span>75%</span>
            <span>50%</span>
            <span>25%</span>
            <span>0%</span>
          </div>

          <div className="relative min-w-0">
            <div
              aria-hidden="true"
              className="absolute inset-0 flex flex-col justify-between pb-8"
            >
              {Array.from({
                length: 5,
              }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="border-t border-dashed border-slate-200"
                  />
                ),
              )}
            </div>

            <div className="relative flex h-full snap-x snap-mandatory items-end gap-2 overflow-x-auto overscroll-x-contain pb-8 pr-2 [scrollbar-width:thin] sm:gap-3">
              {trend.map(
                (point) => {
                  const percentage =
                    clampPercentage(
                      point.attendancePercentage,
                    );

                  const sessionWidth =
                    Math.max(
                      42,
                      Math.round(
                        (
                          point.totalSessions /
                          maxSessions
                        ) *
                          64,
                      ),
                    );

                  return (
                    <article
                      key={point.period}
                      className="flex min-w-[72px] snap-start flex-col items-center sm:min-w-[82px] sm:flex-1"
                    >
                      <VivaceBadge
                        tone={
                          getTone(
                            percentage,
                          )
                        }
                        size="sm"
                      >
                        {percentage.toFixed(
                          1,
                        )}
                        %
                      </VivaceBadge>

                      <div className="mt-2 flex h-[160px] items-end sm:mt-3 sm:h-[210px]">
                        <div
                          role="progressbar"
                          aria-label={`Asistencia de ${point.label}`}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={
                            percentage
                          }
                          className={[
                            "rounded-t-xl shadow-sm transition-all sm:rounded-t-2xl",
                            getBarClass(
                              percentage,
                            ),
                          ].join(" ")}
                          style={{
                            height: `${percentage}%`,
                            width: `${sessionWidth}px`,
                          }}
                        />
                      </div>

                      <p className="mt-2 max-w-[74px] truncate text-center text-xs font-bold capitalize text-slate-900 sm:mt-3 sm:max-w-none sm:text-sm">
                        {point.label}
                      </p>

                      <p className="mt-1 text-center text-[9px] leading-4 text-slate-500 sm:text-[11px]">
                        {
                          point.attendedSessions
                        }{" "}
                        de{" "}
                        {
                          point.totalSessions
                        }
                      </p>
                    </article>
                  );
                },
              )}
            </div>
          </div>
        </div>
      </VivaceCard.Body>
    </VivaceCard>
  );
}