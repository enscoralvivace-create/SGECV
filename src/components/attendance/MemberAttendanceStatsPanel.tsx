"use client";

import {
  CalendarRange,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";

import MemberAttendanceHistory from "@/components/attendance/MemberAttendanceHistory";
import MemberAttendanceStatsSummary from "@/components/attendance/MemberAttendanceStatsSummary";
import MemberAttendanceTrend from "@/components/attendance/MemberAttendanceTrend";
import VivaceButton from "@/components/ui/VivaceButton";
import VivaceCard from "@/components/ui/VivaceCard";
import VivaceInput from "@/components/ui/VivaceInput";
import VivaceLoading from "@/components/ui/VivaceLoading";

import useMemberAttendanceStats from "@/hooks/useMemberAttendanceStats";

interface MemberAttendanceStatsPanelProps {
  memberId: number;
  className?: string;
}

export default function MemberAttendanceStatsPanel({
  memberId,
  className = "",
}: MemberAttendanceStatsPanelProps) {
  const {
    stats,
    filters,
    isLoading,
    error,
    reload,
    setFilters,
    clearFilters,
  } = useMemberAttendanceStats(
    memberId,
  );

  if (isLoading) {
    return (
      <VivaceLoading
        variant="page"
        message="Cargando estadísticas de asistencia..."
        className={className}
      />
    );
  }

  if (error) {
    return (
      <VivaceCard
        className={[
          "border-rose-200 bg-rose-50/70",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <VivaceCard.Body>
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
              <TriangleAlert className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h2 className="font-bold text-rose-900">
                No fue posible cargar las estadísticas
              </h2>

              <p className="mt-2 text-sm leading-6 text-rose-700">
                {error}
              </p>

              <VivaceButton
                variant="danger"
                size="sm"
                className="mt-4"
                leftIcon={
                  <RefreshCw className="h-4 w-4" />
                }
                onClick={() => {
                  void reload();
                }}
              >
                Reintentar
              </VivaceButton>
            </div>
          </div>
        </VivaceCard.Body>
      </VivaceCard>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <section
      className={[
        "space-y-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <VivaceCard>
        <VivaceCard.Body className="p-4 sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-950 text-white shadow-sm">
                <CalendarRange className="h-4 w-4" />
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-800">
                  Periodo de consulta
                </p>

                <h2 className="mt-1 text-lg font-bold text-slate-950">
                  Filtros de asistencia
                </h2>
              </div>
            </div>

            <div className="grid flex-1 gap-3 md:grid-cols-2 xl:max-w-3xl">
              <VivaceInput
                type="date"
                label="Fecha inicial"
                value={
                  filters.startDate ??
                  ""
                }
                onChange={(event) => {
                  setFilters({
                    startDate:
                      event.target.value,
                  });
                }}
              />

              <VivaceInput
                type="date"
                label="Fecha final"
                value={
                  filters.endDate ??
                  ""
                }
                onChange={(event) => {
                  setFilters({
                    endDate:
                      event.target.value,
                  });
                }}
              />
            </div>

            <div className="flex flex-wrap gap-2 xl:justify-end">
              <VivaceButton
                size="sm"
                variant="primary"
                leftIcon={
                  <RefreshCw className="h-4 w-4" />
                }
                onClick={() => {
                  void reload();
                }}
              >
                Actualizar
              </VivaceButton>

              <VivaceButton
                size="sm"
                variant="outline"
                onClick={clearFilters}
              >
                Limpiar
              </VivaceButton>
            </div>
          </div>
        </VivaceCard.Body>
      </VivaceCard>

      <MemberAttendanceStatsSummary
        stats={stats}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <MemberAttendanceTrend
          trend={stats.trend}
        />

        <MemberAttendanceHistory
          records={
            stats.recentRecords
          }
        />
      </div>
    </section>
  );
}