"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CheckCircle2,
  Clock3,
  QrCode,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";

import {
  QRCodeSVG,
} from "qrcode.react";

import VivaceButton from "@/components/ui/VivaceButton";
import VivaceCard from "@/components/ui/VivaceCard";
import VivaceLoading from "@/components/ui/VivaceLoading";
import VivaceStatCard from "@/components/ui/VivaceStatCard";

import {
  getAttendanceCount,
  getOrCreateAttendanceSession,
} from "@/services/attendanceService";

import type {
  AttendanceSession,
} from "@/types/attendance";

import type {
  Rehearsal,
} from "@/types/rehearsal";

import useUserAccess from "@/hooks/useUserAccess";

interface AttendanceQrCardProps {
  rehearsal: Rehearsal;
}

function formatTime(
  dateString: string,
): string {
  return new Intl.DateTimeFormat(
    "es-MX",
    {
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(
    new Date(dateString),
  );
}

export default function AttendanceQrCard({
  rehearsal,
}: AttendanceQrCardProps) {
  const {
    hasPermission,
    isLoading: isLoadingAccess,
  } = useUserAccess();

  const canManageAttendance =
    hasPermission(
      "attendance.manage",
    );
  const [
    session,
    setSession,
  ] =
    useState<AttendanceSession | null>(
      null,
    );

  const [
    attendanceCount,
    setAttendanceCount,
  ] = useState(0);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState<string | null>(null);

  const loadSession =
    useCallback(async (): Promise<void> => {
      setLoading(true);
      setErrorMessage(null);

      try {
        const currentSession =
          await getOrCreateAttendanceSession(
            rehearsal,
          );

        setSession(
          currentSession,
        );

        const count =
          await getAttendanceCount(
            currentSession.id,
          );

        setAttendanceCount(
          count,
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "No fue posible preparar el QR.";

        setErrorMessage(
          message,
        );
      } finally {
        setLoading(false);
      }
    }, [rehearsal]);

  useEffect(() => {
    if (
      isLoadingAccess ||
      !canManageAttendance
    ) {
      return;
    }

    void loadSession();
  }, [
    canManageAttendance,
    isLoadingAccess,
    loadSession,
  ]);

  const qrUrl =
    useMemo(() => {
      if (!session) {
        return "";
      }

      const baseUrl =
        typeof window !==
        "undefined"
          ? window.location.origin
          : "";

      return `${baseUrl}/asistencias/registrar?token=${session.qr_token}`;
    }, [session]);

  if (
    isLoadingAccess
  ) {
    return (
      <VivaceLoading
        message="Verificando permisos..."
        variant="card"
        className="min-h-[260px] sm:min-h-[320px]"
      />
    );
  }

  if (!canManageAttendance) {
    return null;
  }

  if (loading) {
    return (
      <VivaceLoading
        message="Preparando el código QR..."
        variant="card"
        className="min-h-[260px] sm:min-h-[320px]"
      />
    );
  }

  if (
    errorMessage ||
    !session
  ) {
    return (
      <VivaceCard className="border-rose-200 bg-rose-50/70">
        <VivaceCard.Body className="p-4 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
              <TriangleAlert className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="font-bold text-rose-900">
                No se pudo generar el QR
              </p>

              <p className="mt-2 text-sm leading-6 text-rose-700">
                {errorMessage ??
                  "No fue posible preparar la sesión de asistencia."}
              </p>

              <VivaceButton
                variant="danger"
                size="sm"
                className="mt-4"
                leftIcon={
                  <RefreshCw className="h-4 w-4" />
                }
                onClick={() => {
                  void loadSession();
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

  return (
    <VivaceCard
      elevated={false}
      className="border-emerald-100 bg-emerald-50/50"
    >
      <VivaceCard.Body>
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-950 text-white shadow-sm">
            <QrCode className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="font-bold text-slate-950">
              Código QR de asistencia
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              Escanea este código desde un teléfono para registrar la llegada.
            </p>
          </div>
        </div>

        <div className="mt-5 flex justify-center sm:mt-6">
          <div className="w-full max-w-[280px] rounded-2xl border border-emerald-100 bg-white p-3 shadow-sm sm:rounded-3xl sm:p-5 [&>svg]:h-auto [&>svg]:w-full">
            <QRCodeSVG
              value={qrUrl}
              size={240}
              level="M"
              marginSize={2}
              title="Código QR de asistencia"
            />
          </div>
        </div>

        <div className="mt-4 hidden rounded-2xl sm:block border border-slate-200 bg-white px-4 py-3">
          <p className="text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Enlace de registro
          </p>

          <p className="mt-2 break-all text-center text-xs leading-5 text-slate-500">
            {qrUrl}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-5 sm:gap-4">
          <VivaceStatCard
            title="Registrados"
            value={attendanceCount}
            subtitle="Personas con asistencia capturada"
            icon={
              <CheckCircle2 className="h-5 w-5" />
            }
          />

          <VivaceStatCard
            title="Registro disponible hasta"
            value={
              formatTime(
                session.late_until,
              )
            }
            subtitle="Después se registrará como retardo"
            icon={
              <Clock3 className="h-5 w-5" />
            }
          />
        </div>
      </VivaceCard.Body>
    </VivaceCard>
  );
}