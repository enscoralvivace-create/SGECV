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
      weekday: "long",
      day: "2-digit",
      month: "long",
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
      <VivaceCard.Header>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">
            Historial reciente
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-950">
            Últimas asistencias
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Consulta las sesiones más recientes del integrante.
          </p>
        </div>
      </VivaceCard.Header>

      <VivaceCard.Body className="p-5">
        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute bottom-5 left-5 top-5 w-px bg-slate-200"
          />

          <div className="space-y-5">
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
                    className="relative flex gap-4"
                  >
                    <div
                      className={[
                        "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-4 ring-white",
                        getStatusCircleClass(
                          record.status,
                        ),
                      ].join(" ")}
                    >
                      <StatusIcon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/30">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-950">
                            {
                              record.sessionTitle
                            }
                          </p>

                          <p className="mt-1 capitalize text-sm text-slate-500">
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
                          dot
                        >
                          {getStatusLabel(
                            record.status,
                          )}
                        </VivaceBadge>
                      </div>

                      <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
                        <Clock3 className="h-4 w-4 text-emerald-800" />

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