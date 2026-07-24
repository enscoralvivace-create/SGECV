import {
  CalendarDays,
  Music2,
  Users,
} from "lucide-react";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import SummaryCard from "@/components/dashboard/SummaryCard";
import TodayRehearsalCard from "@/components/dashboard/TodayRehearsalCard";

export default function DashboardPage() {
  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <DashboardHeader />

        <section className="grid gap-6 lg:grid-cols-2">
          <TodayRehearsalCard />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <SummaryCard
              title="Integrantes activos"
              value="—"
              description="Se conectará con Supabase"
              icon={<Users className="h-6 w-6" />}
            />

            <SummaryCard
              title="Asistencia promedio"
              value="—"
              description="Disponible al activar asistencias"
              icon={<Music2 className="h-6 w-6" />}
            />
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-100 p-3">
              <CalendarDays className="h-6 w-6 text-slate-600" />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500">
                Próximas actividades
              </p>

              <h2 className="text-xl font-bold text-slate-950">
                Agenda del ensamble
              </h2>
            </div>
          </div>

          <p className="mt-5 text-sm text-slate-500">
            Aquí mostraremos los próximos ensayos, conciertos y
            actividades registradas.
          </p>
        </section>
      </div>
    </main>
  );
}