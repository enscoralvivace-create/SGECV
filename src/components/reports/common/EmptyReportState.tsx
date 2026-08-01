interface EmptyReportStateProps {
  title?: string;
  message: string;
}

export default function EmptyReportState({
  title = "No hay información disponible",
  message,
}: EmptyReportStateProps) {
  return (
    <div className="px-6 py-12 text-center">
      <p className="font-medium text-slate-700">
        {title}
      </p>

      <p className="mt-1 text-sm text-slate-500">
        {message}
      </p>
    </div>
  );
}