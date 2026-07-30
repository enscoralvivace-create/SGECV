"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Button from "@/components/common/Button";
import TripBudgetFormModal from "@/components/trips/TripBudgetFormModal";

import {
  calculateTripBudgetSummary,
  createTripBudgetItem,
  deleteTripBudgetItem,
  getTripBudgetItems,
  updateTripBudgetItem,
} from "@/services/tripBudgetService";

import {
  TRIP_BUDGET_CATEGORY_LABELS,
  type TripBudgetItem,
  type TripBudgetItemFormData,
} from "@/types/tripBudget";

interface TripBudgetModalProps {
  tripId: string;
  tripName: string;
  onClose: () => void;
}

function formatCurrency(
  value: number,
): string {
  return new Intl.NumberFormat(
    "es-MX",
    {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    },
  ).format(value);
}

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null
  ) {
    const possibleError = error as {
      message?: unknown;
      details?: unknown;
      hint?: unknown;
      code?: unknown;
    };

    const parts = [
      possibleError.message,
      possibleError.details,
      possibleError.hint,
      possibleError.code
        ? `Código: ${possibleError.code}`
        : null,
    ].filter(
      (value): value is string =>
        typeof value === "string" &&
        value.trim().length > 0,
    );

    if (parts.length > 0) {
      return parts.join(" — ");
    }
  }

  return fallback;
}

function getDifferenceClasses(
  difference: number,
): string {
  if (difference > 0) {
    return "text-rose-700";
  }

  if (difference < 0) {
    return "text-emerald-700";
  }

  return "text-slate-700";
}

function getStatusLabel(
  difference: number,
  actualAmount: number,
): string {
  if (actualAmount === 0) {
    return "Pendiente";
  }

  if (difference > 0) {
    return "Excedido";
  }

  if (difference < 0) {
    return "Dentro del presupuesto";
  }

  return "Exacto";
}

function getStatusClasses(
  difference: number,
  actualAmount: number,
): string {
  if (actualAmount === 0) {
    return (
      "bg-slate-100 text-slate-700 " +
      "ring-slate-200"
    );
  }

  if (difference > 0) {
    return (
      "bg-rose-100 text-rose-700 " +
      "ring-rose-200"
    );
  }

  return (
    "bg-emerald-100 text-emerald-700 " +
    "ring-emerald-200"
  );
}

export default function TripBudgetModal({
  tripId,
  tripName,
  onClose,
}: TripBudgetModalProps) {
  const [items, setItems] =
    useState<TripBudgetItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [showForm, setShowForm] =
    useState(false);

  const [editingItem, setEditingItem] =
  useState<TripBudgetItem | null>(null);

  const [isDeleting, setIsDeleting] =
  useState<string | null>(null);

  const [error, setError] =
    useState("");

  async function loadBudget() {
    try {
      setLoading(true);
      setError("");

      const result =
        await getTripBudgetItems(
          tripId,
        );

      setItems(result);
    } catch (loadError: unknown) {
      setError(
        `No fue posible cargar el presupuesto: ${getErrorMessage(
          loadError,
          "Error desconocido.",
        )}`,
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadBudget();
  }, [tripId]);

  const summary = useMemo(
    () =>
      calculateTripBudgetSummary(
        items,
      ),
    [items],
  );

  async function handleSave(
    form: TripBudgetItemFormData,
  ) {
    try {
      setSaving(true);
      setError("");

      if (editingItem) {
  await updateTripBudgetItem(
    editingItem.id,
    tripId,
    form,
  );
} else {
  await createTripBudgetItem(
    tripId,
    form,
  );
}
      setEditingItem(null);
      setShowForm(false);

      await loadBudget();
    } catch (saveError: unknown) {
      const errorMessage =
        getErrorMessage(
          saveError,
          "Error desconocido.",
        );

      setError(
        `No fue posible guardar el concepto: ${errorMessage}`,
      );

      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }
function handleEdit(
  item: TripBudgetItem,
) {
  setEditingItem(item);

  setShowForm(true);
}
async function handleDelete(
  item: TripBudgetItem,
) {
  const confirmed =
    window.confirm(
      `¿Deseas eliminar el concepto "${item.description}"?`,
    );

  if (!confirmed) {
    return;
  }

  try {
    setIsDeleting(item.id);

    await deleteTripBudgetItem(
      item.id,
      tripId,
    );

    await loadBudget();
  } finally {
    setIsDeleting(null);
  }
}
  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 p-4">
        <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white text-slate-900 shadow-2xl">
          <div className="border-b border-slate-200 bg-white px-6 py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Presupuesto del viaje
                </h2>

                <p className="mt-1 text-sm font-medium text-slate-600">
                  {tripName}
                </p>
              </div>

              <Button
                variant="secondary"
                onClick={onClose}
              >
                Cerrar
              </Button>
            </div>
          </div>

          <div className="grid gap-4 border-b border-slate-200 bg-slate-50 p-6 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Presupuesto estimado
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900">
                {formatCurrency(
                  summary.totalEstimated,
                )}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Gasto real
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900">
                {formatCurrency(
                  summary.totalActual,
                )}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Diferencia
              </p>

              <p
                className={`mt-2 text-xl font-bold ${getDifferenceClasses(
                  summary.variance,
                )}`}
              >
                {formatCurrency(
                  summary.variance,
                )}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Ejecución
              </p>

              <p className="mt-2 text-xl font-bold text-indigo-700">
                {summary.executionPercentage.toFixed(
                  1,
                )}
                %
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Conceptos
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {items.length}{" "}
                {items.length === 1
                  ? "concepto registrado"
                  : "conceptos registrados"}
                .
              </p>
            </div>

            <Button
              onClick={() => {
                setError("");
                setShowForm(true);
              }}
            >
              + Nuevo concepto
            </Button>
          </div>

          <div className="flex-1 overflow-auto px-6 pb-6">
            {error && (
              <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {error}
              </div>
            )}

            {loading ? (
              <div className="py-14 text-center">
                <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-700" />

                <p className="mt-4 font-medium text-slate-600">
                  Cargando presupuesto...
                </p>
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                <p className="font-semibold text-slate-700">
                  Todavía no hay conceptos registrados.
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Agrega el primer concepto para
                  comenzar a construir el presupuesto.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full min-w-[900px] border-collapse text-left">
                  <thead className="bg-slate-50">
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-600">
                      <th className="px-5 py-4">
                        Categoría
                      </th>

                      <th className="px-5 py-4">
                        Concepto
                      </th>

                      <th className="px-5 py-4 text-right">
                        Estimado
                      </th>

                      <th className="px-5 py-4 text-right">
                        Real
                      </th>

                      <th className="px-5 py-4 text-right">
                        Diferencia
                      </th>

                      <th className="px-5 py-4 text-center">
                        Estado
                      </th>
                      <th className="px-5 py-4 text-center">
  Acciones
</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200 bg-white">
                    {items.map((item) => {
                      const difference =
                        item.actualAmount -
                        item.estimatedAmount;

                      const statusLabel =
                        getStatusLabel(
                          difference,
                          item.actualAmount,
                        );

                      return (
                        <tr
                          key={item.id}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="px-5 py-4">
                            <span className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-700 ring-1 ring-inset ring-teal-200">
                              {
                                TRIP_BUDGET_CATEGORY_LABELS[
                                  item.category
                                ]
                              }
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <p className="font-semibold text-slate-900">
                              {item.description}
                            </p>

                            {item.notes && (
                              <p className="mt-1 max-w-sm text-sm text-slate-500">
                                {item.notes}
                              </p>
                            )}
                          </td>

                          <td className="px-5 py-4 text-right font-medium text-slate-700">
                            {formatCurrency(
                              item.estimatedAmount,
                            )}
                          </td>

                          <td className="px-5 py-4 text-right font-medium text-slate-700">
                            {formatCurrency(
                              item.actualAmount,
                            )}
                          </td>

                          <td
                            className={`px-5 py-4 text-right font-bold ${getDifferenceClasses(
                              difference,
                            )}`}
                          >
                            {formatCurrency(
                              difference,
                            )}
                          </td>

                          <td className="px-5 py-4 text-center">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusClasses(
                                difference,
                                item.actualAmount,
                              )}`}
                            >
                              {statusLabel}
                            </span>
                          </td>
                          <td className="px-5 py-4">
  <div className="flex justify-center gap-3">
    <button
      type="button"
      onClick={() =>
        handleEdit(item)
      }
      className="font-semibold text-blue-700 transition hover:text-blue-900"
    >
      Editar
    </button>

    <button
      type="button"
      disabled={
        isDeleting === item.id
      }
      onClick={() =>
        void handleDelete(item)
      }
      className="font-semibold text-rose-700 transition hover:text-rose-900 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isDeleting === item.id
        ? "Eliminando..."
        : "Eliminar"}
    </button>
  </div>
</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

            {showForm && (
        <TripBudgetFormModal
          initialForm={
            editingItem
              ? {
                  category: editingItem.category,
                  description: editingItem.description,
                  estimatedAmount: editingItem.estimatedAmount.toString(),
                  actualAmount: editingItem.actualAmount.toString(),
                  notes: editingItem.notes ?? "",
                }
              : undefined
          }
          isSaving={saving}
          onSave={handleSave}
          onClose={() => {
            setEditingItem(null);
            setShowForm(false);
          }}
        />
      )}
    </>
  );
}