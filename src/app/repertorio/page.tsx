"use client";

import Link from "next/link";

import Button from "@/components/common/Button";
import { useRepertoire } from "@/hooks/useRepertoire";

function formatDuration(
  durationMinutes: number | null,
): string {
  if (durationMinutes === null) {
    return "Sin duración";
  }

  return `${durationMinutes} min`;
}

function getStatusClasses(
  status: string,
): string {
  switch (status) {
    case "Activo":
      return "bg-emerald-100 text-emerald-800";

    case "En estudio":
      return "bg-amber-100 text-amber-800";

    case "Archivado":
      return "bg-slate-200 text-slate-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function RepertoirePage() {
  const {
    repertoire,
    loading,
    error,
    refreshRepertoire,
  } = useRepertoire();

  function handleCreateItem(): void {
    console.log(
      "El formulario de nueva obra se implementará en el siguiente paso.",
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="bg-emerald-900 px-6 py-6 text-white">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="text-sm font-semibold text-emerald-200 transition hover:text-white"
          >
            ← Volver al panel
          </Link>

          <h1 className="mt-4 text-3xl font-bold">
            Repertorio
          </h1>

          <p className="mt-2 text-emerald-100">
            Administración de las obras del
            Ensamble Coral Vivace.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Lista de obras
            </h2>

            <p className="mt-1 text-slate-600">
              {repertoire.length}{" "}
              {repertoire.length === 1
                ? "obra registrada"
                : "obras registradas"}
              .
            </p>
          </div>

          <Button onClick={handleCreateItem}>
            + Nueva obra
          </Button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            <p>
              No fue posible cargar el
              repertorio: {error}
            </p>

            <button
              type="button"
              onClick={() => {
                void refreshRepertoire();
              }}
              className="mt-3 font-semibold underline underline-offset-4"
            >
              Intentar nuevamente
            </button>
          </div>
        )}

        {loading && (
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center text-slate-600 shadow-sm">
            Cargando repertorio...
          </div>
        )}

        {!loading &&
          !error &&
          repertoire.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">
                Todavía no hay obras
                registradas
              </h3>

              <p className="mt-2 text-slate-600">
                Agrega la primera obra del
                repertorio del ensamble.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          repertoire.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                        Obra
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                        Compositor
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                        Arreglista
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                        Tonalidad
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                        Duración
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                        Estado
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {repertoire.map((item) => (
                      <tr
                        key={item.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-900">
                            {item.title}
                          </p>

                          {item.notes && (
                            <p className="mt-1 max-w-md text-sm text-slate-500">
                              {item.notes}
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {item.composer ??
                            "Sin especificar"}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {item.arranger ??
                            "Sin especificar"}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {item.key ??
                            "Sin especificar"}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {formatDuration(
                            item.duration_minutes,
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getStatusClasses(
                              item.status,
                            )}`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
      </section>
    </main>
  );
}