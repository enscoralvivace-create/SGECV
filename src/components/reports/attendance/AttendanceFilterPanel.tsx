"use client";

export interface AttendanceDateFilterState {
  startDate: string;
  endDate: string;
}

interface AttendanceFilterPanelProps {
  filters: AttendanceDateFilterState;
  isLoading: boolean;
  onChange: (
    field: keyof AttendanceDateFilterState,
    value: string,
  ) => void;
  onApply: () => void;
  onClear: () => void;
}

export default function AttendanceFilterPanel({
  filters,
  isLoading,
  onChange,
  onApply,
  onClear,
}: AttendanceFilterPanelProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Filtrar por periodo
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Deja ambas fechas vacías para incluir todo el
          historial disponible.
        </p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_auto] xl:items-end">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Fecha inicial
          </span>

          <input
            type="date"
            value={filters.startDate}
            onChange={(event) => {
              onChange(
                "startDate",
                event.target.value,
              );
            }}
            className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Fecha final
          </span>

          <input
            type="date"
            value={filters.endDate}
            onChange={(event) => {
              onChange(
                "endDate",
                event.target.value,
              );
            }}
            className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
          />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onApply}
            disabled={isLoading}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Aplicar filtros
          </button>

          <button
            type="button"
            onClick={onClear}
            disabled={isLoading}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            Limpiar
          </button>
        </div>
      </div>
    </section>
  );
}