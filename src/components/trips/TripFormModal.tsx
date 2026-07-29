"use client";

import type {
  Dispatch,
  FormEvent,
  SetStateAction,
} from "react";

import Button from "@/components/common/Button";

import type {
  Trip,
  TripFormData,
  TripStatus,
} from "@/types/trip";

interface TripFormModalProps {
  form: TripFormData;
  setForm: Dispatch<
    SetStateAction<TripFormData>
  >;
  editingTrip: Trip | null;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (
    event: FormEvent<HTMLFormElement>,
  ) => void;
}

const statusOptions: Array<{
  value: TripStatus;
  label: string;
}> = [
  {
    value: "planning",
    label: "Planeación",
  },
  {
    value: "active",
    label: "Activo",
  },
  {
    value: "completed",
    label: "Finalizado",
  },
  {
    value: "cancelled",
    label: "Cancelado",
  },
];

export default function TripFormModal({
  form,
  setForm,
  editingTrip,
  isSaving,
  onClose,
  onSubmit,
}: TripFormModalProps) {
  function updateField<
    Key extends keyof TripFormData,
  >(
    field: Key,
    value: TripFormData[Key],
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8">
      <div className="max-h-full w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
          <h2 className="text-2xl font-bold text-slate-900">
            {editingTrip
              ? "Editar viaje"
              : "Nuevo viaje"}
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            Registra la información general del
            viaje.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-6 px-6 py-6 sm:px-8"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Nombre del viaje *
              </span>

              <input
                type="text"
                value={form.name}
                onChange={(event) =>
                  updateField(
                    "name",
                    event.target.value,
                  )
                }
                placeholder="Ej. Corosfest Brasil 2026"
                disabled={isSaving}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Destino *
              </span>

              <input
                type="text"
                value={form.destination}
                onChange={(event) =>
                  updateField(
                    "destination",
                    event.target.value,
                  )
                }
                placeholder="Ej. Cascavel, Paraná, Brasil"
                disabled={isSaving}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Fecha de inicio
              </span>

              <input
                type="date"
                value={form.startDate}
                onChange={(event) =>
                  updateField(
                    "startDate",
                    event.target.value,
                  )
                }
                disabled={isSaving}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Fecha de finalización
              </span>

              <input
                type="date"
                value={form.endDate}
                min={form.startDate || undefined}
                onChange={(event) =>
                  updateField(
                    "endDate",
                    event.target.value,
                  )
                }
                disabled={isSaving}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Presupuesto estimado
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                value={form.estimatedBudget}
                onChange={(event) =>
                  updateField(
                    "estimatedBudget",
                    event.target.value,
                  )
                }
                placeholder="0.00"
                disabled={isSaving}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Estado
              </span>

              <select
                value={form.status}
                onChange={(event) =>
                  updateField(
                    "status",
                    event.target
                      .value as TripStatus,
                  )
                }
                disabled={isSaving}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                {statusOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Descripción
            </span>

            <textarea
              value={form.description}
              onChange={(event) =>
                updateField(
                  "description",
                  event.target.value,
                )
              }
              rows={4}
              placeholder="Información general, objetivos o detalles relevantes del viaje."
              disabled={isSaving}
              className="w-full resize-y rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </label>

          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            El responsable del viaje se agregará en
            una siguiente etapa, cuando conectemos el
            catálogo de integrantes.
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>

            <Button
              type="submit"
              disabled={isSaving}
            >
              {isSaving
                ? "Guardando..."
                : editingTrip
                  ? "Guardar cambios"
                  : "Crear viaje"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}