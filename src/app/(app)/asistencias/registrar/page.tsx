"use client";

import {
  Suspense,
  type ReactNode,
  useRef,
  useState,
} from "react";

import Link from "next/link";
import {
  useSearchParams,
} from "next/navigation";

import {
  CheckCircle2,
  Clock3,
  LoaderCircle,
  LogIn,
  QrCode,
  TriangleAlert,
} from "lucide-react";

import type {
  AttendanceCheckInResult,
} from "@/services/attendanceCheckInService";

import {
  registerAttendanceByToken,
} from "@/services/attendanceCheckInService";

const AUTHENTICATION_REQUIRED_MESSAGE =
  "Debes iniciar sesión para registrar tu asistencia.";

function formatTime(
  dateString: string,
): string {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Hora no disponible";
  }

  return new Intl.DateTimeFormat(
    "es-MX",
    {
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(date);
}

function getStatusLabel(
  status: AttendanceCheckInResult["record"]["status"],
): string {
  return status === "present"
    ? "Presente"
    : "Retardo";
}

function getLoginHref(
  token: string,
): string {
  const returnPath =
    `/asistencias/registrar?token=${encodeURIComponent(token)}`;

  return `/login?returnTo=${encodeURIComponent(returnPath)}`;
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
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const submissionInProgress = useRef(false);

  const [result, setResult] =
    useState<AttendanceCheckInResult | null>(null);
  const [isValidating, setIsValidating] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  async function handleRegisterAttendance() {
    if (!token || submissionInProgress.current) {
      return;
    }

    submissionInProgress.current = true;
    setIsValidating(true);
    setErrorMessage(null);

    try {
      const attendanceResult =
        await registerAttendanceByToken(token);

      setResult(attendanceResult);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible registrar tu asistencia. Inténtalo nuevamente.";

      setErrorMessage(message);
    } finally {
      submissionInProgress.current = false;
      setIsValidating(false);
    }
  }

  if (!token) {
    return (
      <RegistrationShell>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <TriangleAlert
            aria-hidden="true"
            className="h-8 w-8"
          />
        </div>

        <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
          Código no válido
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          El enlace no contiene un código de asistencia válido.
          Escanea nuevamente el QR mostrado por tu maestro.
        </p>
      </RegistrationShell>
    );
  }

  if (result) {
    return (
      <AttendanceSuccess result={result} />
    );
  }

  const requiresAuthentication =
    errorMessage === AUTHENTICATION_REQUIRED_MESSAGE;

  return (
    <RegistrationShell>
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
        <QrCode
          aria-hidden="true"
          className="h-8 w-8"
        />
      </div>

      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
        Vivace Suite
      </p>

      <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
        Pase de lista
      </h1>

      <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-left">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Ensayo
        </p>

        <p className="mt-2 text-base font-semibold text-slate-950">
          Ensamble Coral Vivace
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Confirma tu llegada. El sistema validará la sesión y
          determinará tu asistencia con la hora oficial.
        </p>
      </div>

      {errorMessage ? (
        <div
          role="alert"
          className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-left"
        >
          <div className="flex items-start gap-3">
            <TriangleAlert
              aria-hidden="true"
              className="mt-0.5 h-5 w-5 shrink-0 text-red-600"
            />

            <p className="text-sm leading-6 text-red-700">
              {errorMessage}
            </p>
          </div>
        </div>
      ) : null}

      {requiresAuthentication ? (
        <Link
          href={getLoginHref(token)}
          className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-800 px-5 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          <LogIn
            aria-hidden="true"
            className="h-5 w-5"
          />
          Iniciar sesión
        </Link>
      ) : (
        <button
          type="button"
          disabled={isValidating}
          onClick={() => {
            void handleRegisterAttendance();
          }}
          className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-800 px-5 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isValidating ? (
            <>
              <LoaderCircle
                aria-hidden="true"
                className="h-5 w-5 animate-spin"
              />
              Validando asistencia...
            </>
          ) : (
            <>
              <CheckCircle2
                aria-hidden="true"
                className="h-5 w-5"
              />
              Registrar mi asistencia
            </>
          )}
        </button>
      )}

      <p
        aria-live="polite"
        className="mt-4 min-h-5 text-xs leading-5 text-slate-500"
      >
        {isValidating
          ? "Estamos verificando tu cuenta y la vigencia del QR."
          : "Tu asistencia solo se registra cuando presionas el botón."}
      </p>
    </RegistrationShell>
  );
}

interface AttendanceSuccessProps {
  result: AttendanceCheckInResult;
}

function AttendanceSuccess({
  result,
}: AttendanceSuccessProps) {
  const isLate = result.record.status === "late";

  return (
    <RegistrationShell>
      <div
        className={[
          "mx-auto flex h-20 w-20 items-center justify-center rounded-full",
          isLate
            ? "bg-amber-100 text-amber-700"
            : "bg-emerald-100 text-emerald-700",
        ].join(" ")}
      >
        {isLate ? (
          <Clock3
            aria-hidden="true"
            className="h-10 w-10"
          />
        ) : (
          <CheckCircle2
            aria-hidden="true"
            className="h-10 w-10"
          />
        )}
      </div>

      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
        Vivace Suite
      </p>

      <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
        {result.alreadyRegistered
          ? "Tu asistencia ya estaba registrada"
          : "Asistencia registrada"}
      </h1>

      <p className="mt-3 text-base text-slate-600">
        Hola, {result.member.name}.
      </p>

      <dl className="mt-6 space-y-4 rounded-2xl bg-slate-50 p-5 text-left">
        <div className="min-w-0">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Ensayo
          </dt>
          <dd className="mt-1 break-words text-base font-semibold text-slate-950">
            {result.session.title}
          </dd>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Hora
            </dt>
            <dd className="mt-1 text-sm font-semibold text-slate-950">
              {formatTime(result.record.checked_in_at)}
            </dd>
          </div>

          <div className="text-right">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Estado
            </dt>
            <dd
              className={[
                "mt-1 inline-flex rounded-full px-3 py-1 text-sm font-semibold",
                isLate
                  ? "bg-amber-100 text-amber-800"
                  : "bg-emerald-100 text-emerald-800",
              ].join(" ")}
            >
              {getStatusLabel(result.record.status)}
            </dd>
          </div>
        </div>
      </dl>

      {result.alreadyRegistered ? (
        <p className="mt-5 text-sm leading-6 text-slate-600">
          No se creó un registro duplicado; conservamos la
          asistencia registrada originalmente.
        </p>
      ) : null}
    </RegistrationShell>
  );
}

interface RegistrationShellProps {
  children: ReactNode;
}

function RegistrationShell({
  children,
}: RegistrationShellProps) {
  return (
    <main className="flex min-h-[calc(100dvh-8rem)] w-full items-center justify-center overflow-x-hidden px-4 py-8 sm:px-6">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
        {children}
      </section>
    </main>
  );
}

function AttendanceRegistrationLoading() {
  return (
    <RegistrationShell>
      <LoaderCircle
        aria-hidden="true"
        className="mx-auto h-9 w-9 animate-spin text-emerald-700"
      />

      <p className="mt-4 text-sm font-medium text-slate-600">
        Preparando el registro de asistencia...
      </p>
    </RegistrationShell>
  );
}
