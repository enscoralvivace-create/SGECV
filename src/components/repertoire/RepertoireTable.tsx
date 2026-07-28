import type {
  RepertoireItem,
  RepertoireStatus,
} from "@/types/repertoire";

interface RepertoireTableProps {
  repertoire: RepertoireItem[];
  onEdit: (item: RepertoireItem) => void;
  onArchive: (item: RepertoireItem) => void;
  onReactivate: (item: RepertoireItem) => void;
}

function formatDuration(
  durationMinutes: number | null,
): string {
  if (durationMinutes === null) {
    return "Sin duración";
  }

  return `${durationMinutes} min`;
}

function getStatusClasses(
  status: RepertoireStatus,
): string {
  switch (status) {
    case "Activo":
      return "bg-emerald-100 text-emerald-800";

    case "En estudio":
      return "bg-amber-100 text-amber-800";

    case "Archivado":
      return "bg-slate-200 text-slate-700";
  }
}

export default function RepertoireTable({
  repertoire,
  onEdit,
  onArchive,
  onReactivate,
}: RepertoireTableProps) {
  return (
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

              <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-600">
                Acciones
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
                  {item.composer ?? "Sin especificar"}
                </td>

                <td className="px-5 py-4 text-sm text-slate-700">
                  {item.arranger ?? "Sin especificar"}
                </td>

                <td className="px-5 py-4 text-sm text-slate-700">
                  {item.key ?? "Sin especificar"}
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

                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-700 hover:text-emerald-800"
                    >
                      Editar
                    </button>

                    {item.status === "Archivado" ? (
                      <button
                        type="button"
                        onClick={() =>
                          onReactivate(item)
                        }
                        className="rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-700 hover:text-emerald-900"
                      >
                        🔄 Reactivar
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          onArchive(item)
                        }
                        className="rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-700 transition hover:border-amber-700 hover:text-amber-900"
                      >
                        📦 Archivar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}