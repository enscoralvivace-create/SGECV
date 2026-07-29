"use client";

import StatusBadge from "@/components/common/StatusBadge";

import type {
  Trip,
  TripStatus,
} from "@/types/trip";

interface TripsTableProps {
  trips: Trip[];
  search: string;
  isLoading: boolean;
  processingId: string | null;
  onEdit: (trip: Trip) => void;
  onManageMembers: (trip: Trip) => void;
  onManageCharges: (trip: Trip) => void;
  onChangeStatus: (
    trip: Trip,
    status: TripStatus,
  ) => void;
}

function formatDate(
  date: string | null,
): string {
  if (!date) {
    return "Sin definir";
  }

  const [year, month, day] =
    date.split("-");

  if (!year || !month || !day) {
    return date;
  }

  return `${day}/${month}/${year}`;
}

function formatCurrency(
  amount: number | null,
): string {
  if (amount === null) {
    return "Sin definir";
  }

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
}

function getStatusLabel(
  status: TripStatus,
): string {
  const labels: Record<
    TripStatus,
    string
  > = {
    planning: "Planeación",
    active: "Activo",
    completed: "Finalizado",
    cancelled: "Cancelado",
  };

  return labels[status];
}

export default function TripsTable({
  trips,
  search,
  isLoading,
  processingId,
  onEdit,
  onManageMembers,
  onManageCharges,
  onChangeStatus,
}: TripsTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {isLoading ? (
        <div className="px-6 py-16 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-emerald-800" />

          <p className="mt-4 font-medium text-slate-600">
            Cargando viajes...
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left">
            <thead className="bg-slate-50 text-sm uppercase text-slate-600">
              <tr>
                <th className="px-6 py-4">
                  Viaje
                </th>

                <th className="px-6 py-4">
                  Destino
                </th>

                <th className="px-6 py-4">
                  Fechas
                </th>

                <th className="px-6 py-4">
                  Presupuesto
                </th>

                <th className="px-6 py-4">
                  Estado
                </th>

                <th className="px-6 py-4">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {trips.map((trip) => {
                const isProcessing =
                  processingId === trip.id;

                return (
                  <tr
                    key={trip.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">
                        {trip.name}
                      </p>

                      {trip.description && (
                        <p className="mt-1 max-w-xs truncate text-sm text-slate-500">
                          {trip.description}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {trip.destination}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      <div>
                        <span className="font-medium text-slate-700">
                          Inicio:
                        </span>{" "}
                        {formatDate(
                          trip.start_date,
                        )}
                      </div>

                      <div className="mt-1">
                        <span className="font-medium text-slate-700">
                          Fin:
                        </span>{" "}
                        {formatDate(
                          trip.end_date,
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 font-medium text-slate-700">
                      {formatCurrency(
                        trip.estimated_budget,
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge
                        status={getStatusLabel(
                          trip.status,
                        )}
                        className="text-sm"
                      />
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        <button
                          type="button"
                          onClick={() =>
                            onEdit(trip)
                          }
                          disabled={isProcessing}
                          className="font-semibold text-emerald-700 transition hover:text-emerald-900 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            onManageMembers(trip)
                          }
                          disabled={isProcessing}
                          className="font-semibold text-sky-700 transition hover:text-sky-900 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Participantes
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            onManageCharges(trip)
                          }
                          disabled={
                            isProcessing ||
                            trip.status ===
                              "cancelled"
                          }
                          className="font-semibold text-amber-700 transition hover:text-amber-900 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Cargos
                        </button>

                        {trip.status ===
                          "planning" && (
                          <button
                            type="button"
                            onClick={() =>
                              onChangeStatus(
                                trip,
                                "active",
                              )
                            }
                            disabled={
                              isProcessing
                            }
                            className="font-semibold text-sky-700 transition hover:text-sky-900 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isProcessing
                              ? "Procesando..."
                              : "Activar"}
                          </button>
                        )}

                        {trip.status ===
                          "active" && (
                          <button
                            type="button"
                            onClick={() =>
                              onChangeStatus(
                                trip,
                                "completed",
                              )
                            }
                            disabled={
                              isProcessing
                            }
                            className="font-semibold text-violet-700 transition hover:text-violet-900 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isProcessing
                              ? "Procesando..."
                              : "Finalizar"}
                          </button>
                        )}

                        {trip.status !==
                          "cancelled" &&
                          trip.status !==
                            "completed" && (
                            <button
                              type="button"
                              onClick={() =>
                                onChangeStatus(
                                  trip,
                                  "cancelled",
                                )
                              }
                              disabled={
                                isProcessing
                              }
                              className="font-semibold text-rose-700 transition hover:text-rose-900 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isProcessing
                                ? "Procesando..."
                                : "Cancelar"}
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {trips.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-14 text-center text-slate-500"
                  >
                    {search.trim()
                      ? "No se encontraron viajes con esa búsqueda."
                      : "Todavía no hay viajes registrados."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}