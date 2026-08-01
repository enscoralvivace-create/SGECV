interface ReportLoadingStateProps {
  message?: string;
}

export default function ReportLoadingState({
  message = "Cargando información del reporte...",
}: ReportLoadingStateProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-700" />

      <p className="mt-4 font-medium text-slate-700">
        {message}
      </p>
    </section>
  );
}