import AttendanceDashboard from "@/components/attendance/AttendanceDashboard";
import VivacePageHeader from "@/components/ui/VivacePageHeader";

export default function AttendancePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-5 sm:px-6 sm:py-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <VivacePageHeader
          eyebrow="Control coral"
          title="Asistencias"
          description="Control de asistencia, puntualidad e historial de ensayos."
        />

        <AttendanceDashboard />
      </div>
    </main>
  );
}
