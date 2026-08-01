"use client";

import {
  Suspense,
  useState,
} from "react";

import {
  useSearchParams,
} from "next/navigation";

import {
  CheckCircle2,
  Clock3,
  LoaderCircle,
  TriangleAlert,
} from "lucide-react";

import type {
  AttendanceCheckInResult,
} from "@/services/attendanceCheckInService";

import {
  registerAttendanceByToken,
} from "@/services/attendanceCheckInService";

function formatTime(
  dateString: string | null,
): string {
  if (!dateString) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "es-MX",
    {
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(new Date(dateString));
}

function getStatusLabel(
  status: string,
): string {
  switch (status) {
    case "present":
      return "Presente";

    case "late":
      return "Retardo";

    case "justified":
      return "Justificado";

    default:
      return "Ausente";
  }
}

export default function AttendanceRegistrationPage() {
  return (
    <Suspense
      fallback={
        <AttendanceRegistrationLoading />
      }
    >
      <AttendanceRegistrationContent />
    </Suspense>
  );
}

function AttendanceRegistrationContent() {
  const searchParams =
    useSearchParams();

  const token =
    searchParams.get("token");

  const [
    result,
    setResult,
  ] =
    useState<AttendanceCheckInResult | null>(
      null,
    );

  const [loading, setLoading] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState<string | null>(null);

  async function handleRegisterAttendance() {
    if (!token) {
      setErrorMessage(
        "El enlace no contiene un código de asistencia válido.",
      );

      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const attendanceResult =
        await registerAttendanceByToken(
          token,
        );

      setResult(attendanceResult);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible registrar la asistencia.";

      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-10">
        <div className="w-full rounded-3xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <TriangleAlert className="mx-auto h-10 w-10 text-red-600" />

          <h1 className="mt-4 text-xl font-bold text-slate-950">
            Código no válido
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Escanea nuevamente el código QR mostrado en el
            Dashboard.
          </p>
        </div>
      </main>
    );
  }

  if (result) {
    const isLate =
      result.record.status === "late";

    return (
      <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-10">
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm">
          <div
            className={[
              "mx-auto flex h-20 w-20 items-center justify-center rounded-full",
              isLate
                ? "bg-amber-100 text-amber-600"
                : "bg-emerald-100 text-emerald-600",
            ].join(" ")}
          >
            {isLate ? (
              <Clock3 className="h-10 w-10" />
            ) : (
              <CheckCircle2 className="h-10 w-10" />
            )}
          </div>

          <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Vivace Suite
          </p>

          <h1 className="mt-2 text-2xl font-bold text-slate-950">
            {result.alreadyRegistered
              ? "Asistencia registrada anteriormente"
              : "Asistencia registrada"}
          </h1>

          <p className="mt-2 text-slate-600">
            Hola, {result.member.name}.
          </p>

          <div className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-5 text-left">
            <div className="flex justify-between gap-4">
              <span className="text-sm text-slate-500">
                Actividad
              </span>

              <span className="text-right text-sm font-semibold text-slate-900">
                {result.session.title}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-sm text-slate-500">
                Hora de registro
              </span>

              <span className="text-sm font-semibold text-slate-900">
                {formatTime(
                  result.record.checked_in_at,
                )}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-sm text-slate-500">
                Estado
              </span>

              <span
                className={[
                  "rounded-full px-3 py-1 text-sm font-semibold",
                  isLate
                    ? "bg-amber-100 text-amber-700"
                    : "bg-emerald-100 text-emerald-700",
                ].join(" ")}
              >
                {getStatusLabel(
                  result.record.status,
                )}
              </span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-10">
      <div className="w-full rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
          Vivace Suite
        </p>

        <h1 className="mt-3 text-2xl font-bold text-slate-950">
          Registro de asistencia
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Confirma tu llegada al ensayo del Ensamble Coral
          Vivace.
        </p>

        {errorMessage ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-left">
            <div className="flex items-start gap-3">
              <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

              <p className="text-sm text-red-700">
                {errorMessage}
              </p>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          disabled={loading}
          onClick={() => {
            void handleRegisterAttendance();
          }}
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <LoaderCircle className="h-5 w-5 animate-spin" />
              Registrando...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5" />
              Confirmar asistencia
            </>
          )}
        </button>
      </div>
    </main>
  );
}

function AttendanceRegistrationLoading() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-10">
      <div className="w-full rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm">
        <LoaderCircle className="mx-auto h-9 w-9 animate-spin text-indigo-600" />

        <p className="mt-4 text-sm font-medium text-slate-600">
          Cargando registro de asistencia...
        </p>
      </div>
    </main>
  );
}