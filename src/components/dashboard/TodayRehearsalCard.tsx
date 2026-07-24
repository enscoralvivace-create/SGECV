"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  MapPin,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";

import AttendanceQrCard from "@/components/attendance/AttendanceQrCard";
import { getRehearsalExceptionByDate } from "@/services/rehearsalService";
import type { Rehearsal } from "@/types/rehearsal";
import {
  formatDateToISO,
  getRehearsalForDate,
} from "@/utils/rehearsal";

function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return new Intl.DateTimeFormat("es-MX", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getStatusLabel(rehearsal: Rehearsal): string {
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

export default function TodayRehearsalCard() {
  const [rehearsal, setRehearsal] =
    useState<Rehearsal | null>(null);

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  /*
   * Conservamos la misma fecha durante cada render.
   * Esto evita crear un objeto Date nuevo cada vez que
   * React actualiza el componente.
   */
  const today = useMemo(() => new Date(), []);

  const todayString = useMemo(
    () => formatDateToISO(today),
    [today],
  );

  const loadRehearsal = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const exception =
        await getRehearsalExceptionByDate(todayString);

      const result = getRehearsalForDate(
        today,
        exception ? [exception] : [],
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
  }, [today, todayString]);

  useEffect(() => {
    void loadRehearsal();
  }, [loadRehearsal]);

  if (loading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex min-h-52 items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="rounded-3xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-start gap-3">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

          <div>
            <h2 className="font-semibold text-red-900">
              No se pudo consultar el ensayo
            </h2>

            <p className="mt-1 text-sm text-red-700">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={() => void loadRehearsal()}
              className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!rehearsal) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-slate-100 p-3">
            <CalendarDays className="h-6 w-6 text-slate-600" />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-500">
              Actividad de hoy
            </p>

            <h2 className="text-xl font-bold text-slate-900">
              No hay ensayo programado
            </h2>
          </div>
        </div>

        <p className="mt-5 text-sm text-slate-600">
          Los ensayos regulares se realizan los martes y jueves de
          8:00 p. m. a 10:00 p. m.
        </p>
      </section>
    );
  }

  const isCancelled = rehearsal.status === "cancelled";

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
              Ensayo de hoy
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              {rehearsal.title}
            </h2>

            <p className="mt-1 capitalize text-slate-500">
              {formatLongDate(today)}
            </p>
          </div>

          <span
            className={[
              "w-fit rounded-full px-3 py-1 text-sm font-semibold",
              isCancelled
                ? "bg-red-100 text-red-700"
                : rehearsal.status === "modified"
                  ? "bg-amber-100 text-amber-700"
                  : rehearsal.status === "extra"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-emerald-100 text-emerald-700",
            ].join(" ")}
          >
            {getStatusLabel(rehearsal)}
          </span>
        </div>
      </div>

      <div className="space-y-4 p-6">
        {!isCancelled && (
          <div className="flex items-center gap-3 text-slate-700">
            <Clock3 className="h-5 w-5 shrink-0 text-slate-400" />

            <span className="font-medium">
              {formatTime(rehearsal.startTime)}
              {" – "}
              {formatTime(rehearsal.endTime)}
            </span>
          </div>
        )}

        {rehearsal.location && (
          <div className="flex items-center gap-3 text-slate-700">
            <MapPin className="h-5 w-5 shrink-0 text-slate-400" />
            <span>{rehearsal.location}</span>
          </div>
        )}

        {rehearsal.notes && (
          <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            {rehearsal.notes}
          </p>
        )}

        {isCancelled ? (
          <div className="rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700">
            La asistencia no puede iniciarse porque el ensayo fue
            cancelado.
          </div>
        ) : (
          <AttendanceQrCard rehearsal={rehearsal} />
        )}
      </div>
    </section>
  );
}