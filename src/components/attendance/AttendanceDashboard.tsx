"use client";

import {
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Lock,
  LockOpen,
  RefreshCw,
  TriangleAlert,
  UserRoundCheck,
  Users,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getAttendanceDashboardData,
  type AttendanceDashboardData,
  type AttendanceSessionSummary,
  updateAttendanceSessionStatus,
} from "@/services/attendanceAdminService";

function formatDate(date: string): string {
  const [year, month, day] = date.split("-");

  if (!year || !month || !day) {
    return date;
  }

  return new Intl.DateTimeFormat("es-MX", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(
    new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
    ),
  );
}

function formatTime(date: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function SessionStatusBadge({
  isActive,
}: {
  isActive: boolean;
}) {
  return (
    <span
      className={[
        "rounded-full px-3 py-1 text-xs font-semibold",
        isActive
          ? "bg-emerald-100 text-emerald-700"
          : "bg-slate-200 text-slate-700",
      ].join(" ")}
    >
      {isActive ? "Abierta" : "Cerrada"}
    </span>
  );
}

export default function AttendanceDashboard() {
  const [dashboardData, setDashboardData] =
    useState<AttendanceDashboardData | null>(null);

  const [loading, setLoading] = useState(true);

  const [processingSessionId, setProcessingSessionId] =
    useState<string | null>(null);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const result =
        await getAttendanceDashboardData();

      setDashboardData(result);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible cargar el módulo de asistencias.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  async function handleSessionStatusChange(
    summary: AttendanceSessionSummary,
  ) {
    const newStatus = !summary.session.is_active;

    setProcessingSessionId(summary.session.id);
    setErrorMessage(null);

    try {
      await updateAttendanceSessionStatus(
        summary.session.id,
        newStatus,
      );

      setDashboardData((currentData) => {
        if (!currentData) {
          return currentData;
        }

        return {
          ...currentData,
          sessions: currentData.sessions.map(
            (currentSummary) =>
              currentSummary.session.id ===
              summary.session.id
                ? {
                    ...currentSummary,
                    session: {
                      ...currentSummary.session,
                      is_active: newStatus,
                    },
                  }
                : currentSummary,
          ),
        };
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible actualizar la sesión.",
      );
    } finally {
      setProcessingSessionId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-80 items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="text-center">
          <RefreshCw className="mx-auto h-7 w-7 animate-spin text-slate-400" />

          <p className="mt-3 text-sm font-medium text-slate-600">
            Cargando asistencias...
          </p>
        </div>
      </div>
    );
  }

  if (errorMessage && !dashboardData) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-start gap-3">
          <TriangleAlert className="mt-0.5 h-6 w-6 shrink-0 text-red-600" />

          <div>
            <p className="font-bold text-red-900">
              No fue posible cargar Asistencias
            </p>

            <p className="mt-1 text-sm text-red-700">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={() => void loadDashboard()}
              className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const latestSession =
    dashboardData.sessions[0] ?? null;

  return (
    <div className="space-y-7">
      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {errorMessage}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Integrantes activos
            </span>

            <Users className="h-5 w-5 text-indigo-600" />
          </div>

          <p className="mt-3 text-3xl font-bold text-slate-950">
            {dashboardData.activeMembers}
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Sesiones registradas
            </span>

            <Clock3 className="h-5 w-5 text-indigo-600" />
          </div>

          <p className="mt-3 text-3xl font-bold text-slate-950">
            {dashboardData.totalSessions}
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Registros acumulados
            </span>

            <UserRoundCheck className="h-5 w-5 text-indigo-600" />
          </div>

          <p className="mt-3 text-3xl font-bold text-slate-950">
            {dashboardData.totalRecords}
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Asistencia promedio
            </span>

            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>

          <p className="mt-3 text-3xl font-bold text-slate-950">
            {dashboardData.averageAttendance}%
          </p>
        </article>
      </section>

      {latestSession && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                Sesión más reciente
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-950">
                {latestSession.session.title}
              </h2>

              <p className="mt-2 text-sm capitalize text-slate-600">
                {formatDate(
                  latestSession.session.rehearsal_date,
                )}
                {" · "}
                {formatTime(
                  latestSession.session.starts_at,
                )}
                {" – "}
                {formatTime(
                  latestSession.session.ends_at,
                )}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <SessionStatusBadge
                isActive={
                  latestSession.session.is_active
                }
              />

              <button
                type="button"
                disabled={
                  processingSessionId ===
                  latestSession.session.id
                }
                onClick={() =>
                  void handleSessionStatusChange(
                    latestSession,
                  )
                }
                className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {processingSessionId ===
                latestSession.session.id ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : latestSession.session.is_active ? (
                  <Lock className="h-4 w-4" />
                ) : (
                  <LockOpen className="h-4 w-4" />
                )}

                {latestSession.session.is_active
                  ? "Cerrar sesión"
                  : "Abrir sesión"}
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">
                Registrados
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-950">
                {latestSession.registered}
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-sm text-emerald-700">
                Presentes
              </p>

              <p className="mt-1 text-2xl font-bold text-emerald-900">
                {latestSession.present}
              </p>
            </div>

            <div className="rounded-2xl bg-amber-50 p-4">
              <p className="text-sm text-amber-700">
                Retardos
              </p>

              <p className="mt-1 text-2xl font-bold text-amber-900">
                {latestSession.late}
              </p>
            </div>

            <div className="rounded-2xl bg-indigo-50 p-4">
              <p className="text-sm text-indigo-700">
                Justificados
              </p>

              <p className="mt-1 text-2xl font-bold text-indigo-900">
                {latestSession.justified}
              </p>
            </div>

            <div className="rounded-2xl bg-red-50 p-4">
              <p className="text-sm text-red-700">
                Sin registro
              </p>

              <p className="mt-1 text-2xl font-bold text-red-900">
                {latestSession.absent}
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-xl font-bold text-slate-950">
            Historial de sesiones
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            Resumen de los ensayos con registro de
            asistencia.
          </p>
        </div>

        {dashboardData.sessions.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Clock3 className="mx-auto h-9 w-9 text-slate-300" />

            <p className="mt-3 font-semibold text-slate-700">
              Todavía no hay sesiones
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Las sesiones aparecerán después de generar
              un código QR.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-6 py-4">
                    Fecha
                  </th>

                  <th className="px-6 py-4">
                    Actividad
                  </th>

                  <th className="px-6 py-4">
                    Presentes
                  </th>

                  <th className="px-6 py-4">
                    Retardos
                  </th>

                  <th className="px-6 py-4">
                    Sin registro
                  </th>

                  <th className="px-6 py-4">
                    Asistencia
                  </th>

                  <th className="px-6 py-4">
                    Estado
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {dashboardData.sessions.map(
                  (summary) => (
                    <tr
                      key={summary.session.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 capitalize text-slate-600">
                        {formatDate(
                          summary.session.rehearsal_date,
                        )}
                      </td>

                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {summary.session.title}
                      </td>

                      <td className="px-6 py-4 text-emerald-700">
                        {summary.present}
                      </td>

                      <td className="px-6 py-4 text-amber-700">
                        {summary.late}
                      </td>

                      <td className="px-6 py-4 text-red-700">
                        {summary.absent}
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900">
                          {
                            summary.attendancePercentage
                          }
                          %
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <SessionStatusBadge
                          isActive={
                            summary.session.is_active
                          }
                        />
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}