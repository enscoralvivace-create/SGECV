"use client";

interface AttendanceExportButtonProps {
  isLoading: boolean;
  isExporting: boolean;
  isDisabled?: boolean;
  onExport: () => void;
}

export default function AttendanceExportButton({
  isLoading,
  isExporting,
  isDisabled = false,
  onExport,
}: AttendanceExportButtonProps) {
  return (
    <button
      type="button"
      onClick={onExport}
      disabled={
        isLoading ||
        isExporting ||
        isDisabled
      }
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:bg-slate-300"
    >
      <DownloadIcon />

      {isExporting
        ? "Generando PDF..."
        : "Exportar PDF"}
    </button>
  );
}

function DownloadIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}