"use client";

import {
  CalendarDays,
  Clock3,
  LoaderCircle,
  TriangleAlert,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import AttendanceDashboard from "@/components/attendance/AttendanceDashboard";
import AttendanceQrCard from "@/components/attendance/AttendanceQrCard";
import VivacePageHeader from "@/components/ui/VivacePageHeader";
import useUserAccess from "@/hooks/useUserAccess";
import {
  getRehearsalActivitiesForDate,
} from "@/services/rehearsalService";
import type {
  Rehearsal,
} from "@/types/rehearsal";
import {
  getRehearsalsForDate,
} from "@/utils/rehearsal";

function formatActivityTime(time: string): string {
  const [hours = "0", minutes = "0"] = time.split(":");

  return new Intl.DateTimeFormat("es-MX", {
    hour: "numeric",
    minute: "2-digit",
  }).format(
    new Date(2000, 0, 1, Number(hours), Number(minutes)),
  );
}

export default function AttendancePage() {
  const { hasPermission } = useUserAccess();
  const canManageAttendance = hasPermission(
    "attendance.manage",
  );
  const today = useMemo(() => new Date(), []);
  const mountedRef = useRef(false);
  const requestIdRef = useRef(0);
  const [activities, setActivities] = useState<Rehearsal[]>(
    () => getRehearsalsForDate(today, []),
  );
  const [isLoadingActivities, setIsLoadingActivities] =
    useState(true);
  const [warning, setWarning] = useState<string | null>(null);

  const loadActivities = useCallback(async (): Promise<void> => {
    const requestId = ++requestIdRef.current;

    if (mountedRef.current) {
      setIsLoadingActivities(true);
    }

    try {
      const loadedActivities =
        await getRehearsalActivitiesForDate(today);

      if (
        mountedRef.current &&
        requestId === requestIdRef.current
      ) {
        setActivities(loadedActivities);
        setWarning(null);
      }
    } catch {
      if (
        mountedRef.current &&
        requestId === requestIdRef.current
      ) {
        setWarning(
          "No fue posible comprobar cambios remotos. Se conserva la programación regular local disponible.",
        );
      }
    } finally {
      if (
        mountedRef.current &&
        requestId === requestIdRef.current
      ) {
        setIsLoadingActivities(false);
      }
    }
  }, [today]);

  useEffect(() => {
    mountedRef.current = true;
    void loadActivities();

    return () => {
      mountedRef.current = false;
      requestIdRef.current += 1;
    };
  }, [loadActivities]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-5 sm:px-6 sm:py-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <VivacePageHeader
          eyebrow="Modo Ensayo"
          title="Pase de lista"
          description="Códigos QR y control operativo para cada actividad de hoy."
        />

        {warning ? (
          <div role="status" className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <p>{warning}</p>
          </div>
        ) : null}

        <section aria-labelledby="today-activities-title">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 sm:mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
                Programación de hoy
              </p>
              <h2 id="today-activities-title" className="mt-1 text-xl font-bold text-slate-950 sm:text-2xl">
                Actividades con pase de lista
              </h2>
            </div>

            {isLoadingActivities ? (
              <span role="status" className="inline-flex items-center gap-2 text-xs font-medium text-slate-500">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Comprobando cambios
              </span>
            ) : null}
          </div>

          {activities.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center shadow-sm sm:px-8 sm:py-16">
              <CalendarDays className="mx-auto h-10 w-10 text-slate-400" />
              <h3 className="mt-4 text-xl font-bold text-slate-950">
                No hay actividades de ensayo para hoy
              </h3>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
                Cuando exista un ensayo regular o extraordinario aparecerá aquí con su sesión independiente.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 xl:grid-cols-2 xl:items-start">
              {activities.map((activity) => (
                <article key={`${activity.date}-${activity.startTime}-${activity.title}`} className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <header className="border-b border-slate-200 bg-white px-5 py-4 sm:px-6 sm:py-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-950 text-white">
                        <CalendarDays className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="break-words text-lg font-bold text-slate-950 sm:text-xl">
                          {activity.title}
                        </h3>
                        <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                          <Clock3 className="h-4 w-4 shrink-0" />
                          {formatActivityTime(activity.startTime)} – {formatActivityTime(activity.endTime)}
                        </p>
                      </div>
                    </div>
                  </header>

                  <div className="p-3 sm:p-4">
                    <AttendanceQrCard rehearsal={activity} />
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="mt-8 sm:mt-10">
          <AttendanceDashboard canManage={canManageAttendance} />
        </section>
      </div>
    </main>
  );
}
