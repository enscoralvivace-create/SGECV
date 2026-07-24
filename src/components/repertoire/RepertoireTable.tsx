"use client";

import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";

import type {
  RepertoireItem,
  RepertoireStatus,
} from "@/types/repertoire";

interface RepertoireTableProps {
  items: RepertoireItem[];
  search: string;
  isLoading: boolean;
  processingId: number | null;
  onEdit: (item: RepertoireItem) => void;
  onStatusChange: (
    item: RepertoireItem,
    status: RepertoireStatus,
  ) => void;
}

function getStatusVariant(
  status: RepertoireStatus,
): "success" | "warning" | "neutral" {
  if (status === "Activo") {
    return "success";
  }

  if (status === "En estudio") {
    return "warning";
  }

  return "neutral";
}

export default function RepertoireTable({
  items,
  search,
  isLoading,
  processingId,
  onEdit,
  onStatusChange,
}: RepertoireTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center text-slate-600 shadow-sm">
        Cargando repertorio...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">
          {search.trim()
            ? "No se encontraron obras"
            : "Todavía no hay obras registradas"}
        </h3>

        <p className="mt-2 text-sm text-slate-600">
          {search.trim()
            ? "Prueba con otro título, compositor o arreglista."
            : "Registra la primera obra del repertorio."}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                Obra
              </th>

              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                Compositor
              </th>

              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                Arreglista
              </th>

              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                Tonalidad
              </th>

              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                Duración
              </th>

              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                Estado
              </th>

              <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-600">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {items.map((item) => {
              const isProcessing =
                processingId === item.id;

              return (
                <tr
                  key={item.id}
                  className="transition hover:bg-slate-50"
                >
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">
                      {item.title}
                    </p>

                    {item.notes && (
                      <p className="mt-1 max-w-xs truncate text-sm text-slate-500">
                        {item.notes}
                      </p>
                    )}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-700">
                    {item.composer ?? "—"}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-700">
                    {item.arranger ?? "—"}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-700">
                    {item.key ?? "—"}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-700">
                    {item.duration_minutes !== null
                      ? `${item.duration_minutes} min`
                      : "—"}
                  </td>

                  <td className="px-6 py-4">
                    <Badge
                      variant={getStatusVariant(
                        item.status,
                      )}
                    >
                      {item.status}
                    </Badge>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="secondary"
                        disabled={isProcessing}
                        onClick={() =>
                          onEdit(item)
                        }
                      >
                        Editar
                      </Button>

                      {item.status ===
                      "Archivado" ? (
                        <Button
                          disabled={isProcessing}
                          loading={isProcessing}
                          onClick={() =>
                            onStatusChange(
                              item,
                              "En estudio",
                            )
                          }
                        >
                          Restaurar
                        </Button>
                      ) : (
                        <Button
                          variant="danger"
                          disabled={isProcessing}
                          loading={isProcessing}
                          onClick={() =>
                            onStatusChange(
                              item,
                              "Archivado",
                            )
                          }
                        >
                          Archivar
                        </Button>
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