import Link from "next/link";

export default function QuickActions() {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-bold text-slate-900">
        Acciones rápidas
      </h3>

      <div className="mt-5 space-y-3">
        <Link
          href="/integrantes"
          className="block rounded-xl border border-slate-200 px-4 py-4 font-semibold text-slate-700 transition hover:border-emerald-700 hover:bg-emerald-50 hover:text-emerald-900"
        >
          + Registrar integrante
        </Link>

        <button
          type="button"
          className="w-full rounded-xl border border-slate-200 px-4 py-4 text-left font-semibold text-slate-700 transition hover:border-emerald-700 hover:bg-emerald-50 hover:text-emerald-900"
        >
          + Crear ensayo
        </button>

        <button
          type="button"
          className="w-full rounded-xl border border-slate-200 px-4 py-4 text-left font-semibold text-slate-700 transition hover:border-emerald-700 hover:bg-emerald-50 hover:text-emerald-900"
        >
          Generar asistencia QR
        </button>
      </div>
    </article>
  );
}