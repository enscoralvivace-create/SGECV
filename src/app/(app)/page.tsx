import {
  CalendarDays,
  Music2,
  Users,
} from "lucide-react";

import TodayRehearsalCard from "@/components/dashboard/TodayRehearsalCard";
import VivaceCard from "@/components/ui/VivaceCard";
import VivacePageHeader from "@/components/ui/VivacePageHeader";
import VivaceStatCard from "@/components/ui/VivaceStatCard";

export default function DashboardPage() {
  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <VivacePageHeader
          eyebrow="Panel principal"
          title="Dashboard"
          description="Consulta de forma rápida la actividad, asistencia y próximos compromisos del Ensamble Coral Vivace."
        />

        <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <TodayRehearsalCard />

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-1">
            <VivaceStatCard
              title="Integrantes activos"
              value="—"
              subtitle="Se conectará con Supabase"
              icon={
                <Users className="h-6 w-6" />
              }
            />

            <VivaceStatCard
              title="Asistencia promedio"
              value="—"
              subtitle="Disponible al activar estadísticas"
              icon={
                <Music2 className="h-6 w-6" />
              }
            />
          </div>
        </section>

        <section className="mt-6">
          <VivaceCard
            gradient
            className="overflow-hidden"
          >
            <div className="p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-950 text-white shadow-sm">
                    <CalendarDays className="h-6 w-6" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-emerald-800">
                      Próximas actividades
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-slate-950">
                      Agenda del ensamble
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                      Aquí mostraremos los próximos ensayos, conciertos y actividades registradas.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm font-semibold text-emerald-900 shadow-sm">
                  Próximamente
                </div>
              </div>
            </div>
          </VivaceCard>
        </section>
      </div>
    </main>
  );
}