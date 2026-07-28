import type {
  RepertoireItem,
  RepertoireStatus,
} from "@/types/repertoire";

interface RepertoireTableProps {
  repertoire: RepertoireItem[];
  onEdit: (item: RepertoireItem) => void;
  onArchive: (item: RepertoireItem) => void;
  onReactivate: (item: RepertoireItem) => void;
  onResources: (item: RepertoireItem) => void;
  onDetail: (item: RepertoireItem) => void;
}

interface ResourceIndicatorProps {
  icon: string;
  label: string;
  available: boolean;
}

interface ResourceProgress {
  completed: number;
  total: number;
  percentage: number;
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

    default:
      return "bg-slate-100 text-slate-700";
  }
}

function hasContent(
  value: string | null | undefined,
): boolean {
  return Boolean(value?.trim());
}

function getResourceProgress(
  item: RepertoireItem,
): ResourceProgress {
  const resources = [
    item.score_url,
    item.audio_url,
    item.video_url,
    item.translation,
    item.pronunciation,
    item.director_notes,
  ];

  const completed = resources.filter((resource) =>
    hasContent(resource),
  ).length;

  const total = resources.length;

  const percentage =
    total > 0
      ? Math.round((completed / total) * 100)
      : 0;

  return {
    completed,
    total,
    percentage,
  };
}

function getProgressBarClasses(
  percentage: number,
): string {
  if (percentage <= 33) {
    return "bg-red-500";
  }

  if (percentage <= 66) {
    return "bg-amber-500";
  }

  return "bg-emerald-600";
}

function ResourceIndicator({
  icon,
  label,
  available,
}: ResourceIndicatorProps) {
  const availabilityText = available
    ? "Disponible"
    : "No disponible";

  return (
    <span
      title={`${label}: ${availabilityText}`}
      aria-label={`${label}: ${availabilityText}`}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border text-sm ${
        available
          ? "border-emerald-200 bg-emerald-50"
          : "border-slate-200 bg-slate-100 grayscale opacity-45"
      }`}
    >
      {icon}
    </span>
  );
}

export default function RepertoireTable({
  repertoire,
  onEdit,
  onArchive,
  onReactivate,
  onResources,
  onDetail,
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

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                Recursos
              </th>

              <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-600">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {repertoire.map((item) => {
              const progress =
                getResourceProgress(item);

              return (
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
                    <div className="min-w-52 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-slate-700">
                          {progress.completed} de{" "}
                          {progress.total}
                        </span>

                        <span className="text-xs font-bold text-slate-500">
                          {progress.percentage}%
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-full rounded-full transition-all ${getProgressBarClasses(
                            progress.percentage,
                          )}`}
                          style={{
                            width: `${progress.percentage}%`,
                          }}
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <ResourceIndicator
                          icon="📄"
                          label="Partitura"
                          available={hasContent(
                            item.score_url,
                          )}
                        />

                        <ResourceIndicator
                          icon="🎧"
                          label="Audio"
                          available={hasContent(
                            item.audio_url,
                          )}
                        />

                        <ResourceIndicator
                          icon="🎥"
                          label="Video"
                          available={hasContent(
                            item.video_url,
                          )}
                        />

                        <ResourceIndicator
                          icon="🌎"
                          label="Traducción"
                          available={hasContent(
                            item.translation,
                          )}
                        />

                        <ResourceIndicator
                          icon="🗣️"
                          label="Pronunciación"
                          available={hasContent(
                            item.pronunciation,
                          )}
                        />

                        <ResourceIndicator
                          icon="📝"
                          label="Notas del director"
                          available={hasContent(
                            item.director_notes,
                          )}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onDetail(item)
                        }
                        className="rounded-lg border border-indigo-300 bg-white px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:border-indigo-700 hover:text-indigo-900"
                      >
                        👁 Ver
                      </button>

                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-700 hover:text-emerald-800"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onResources(item)
                        }
                        className="rounded-lg border border-sky-300 bg-white px-4 py-2 text-sm font-semibold text-sky-700 transition hover:border-sky-700 hover:text-sky-900"
                      >
                        📚 Recursos
                      </button>

                      {item.status ===
                      "Archivado" ? (
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}