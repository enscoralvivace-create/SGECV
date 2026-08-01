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
      <VivaceCard.Header>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-950 text-white shadow-sm">
              <TrendingUp className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">
                Evolución
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-950">
                Tendencia mensual
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Porcentaje de asistencia por periodo.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-right">
            <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-800">
              Promedio
            </p>

            <p className="mt-1 text-2xl font-bold text-emerald-950">
              {averagePercentage.toFixed(
                1,
              )}
              %
            </p>
          </div>
        </div>
      </VivaceCard.Header>

      <VivaceCard.Body className="p-5">
        <div className="grid min-h-[300px] grid-cols-[auto_1fr] gap-4">
          <div className="flex flex-col justify-between pb-8 text-[11px] font-semibold text-slate-400">
            <span>100%</span>
            <span>75%</span>
            <span>50%</span>
            <span>25%</span>
            <span>0%</span>
          </div>

          <div className="relative">
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

            <div className="relative flex h-full items-end gap-3 overflow-x-auto pb-8">
              {trend.map(
                (point) => {
                  const percentage =
                    clampPercentage(
                      point.attendancePercentage,
                    );

                  const sessionWidth =
                    Math.max(
                      54,
                      Math.round(
                        (
                          point.totalSessions /
                          maxSessions
                        ) *
                          78,
                      ),
                    );

                  return (
                    <article
                      key={point.period}
                      className="flex min-w-[82px] flex-1 flex-col items-center"
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

                      <div className="mt-3 flex h-[210px] items-end">
                        <div
                          role="progressbar"
                          aria-label={`Asistencia de ${point.label}`}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={
                            percentage
                          }
                          className={[
                            "rounded-t-2xl shadow-sm transition-all",
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

                      <p className="mt-3 text-center text-sm font-bold capitalize text-slate-900">
                        {point.label}
                      </p>

                      <p className="mt-1 text-center text-[11px] leading-4 text-slate-500">
                        {
                          point.attendedSessions
                        }{" "}
                        de{" "}
                        {
                          point.totalSessions
                        }{" "}
                        sesiones
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