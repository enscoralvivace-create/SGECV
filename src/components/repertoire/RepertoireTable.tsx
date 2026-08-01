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

interface ResourceProgress {
  completed: number;
  total: number;
  percentage: number;
}

function formatDuration(
  durationMinutes: number | null,
): string {
  return durationMinutes === null
    ? "Sin duración"
    : `${durationMinutes} min`;
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

  const completed = resources.filter(
    hasContent,
  ).length;

  return {
    completed,
    total: resources.length,
    percentage: Math.round(
      (completed / resources.length) * 100,
    ),
  };
}

function getProgressBarClasses(
  percentage: number,
): string {
  if (percentage <= 33) {
    return "bg-rose-500";
  }

  if (percentage <= 66) {
    return "bg-amber-500";
  }

  return "bg-emerald-600";
}

function ResourceProgressView({
  item,
}: {
  item: RepertoireItem;
}) {
  const progress =
    getResourceProgress(item);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-xs font-semibold">
        <span className="text-slate-600">
          {progress.completed} de{" "}
          {progress.total} recursos
        </span>

        <span className="text-slate-500">
          {progress.percentage}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full ${getProgressBarClasses(
            progress.percentage,
          )}`}
          style={{
            width: `${progress.percentage}%`,
          }}
        />
      </div>
    </div>
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
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">
      <div className="space-y-3 p-3 md:hidden">
        {repertoire.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-base font-bold text-slate-950">
                  {item.title}
                </h3>

                <p className="mt-1 truncate text-sm text-slate-600">
                  {item.composer ??
                    "Compositor sin especificar"}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${getStatusClasses(
                  item.status,
                )}`}
              >
                {item.status}
              </span>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  Tonalidad
                </dt>
                <dd className="mt-1 truncate text-sm font-semibold text-slate-800">
                  {item.key ??
                    "Sin especificar"}
                </dd>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  Duración
                </dt>
                <dd className="mt-1 truncate text-sm font-semibold text-slate-800">
                  {formatDuration(
                    item.duration_minutes,
                  )}
                </dd>
              </div>
            </dl>

            <div className="mt-4">
              <ResourceProgressView
                item={item}
              />
            </div>

            {item.notes ? (
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
                {item.notes}
              </p>
            ) : null}

            <div className="mt-4 grid grid-cols-2 gap-2">
              <ActionButton
                label="Ver"
                onClick={() =>
                  onDetail(item)
                }
              />

              <ActionButton
                label="Editar"
                onClick={() =>
                  onEdit(item)
                }
              />

              <ActionButton
                label="Recursos"
                onClick={() =>
                  onResources(item)
                }
              />

              <ActionButton
                label={
                  item.status === "Archivado"
                    ? "Reactivar"
                    : "Archivar"
                }
                onClick={() =>
                  item.status === "Archivado"
                    ? onReactivate(item)
                    : onArchive(item)
                }
              />
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[1100px] divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {[
                "Obra",
                "Compositor",
                "Arreglista",
                "Tonalidad",
                "Duración",
                "Estado",
                "Recursos",
                "Acciones",
              ].map((label) => (
                <th
                  key={label}
                  className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-600 last:text-right"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {repertoire.map((item) => (
              <tr
                key={item.id}
                className="transition hover:bg-emerald-50/30"
              >
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-900">
                    {item.title}
                  </p>

                  {item.notes ? (
                    <p className="mt-1 max-w-sm truncate text-sm text-slate-500">
                      {item.notes}
                    </p>
                  ) : null}
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

                <td className="min-w-56 px-5 py-4">
                  <ResourceProgressView
                    item={item}
                  />
                </td>

                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <ActionButton
                      label="Ver"
                      onClick={() =>
                        onDetail(item)
                      }
                    />
                    <ActionButton
                      label="Editar"
                      onClick={() =>
                        onEdit(item)
                      }
                    />
                    <ActionButton
                      label="Recursos"
                      onClick={() =>
                        onResources(item)
                      }
                    />
                    <ActionButton
                      label={
                        item.status ===
                        "Archivado"
                          ? "Reactivar"
                          : "Archivar"
                      }
                      onClick={() =>
                        item.status ===
                        "Archivado"
                          ? onReactivate(item)
                          : onArchive(item)
                      }
                    />
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

function ActionButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-700 hover:text-emerald-900 active:scale-[0.98]"
    >
      {label}
    </button>
  );
}
