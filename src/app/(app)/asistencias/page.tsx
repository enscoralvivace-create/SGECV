"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Lock,
  Play,
  QrCode,
  RefreshCw,
  TriangleAlert,
  UserRoundCheck,
  Users,
} from "lucide-react";

import {
  QRCodeSVG,
} from "qrcode.react";

import VivacePageHeader from "@/components/ui/VivacePageHeader";

import useUserAccess from "@/hooks/useUserAccess";

import {
  getAttendanceDashboardData,
  type AttendanceDashboardData,
  type AttendanceSessionSummary,
  updateAttendanceSessionStatus,
} from "@/services/attendanceAdminService";
import {
  getOrCreateAttendanceSession,
} from "@/services/attendanceService";
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

const REFRESH_INTERVAL_MS = 10_000;

function formatTime(dateString: string): string {
  return new Intl.DateTimeFormat(
    "es-MX",
    {
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(new Date(dateString));
}

function getOperationalState(
  summary: AttendanceSessionSummary,
  currentTime: number,
): "prepared" | "in_progress" | "closed" {
  const startsAt = new Date(
    summary.session.starts_at,
  ).getTime();
  const lateUntil = new Date(
    summary.session.late_until,
  ).getTime();

  if (
    !summary.session.is_active ||
    currentTime > lateUntil
  ) {
    return "closed";
  }

  return currentTime < startsAt
    ? "prepared"
    : "in_progress";
}

export default function AttendancePage() {
  const { hasPermission } = useUserAccess();
  const canManageAttendance = hasPermission(
    "attendance.manage",
  );

  const today = useMemo(() => new Date(), []);
  const todayString = useMemo(
    () => formatDateToISO(today),
    [today],
  );

  const mountedRef = useRef(false);
  const dashboardRequestInFlight = useRef(false);

  const [dashboardData, setDashboardData] =
    useState<AttendanceDashboardData | null>(null);
  const [todayRehearsal, setTodayRehearsal] =
    useState<Rehearsal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessingSession, setIsProcessingSession] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);
  const [appOrigin, setAppOrigin] = useState("");
  const [currentTime, setCurrentTime] = useState(0);

  const loadDashboard = useCallback(
    async (showInitialLoading = false): Promise<void> => {
      if (dashboardRequestInFlight.current) {
        return;
      }

      dashboardRequestInFlight.current = true;

      if (showInitialLoading && mountedRef.current) {
        setIsLoading(true);
      } else if (mountedRef.current) {
        setIsRefreshing(true);
      }

      try {
        const data = await getAttendanceDashboardData();

        if (mountedRef.current) {
          setDashboardData(data);
          setCurrentTime(Date.now());
          setErrorMessage(null);
        }
      } catch (error) {
        if (mountedRef.current) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "No fue posible actualizar las asistencias.",
          );
        }
      } finally {
        dashboardRequestInFlight.current = false;

        if (mountedRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [],
  );

  const loadTodayRehearsal = useCallback(
    async (): Promise<void> => {
      try {
        const exception =
          await getRehearsalExceptionByDate(todayString);
        const rehearsal = getRehearsalForDate(
          today,
          exception ? [exception] : [],
        );

        if (mountedRef.current) {
          setTodayRehearsal(rehearsal);
        }
      } catch (error) {
        if (mountedRef.current) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "No fue posible consultar el ensayo de hoy.",
          );
        }
      }
    },
    [today, todayString],
  );

  useEffect(() => {
    mountedRef.current = true;
    setAppOrigin(window.location.origin);

    void loadDashboard(true);
    void loadTodayRehearsal();

    return () => {
      mountedRef.current = false;
    };
  }, [loadDashboard, loadTodayRehearsal]);

  const currentSession =
    dashboardData?.sessions.find(
      (summary) =>
        summary.session.rehearsal_date === todayString,
    ) ?? null;

  const operationalState = currentSession
    ? getOperationalState(
        currentSession,
        currentTime,
      )
    : null;
  const hasOpenRegistration =
    operationalState === "prepared" ||
    operationalState === "in_progress";

  useEffect(() => {
    if (!hasOpenRegistration) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void loadDashboard();
    }, REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [hasOpenRegistration, loadDashboard]);

  async function handlePrepareSession() {
    if (
      !canManageAttendance ||
      !todayRehearsal ||
      todayRehearsal.status === "cancelled" ||
      isProcessingSession
    ) {
      return;
    }

    setIsProcessingSession(true);
    setErrorMessage(null);

    try {
      const session =
        await getOrCreateAttendanceSession(
          todayRehearsal,
        );

      if (!session.is_active) {
        await updateAttendanceSessionStatus(
          session.id,
          true,
        );
      }

      await loadDashboard();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible iniciar la sesión de asistencia.",
      );
    } finally {
      setIsProcessingSession(false);
    }
  }

  async function handleCloseSession() {
    if (
      !canManageAttendance ||
      !currentSession ||
      isProcessingSession
    ) {
      return;
    }

    const confirmed = window.confirm(
      "¿Cerrar la sesión de asistencia? Después del cierre ya no se aceptarán registros por QR.",
    );

    if (!confirmed) {
      return;
    }

    setIsProcessingSession(true);
    setErrorMessage(null);

    try {
      await updateAttendanceSessionStatus(
        currentSession.session.id,
        false,
      );
      await loadDashboard();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible cerrar la sesión.",
      );
    } finally {
      setIsProcessingSession(false);
    }
  }

  const qrUrl =
    currentSession && hasOpenRegistration && appOrigin
      ? `${appOrigin}/asistencias/registrar?token=${currentSession.session.qr_token}`
      : "";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-5 sm:px-6 sm:py-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <VivacePageHeader
          eyebrow="Modo Ensayo"
          title="Pase de lista"
          description="Control operativo del ensayo, código QR y conteos de asistencia."
        />

        {errorMessage ? (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <p>{errorMessage}</p>
          </div>
        ) : null}

        {isLoading && !dashboardData ? (
          <div className="flex min-h-80 items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="text-center">
              <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-emerald-700" />
              <p className="mt-4 text-sm font-medium text-slate-600">
                Preparando Modo Ensayo...
              </p>
            </div>
          </div>
        ) : currentSession ? (
          <div className="space-y-5 sm:space-y-6">
            <SessionOverview
              summary={currentSession}
              operationalState={operationalState ?? "closed"}
              canManage={canManageAttendance}
              isProcessing={isProcessingSession}
              isRefreshing={isRefreshing}
              canReopen={Boolean(
                currentSession &&
                !currentSession.session.is_active &&
                currentTime <=
                  new Date(
                    currentSession.session.late_until,
                  ).getTime(),
              )}
              qrUrl={qrUrl}
              onClose={() => {
                void handleCloseSession();
              }}
              onReopen={() => {
                void handlePrepareSession();
              }}
            />
          </div>
        ) : (
          <EmptySessionState
            canManage={canManageAttendance}
            rehearsal={todayRehearsal}
            isProcessing={isProcessingSession}
            onPrepare={() => {
              void handlePrepareSession();
            }}
          />
        )}
      </div>
    </main>
  );
}

interface SessionOverviewProps {
  summary: AttendanceSessionSummary;
  operationalState: "prepared" | "in_progress" | "closed";
  canManage: boolean;
  isProcessing: boolean;
  isRefreshing: boolean;
  canReopen: boolean;
  qrUrl: string;
  onClose: () => void;
  onReopen: () => void;
}

function SessionOverview({
  summary,
  operationalState,
  canManage,
  isProcessing,
  isRefreshing,
  canReopen,
  qrUrl,
  onClose,
  onReopen,
}: SessionOverviewProps) {
  const session = summary.session;
  const isClosed = operationalState === "closed";

  const stateLabel =
    operationalState === "in_progress"
      ? "Ensayo en curso"
      : operationalState === "prepared"
      ? "Sesión preparada"
      : "Registro cerrado";

  return (
    <>
      <section className="overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-emerald-950 to-emerald-800 p-5 text-white sm:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                  <span
                    className={[
                      "h-2 w-2 rounded-full",
                      isClosed
                        ? "bg-slate-300"
                        : "bg-emerald-300",
                    ].join(" ")}
                  />
                  {stateLabel}
                </span>

                {isRefreshing ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-100">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Actualizando
                  </span>
                ) : null}
              </div>

              <h2 className="mt-4 break-words text-2xl font-bold sm:text-3xl">
                {session.title}
              </h2>

              <p className="mt-3 text-sm text-emerald-100 sm:text-base">
                {formatTime(session.starts_at)} – {formatTime(session.ends_at)}
              </p>
            </div>

            {canManage && (!isClosed || canReopen) ? (
              <button
                type="button"
                disabled={isProcessing}
                onClick={isClosed ? onReopen : onClose}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-emerald-950 shadow-sm transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isProcessing ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : isClosed ? (
                  <Play className="h-4 w-4" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
                {isClosed ? "Abrir sesión" : "Cerrar sesión"}
              </button>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-7">
          <TimeWindow
            label="Presente hasta"
            time={formatTime(session.present_until)}
            tone="emerald"
          />
          <TimeWindow
            label="Retardo hasta"
            time={formatTime(session.late_until)}
            tone="amber"
          />
          <TimeWindow
            label="Estado"
            time={isClosed ? "Cerrado" : "Activo"}
            tone="slate"
          />
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(320px,0.9fr)_1.4fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 text-center shadow-sm sm:p-7">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
            <QrCode className="h-6 w-6" />
          </div>

          <h3 className="mt-4 text-xl font-bold text-slate-950">
            Escanea para registrar tu asistencia
          </h3>

          {qrUrl ? (
            <div className="mx-auto mt-5 w-fit max-w-full rounded-3xl border-4 border-emerald-100 bg-white p-4 shadow-sm">
              <QRCodeSVG
                value={qrUrl}
                size={280}
                level="M"
                includeMargin
                className="h-auto w-full max-w-[280px]"
              />
            </div>
          ) : (
            <div className="mt-5 rounded-2xl bg-slate-100 px-4 py-10 text-sm font-medium text-slate-500">
              El QR no está disponible porque el registro está cerrado.
            </div>
          )}

          <div className="mt-5 space-y-2 text-left text-sm leading-6 text-slate-600">
            <p>
              Hasta las <strong>{formatTime(session.present_until)}</strong> se registra como <strong>Presente</strong>.
            </p>
            <p>
              Después y hasta las <strong>{formatTime(session.late_until)}</strong> se registra como <strong>Retardo</strong>.
            </p>
            <p>
              Después de esa hora, el registro queda cerrado.
            </p>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
                Resumen operativo
              </p>
              <h3 className="mt-1 text-xl font-bold text-slate-950">
                Asistencia actual
              </h3>
            </div>

            {!isClosed ? (
              <p className="text-xs text-slate-500">
                Actualización automática cada 10 segundos
              </p>
            ) : null}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
            <CountCard
              label="Presentes"
              value={summary.present}
              icon={<CheckCircle2 className="h-5 w-5" />}
              tone="emerald"
            />
            <CountCard
              label="Retardos"
              value={summary.late}
              icon={<Clock3 className="h-5 w-5" />}
              tone="amber"
            />
            <CountCard
              label="Registrados"
              value={summary.registered}
              icon={<UserRoundCheck className="h-5 w-5" />}
              tone="indigo"
            />
            <CountCard
              label="Pendientes estimados"
              value={summary.absent}
              icon={<Users className="h-5 w-5" />}
              tone="slate"
            />
          </div>

          <p className="mt-5 text-xs leading-5 text-slate-500">
            Los pendientes son una estimación basada en integrantes activos sin registro. No se crean ausencias automáticamente.
          </p>
        </article>
      </section>
    </>
  );
}

interface EmptySessionStateProps {
  canManage: boolean;
  rehearsal: Rehearsal | null;
  isProcessing: boolean;
  onPrepare: () => void;
}

function EmptySessionState({
  canManage,
  rehearsal,
  isProcessing,
  onPrepare,
}: EmptySessionStateProps) {
  const canPrepare =
    Boolean(rehearsal) &&
    rehearsal?.status !== "cancelled";

  return (
    <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center shadow-sm sm:px-8 sm:py-16">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <QrCode className="h-8 w-8" />
      </div>

      <h2 className="mt-5 text-2xl font-bold text-slate-950">
        No hay una sesión de asistencia para hoy
      </h2>

      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
        {canPrepare
          ? "Inicia Modo Ensayo para generar la sesión y mostrar el código QR."
          : "No existe un ensayo disponible para iniciar el pase de lista hoy."}
      </p>

      {canManage && canPrepare ? (
        <button
          type="button"
          disabled={isProcessing}
          onClick={onPrepare}
          className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-800 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isProcessing ? (
            <LoaderCircle className="h-5 w-5 animate-spin" />
          ) : (
            <Play className="h-5 w-5" />
          )}
          Iniciar Modo Ensayo
        </button>
      ) : null}

      {!canManage && canPrepare ? (
        <p className="mt-6 text-sm font-medium text-slate-500">
          Un usuario con permiso de gestión debe iniciar la sesión.
        </p>
      ) : null}
    </section>
  );
}

interface TimeWindowProps {
  label: string;
  time: string;
  tone: "emerald" | "amber" | "slate";
}

function TimeWindow({
  label,
  time,
  tone,
}: TimeWindowProps) {
  const toneClasses = {
    emerald: "bg-emerald-50 text-emerald-900",
    amber: "bg-amber-50 text-amber-900",
    slate: "bg-slate-100 text-slate-900",
  };

  return (
    <div className={`rounded-2xl p-4 ${toneClasses[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold">
        {time}
      </p>
    </div>
  );
}

interface CountCardProps {
  label: string;
  value: number;
  icon: ReactNode;
  tone: "emerald" | "amber" | "indigo" | "slate";
}

function CountCard({
  label,
  value,
  icon,
  tone,
}: CountCardProps) {
  const toneClasses = {
    emerald: "bg-emerald-50 text-emerald-900",
    amber: "bg-amber-50 text-amber-900",
    indigo: "bg-indigo-50 text-indigo-900",
    slate: "bg-slate-100 text-slate-900",
  };

  return (
    <div className={`rounded-2xl p-4 ${toneClasses[tone]}`}>
      <div className="flex items-center justify-between gap-2 opacity-75">
        <p className="text-sm font-medium">
          {label}
        </p>
        {icon}
      </div>
      <p className="mt-3 text-3xl font-bold">
        {value}
      </p>
    </div>
  );
}
