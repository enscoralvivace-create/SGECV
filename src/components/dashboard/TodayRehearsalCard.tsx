"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  Clock3,
  MapPin,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";

import AttendanceQrCard from "@/components/attendance/AttendanceQrCard";
import VivaceBadge from "@/components/ui/VivaceBadge";
import VivaceButton from "@/components/ui/VivaceButton";
import VivaceCard from "@/components/ui/VivaceCard";
import VivaceEmptyState from "@/components/ui/VivaceEmptyState";
import VivaceLoading from "@/components/ui/VivaceLoading";

import {
  getRehearsalExceptionByDate,
} from "@/services/rehearsalService";

import type {
  Rehearsal,
} from "@/types/rehearsal";

import {
  formatDateToISO,
  getRehearsalForDate,
} from "@/utils/rehearsal";

function formatLongDate(
  date: Date,
): string {
  return new Intl.DateTimeFormat(
    "es-MX",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
    },
  ).format(date);
}

function formatTime(
  time: string,
): string {
  const [hours, minutes] =
    time.split(":").map(Number);

  const date = new Date();

  date.setHours(
    hours,
    minutes,
    0,
    0,
  );

  return new Intl.DateTimeFormat(
    "es-MX",
    {
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(date);
}

function getStatusLabel(
  rehearsal: Rehearsal,
): string {
  switch (rehearsal.status) {
    case "cancelled":
      return "Cancelado";

    case "modified":
      return "Horario modificado";

    case "extra":
      return "Ensayo extraordinario";

    default:
      return "Programado";
  }
}

function getStatusTone(
  rehearsal: Rehearsal,
):
  | "danger"
  | "warning"
  | "info"
  | "success" {
  switch (rehearsal.status) {
    case "cancelled":
      return "danger";

    case "modified":
      return "warning";

    case "extra":
      return "info";

    default:
      return "success";
  }
}

export default function TodayRehearsalCard() {
  const [
    rehearsal,
    setRehearsal,
  ] =
    useState<Rehearsal | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState<string | null>(null);

  const today =
    useMemo(
      () => new Date(),
      [],
    );

  const todayString =
    useMemo(
      () =>
        formatDateToISO(
          today,
        ),
      [today],
    );

  const loadRehearsal =
    useCallback(async (): Promise<void> => {
      setLoading(true);
      setErrorMessage(null);

      try {
        const exception =
          await getRehearsalExceptionByDate(
            todayString,
          );

        const result =
          getRehearsalForDate(
            today,
            exception
              ? [exception]
              : [],
          );

        setRehearsal(result);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "No fue posible consultar el ensayo de hoy.";

        setErrorMessage(message);
      } finally {
        setLoading(false);
      }
    }, [
      today,
      todayString,
    ]);

  useEffect(() => {
    void loadRehearsal();
  }, [loadRehearsal]);

  if (loading) {
    return (
      <VivaceLoading
        message="Consultando el ensayo de hoy..."
        variant="card"
        className="min-h-[360px]"
      />
    );
  }

  if (errorMessage) {
    return (
      <VivaceCard className="border-rose-200 bg-rose-50/70">
        <VivaceCard.Body>
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
              <TriangleAlert className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h2 className="font-bold text-rose-900">
                No se pudo consultar el ensayo
              </h2>

              <p className="mt-2 text-sm leading-6 text-rose-700">
                {errorMessage}
              </p>

              <VivaceButton
                variant="danger"
                size="sm"
                className="mt-4"
                leftIcon={
                  <RefreshCw className="h-4 w-4" />
                }
                onClick={() => {
                  void loadRehearsal();
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

  if (!rehearsal) {
    return (
      <VivaceEmptyState
        title="No hay ensayo programado"
        description="Los ensayos regulares se realizan los martes y jueves de 8:00 p. m. a 10:00 p. m."
        icon={
          <CalendarDays className="h-8 w-8" />
        }
        className="min-h-[360px]"
      />
    );
  }

  const isCancelled =
    rehearsal.status ===
    "cancelled";

  return (
    <VivaceCard
      elevated
      gradient
      className="overflow-hidden"
    >
      <VivaceCard.Header>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">
              Ensayo de hoy
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
              {rehearsal.title}
            </h2>

            <p className="mt-2 capitalize text-sm text-slate-500">
              {formatLongDate(
                today,
              )}
            </p>
          </div>

          <VivaceBadge
            tone={
              getStatusTone(
                rehearsal,
              )
            }
            dot
          >
            {getStatusLabel(
              rehearsal,
            )}
          </VivaceBadge>
        </div>
      </VivaceCard.Header>

      <VivaceCard.Body>
        <div className="space-y-4">
          {!isCancelled ? (
            <div className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 text-slate-700 shadow-sm ring-1 ring-slate-100">
              <Clock3 className="h-5 w-5 shrink-0 text-emerald-800" />

              <span className="font-semibold">
                {formatTime(
                  rehearsal.startTime,
                )}
                {" – "}
                {formatTime(
                  rehearsal.endTime,
                )}
              </span>
            </div>
          ) : null}

          {rehearsal.location ? (
            <div className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 text-slate-700 shadow-sm ring-1 ring-slate-100">
              <MapPin className="h-5 w-5 shrink-0 text-emerald-800" />

              <span>
                {rehearsal.location}
              </span>
            </div>
          ) : null}

          {rehearsal.notes ? (
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm leading-6 text-slate-600">
              {rehearsal.notes}
            </div>
          ) : null}

          {isCancelled ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium leading-6 text-rose-700">
              La asistencia no puede iniciarse porque el ensayo fue cancelado.
            </div>
          ) : (
            <AttendanceQrCard
              rehearsal={rehearsal}
            />
          )}
        </div>
      </VivaceCard.Body>
    </VivaceCard>
  );
}