interface ReportErrorStateProps {
  title?: string;
  message: string;
}

export default function ReportErrorState({
  title = "No fue posible cargar el reporte",
  message,
}: ReportErrorStateProps) {
  return (
    <section className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-8">
      <h2 className="font-semibold text-rose-900">
        {title}
      </h2>

      <p className="mt-2 text-sm text-rose-700">
        {message}
      </p>
    </section>
  );
}