"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  QrCode,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import type { AttendanceSession } from "@/types/attendance";
import type { Rehearsal } from "@/types/rehearsal";
import {
  getAttendanceCount,
  getOrCreateAttendanceSession,
} from "@/services/attendanceService";

interface AttendanceQrCardProps {
  rehearsal: Rehearsal;
}

function formatTime(dateString: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateString));
}

export default function AttendanceQrCard({
  rehearsal,
}: AttendanceQrCardProps) {
  const [session, setSession] =
    useState<AttendanceSession | null>(null);

  const [attendanceCount, setAttendanceCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const loadSession = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const currentSession =
        await getOrCreateAttendanceSession(rehearsal);

      setSession(currentSession);

      const count = await getAttendanceCount(
        currentSession.id,
      );

      setAttendanceCount(count);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible preparar el QR.";

      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }, [rehearsal]);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  const qrUrl = useMemo(() => {
    if (!session) return "";

    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : "";

    return `${baseUrl}/asistencias/registrar?token=${session.qr_token}`;
  }, [session]);

  if (loading) {
    return (
      <div className="rounded-2xl bg-slate-50 p-6">
        <div className="flex min-h-64 items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  if (errorMessage || !session) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
        <div className="flex items-start gap-3">
          <TriangleAlert className="mt-0.5 h-5 w-5 text-red-600" />

          <div>
            <p className="font-semibold text-red-900">
              No se pudo generar el QR
            </p>

            <p className="mt-1 text-sm text-red-700">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={() => void loadSession()}
              className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-slate-50 p-5">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-indigo-100 p-2 text-indigo-600">
          <QrCode className="h-5 w-5" />
        </div>

        <div>
          <p className="font-semibold text-slate-900">
            Código QR de asistencia
          </p>

          <p className="text-sm text-slate-500">
            Escanea para registrar tu llegada
          </p>
        </div>
      </div>

      <div className="mt-5 flex justify-center">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <QRCodeSVG
            value={qrUrl}
            size={220}
            level="M"
            marginSize={2}
            title="Código QR de asistencia"
          />
        </div>
      </div>
      <p className="mt-4 break-all text-center text-xs text-slate-500">
  {qrUrl}
</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-white p-4">
          <div className="flex items-center gap-2 text-slate-500">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm">Registrados</span>
          </div>

          <p className="mt-1 text-2xl font-bold text-slate-950">
            {attendanceCount}
          </p>
        </div>

        <div className="rounded-xl bg-white p-4">
          <div className="flex items-center gap-2 text-slate-500">
            <Clock3 className="h-4 w-4" />
            <span className="text-sm">
              Registro disponible hasta
            </span>
          </div>

          <p className="mt-1 font-bold text-slate-950">
            {formatTime(session.late_until)}
          </p>
        </div>
      </div>
    </div>
  );
}