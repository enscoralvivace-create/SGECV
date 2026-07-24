import AttendanceDashboard from "@/components/attendance/AttendanceDashboard";

export default function AttendancePage() {
  return (
    <main className="min-h-screen bg-slate-100">
      <header className="bg-emerald-900 px-6 py-6 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200">
            Vivace Suite
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Asistencias
          </h1>

          <p className="mt-2 text-emerald-100">
            Control de asistencia, puntualidad e historial
            de ensayos.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <AttendanceDashboard />
      </section>
    </main>
  );
}