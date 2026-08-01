"use client";

import {
  useEffect,
  useState,
} from "react";

import Button from "@/components/common/Button";

import {
  EMPTY_TRIP_BUDGET_FORM,
  TRIP_BUDGET_CATEGORIES,
  TRIP_BUDGET_CATEGORY_LABELS,
  type TripBudgetItemFormData,
} from "@/types/tripBudget";

interface TripBudgetFormModalProps {
  initialForm?: TripBudgetItemFormData;

  onSave: (
    form: TripBudgetItemFormData,
  ) => Promise<void>;

  onClose: () => void;

  isSaving?: boolean;
}

export default function TripBudgetFormModal({
  initialForm,
  onSave,
  onClose,
  isSaving = false,
}: TripBudgetFormModalProps) {
  const [form, setForm] =
    useState<TripBudgetItemFormData>(
      initialForm ??
        EMPTY_TRIP_BUDGET_FORM,
    );

  const [validationError, setValidationError] =
    useState("");

  const isEditing =
    initialForm !== undefined;

  useEffect(() => {
    setForm(
      initialForm ??
        EMPTY_TRIP_BUDGET_FORM,
    );

    setValidationError("");
  }, [initialForm]);

  function updateField<
    K extends keyof TripBudgetItemFormData,
  >(
    key: K,
    value: TripBudgetItemFormData[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    setValidationError("");
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!form.description.trim()) {
      setValidationError(
        "Escribe la descripción del concepto.",
      );

      return;
    }

    const estimatedAmount =
      Number(form.estimatedAmount);

    const actualAmount =
      Number(form.actualAmount);

    if (
      form.estimatedAmount &&
      (
        !Number.isFinite(
          estimatedAmount,
        ) ||
        estimatedAmount < 0
      )
    ) {
      setValidationError(
        "El presupuesto estimado debe ser un número igual o mayor que cero.",
      );

      return;
    }

    if (
      form.actualAmount &&
      (
        !Number.isFinite(actualAmount) ||
        actualAmount < 0
      )
    ) {
      setValidationError(
        "El gasto real debe ser un número igual o mayor que cero.",
      );

      return;
    }

    await onSave(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 sm:items-center sm:p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white text-slate-900 shadow-2xl">
        <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-6 sm:py-5">
          <h2 className="text-xl font-bold text-slate-900">
            {isEditing
              ? "Editar concepto de presupuesto"
              : "Nuevo concepto de presupuesto"}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {isEditing
              ? "Actualiza la información del concepto seleccionado."
              : "Registra un nuevo concepto para el presupuesto del viaje."}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >
          {validationError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {validationError}
            </div>
          )}

          <div>
            <label
              htmlFor="trip-budget-category"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Categoría
            </label>

            <select
              id="trip-budget-category"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              value={form.category}
              disabled={isSaving}
              onChange={(event) =>
                updateField(
                  "category",
                  event.target
                    .value as TripBudgetItemFormData["category"],
                )
              }
            >
              {TRIP_BUDGET_CATEGORIES.map(
                (category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {
                      TRIP_BUDGET_CATEGORY_LABELS[
                        category
                      ]
                    }
                  </option>
                ),
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="trip-budget-description"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Descripción
            </label>

            <input
              id="trip-budget-description"
              type="text"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              value={form.description}
              disabled={isSaving}
              placeholder="Ej. Vuelo Puebla - São Paulo"
              onChange={(event) =>
                updateField(
                  "description",
                  event.target.value,
                )
              }
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="trip-budget-estimated"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Presupuesto estimado
              </label>

              <input
                id="trip-budget-estimated"
                type="number"
                min="0"
                step="0.01"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                value={form.estimatedAmount}
                disabled={isSaving}
                placeholder="0.00"
                onChange={(event) =>
                  updateField(
                    "estimatedAmount",
                    event.target.value,
                  )
                }
              />
            </div>

            <div>
              <label
                htmlFor="trip-budget-actual"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Gasto real
              </label>

              <input
                id="trip-budget-actual"
                type="number"
                min="0"
                step="0.01"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                value={form.actualAmount}
                disabled={isSaving}
                placeholder="0.00"
                onChange={(event) =>
                  updateField(
                    "actualAmount",
                    event.target.value,
                  )
                }
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="trip-budget-notes"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Notas
            </label>

            <textarea
              id="trip-budget-notes"
              rows={4}
              className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              value={form.notes}
              disabled={isSaving}
              placeholder="Información adicional o detalles de la cotización."
              onChange={(event) =>
                updateField(
                  "notes",
                  event.target.value,
                )
              }
            />
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              disabled={isSaving}
              onClick={onClose}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={isSaving}
            >
              {isSaving
                ? "Guardando..."
                : isEditing
                  ? "Guardar cambios"
                  : "Guardar concepto"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}