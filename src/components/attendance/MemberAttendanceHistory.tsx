"use client";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

import VivaceBadge, {
  type VivaceBadgeTone,
} from "@/components/ui/VivaceBadge";
import VivaceCard from "@/components/ui/VivaceCard";
import VivaceEmptyState from "@/components/ui/VivaceEmptyState";

import type {
  MemberAttendanceRecord,
  MemberAttendanceStatus,
} from "@/types/memberAttendanceStats";

interface MemberAttendanceHistoryProps {
  records: MemberAttendanceRecord[];
  className?: string;
}

function getStatusLabel(
  status: MemberAttendanceStatus,
): string {
  switch (status) {
    case "present":
      return "Presente";

    case "late":
      return "Retardo";

    case "justified":
      return "Justificada";

    case "absent":
    default:
      return "Ausente";
  }
}

function getStatusTone(
  status: MemberAttendanceStatus,
): VivaceBadgeTone {
  switch (status) {
    case "present":
      return "success";

    case "late":
      return "warning";

    case "justified":
      return "info";

    case "absent":
    default:
      return "danger";
  }
}

function getStatusIcon(
  status: MemberAttendanceStatus,
) {
  switch (status) {
    case "present":
      return CheckCircle2;

    case "late":
      return Clock3;

    case "justified":
      return ShieldCheck;

    case "absent":
    default:
      return TriangleAlert;
  }
}

function getStatusCircleClass(
  status: MemberAttendanceStatus,
): string {
  switch (status) {
    case "present":
      return "bg-emerald-100 text-emerald-800 ring-emerald-200";

    case "late":
      return "bg-amber-100 text-amber-800 ring-amber-200";

    case "justified":
      return "bg-sky-100 text-sky-800 ring-sky-200";

    case "absent":
    default:
      return "bg-rose-100 text-rose-800 ring-rose-200";
  }
}

function formatDate(
  value: string,
): string {
  const [
    year,
    month,
    day,
  ] = value
    .slice(0, 10)
    .split("-")
    .map(Number);

  if (
    !year ||
    !month ||
    !day
  ) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat(
    "es-MX",
    {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(
    new Date(
      year,
      month - 1,
      day,
    ),
  );
}

function formatTime(
  value: string | null,
): string {
  if (!value) {
    return "Sin registro";
  }

  return new Intl.DateTimeFormat(
    "es-MX",
    {
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(
    new Date(value),
  );
}

export default function MemberAttendanceHistory({
  records,
  className = "",
}: MemberAttendanceHistoryProps) {
  if (
    records.length === 0
  ) {
    return (
      <VivaceEmptyState
        title="Sin historial de asistencia"
        description="No existen sesiones registradas para el periodo consultado."
        icon={
          <CalendarDays className="h-8 w-8" />
        }
        className={className}
      />
    );
  }

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
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-800 sm:text-xs sm:tracking-[0.2em]">
            Historial reciente
          </p>

          <h2 className="mt-1 text-lg font-bold text-slate-950 sm:text-xl">
            Últimas asistencias
          </h2>

          <p className="mt-1 hidden text-sm text-slate-500 sm:block">
            Consulta las sesiones más recientes del integrante.
          </p>
        </div>
      </VivaceCard.Header>

      <VivaceCard.Body className="p-3 sm:p-5">
        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute bottom-4 left-[17px] top-4 w-px bg-slate-200 sm:left-5 sm:bottom-5 sm:top-5"
          />

          <div className="space-y-3 sm:space-y-5">
            {records.map(
              (record) => {
                const StatusIcon =
                  getStatusIcon(
                    record.status,
                  );

                return (
                  <article
                    key={
                      record.attendanceId ||
                      record.sessionId
                    }
                    className="relative flex gap-3 sm:gap-4"
                  >
                    <div
                      className={[
                        "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-4 ring-white sm:h-10 sm:w-10",
                        getStatusCircleClass(
                          record.status,
                        ),
                      ].join(" ")}
                    >
                      <StatusIcon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/30 sm:p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-950 sm:text-base">
                            {
                              record.sessionTitle
                            }
                          </p>

                          <p className="mt-1 truncate capitalize text-xs text-slate-500 sm:text-sm">
                            {formatDate(
                              record.sessionDate,
                            )}
                          </p>
                        </div>

                        <VivaceBadge
                          tone={
                            getStatusTone(
                              record.status,
                            )
                          }
                          size="sm"
                          dot
                        >
                          {getStatusLabel(
                            record.status,
                          )}
                        </VivaceBadge>
                      </div>

                      <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 sm:mt-3 sm:rounded-xl sm:px-3 sm:py-2 sm:text-xs">
                        <Clock3 className="h-3.5 w-3.5 text-emerald-800 sm:h-4 sm:w-4" />
                        {formatTime(
                          record.checkedInAt,
                        )}
                      </div>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        </div>
      </VivaceCard.Body>
    </VivaceCard>
  );
}
