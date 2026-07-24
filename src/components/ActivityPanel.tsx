export default function ActivityPanel() {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            Próximas actividades
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Ensayos, conciertos y reuniones.
          </p>
        </div>

        <button
          type="button"
          className="rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900"
        >
          Crear evento
        </button>
      </div>

      <div className="mt-8 rounded-xl border border-dashed border-slate-300 px-6 py-12 text-center">
        <p className="font-semibold text-slate-700">
          No hay actividades programadas
        </p>

        <p className="mt-2 text-sm text-slate-500">
          Los próximos ensayos y conciertos aparecerán aquí.
        </p>
      </div>
    </article>
  );
}