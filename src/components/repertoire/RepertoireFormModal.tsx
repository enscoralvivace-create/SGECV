"use client";

import type {
  Dispatch,
  FormEvent,
  SetStateAction,
} from "react";

import Button from "@/components/common/Button";

import type {
  RepertoireFormData,
  RepertoireItem,
  RepertoireStatus,
} from "@/types/repertoire";

interface RepertoireFormModalProps {
  form: RepertoireFormData;
  setForm: Dispatch<
    SetStateAction<RepertoireFormData>
  >;
  editingItem: RepertoireItem | null;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (
    event: FormEvent<HTMLFormElement>,
  ) => void;
}

const repertoireStatuses: RepertoireStatus[] = [
  "Activo",
  "En estudio",
  "Archivado",
];

export default function RepertoireFormModal({
  form,
  setForm,
  editingItem,
  isSaving,
  onClose,
  onSubmit,
}: RepertoireFormModalProps) {
  function updateField<
    Field extends keyof RepertoireFormData,
  >(
    field: Field,
    value: RepertoireFormData[Field],
  ): void {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8">
      <div className="max-h-full w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {editingItem
                ? "Editar obra"
                : "Nueva obra"}
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              {editingItem
                ? "Actualiza la información de la obra."
                : "Registra una nueva obra en el repertorio."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Cerrar formulario"
            className="rounded-lg px-3 py-2 text-xl font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-6 px-6 py-6"
        >
          <div>
            <label
              htmlFor="repertoire-title"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Título de la obra *
            </label>

            <input
              id="repertoire-title"
              type="text"
              value={form.title}
              onChange={(event) =>
                updateField(
                  "title",
                  event.target.value,
                )
              }
              placeholder="Ej. Ave Verum Corpus"
              required
              disabled={isSaving}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="repertoire-composer"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Compositor
              </label>

              <input
                id="repertoire-composer"
                type="text"
                value={form.composer}
                onChange={(event) =>
                  updateField(
                    "composer",
                    event.target.value,
                  )
                }
                placeholder="Ej. Wolfgang Amadeus Mozart"
                disabled={isSaving}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="repertoire-arranger"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Arreglista
              </label>

              <input
                id="repertoire-arranger"
                type="text"
                value={form.arranger}
                onChange={(event) =>
                  updateField(
                    "arranger",
                    event.target.value,
                  )
                }
                placeholder="Opcional"
                disabled={isSaving}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <label
                htmlFor="repertoire-key"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Tonalidad
              </label>

              <input
                id="repertoire-key"
                type="text"
                value={form.key}
                onChange={(event) =>
                  updateField(
                    "key",
                    event.target.value,
                  )
                }
                placeholder="Ej. Re mayor"
                disabled={isSaving}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="repertoire-duration"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Duración en minutos
              </label>

              <input
                id="repertoire-duration"
                type="number"
                min="0"
                step="0.5"
                value={form.durationMinutes}
                onChange={(event) =>
                  updateField(
                    "durationMinutes",
                    event.target.value,
                  )
                }
                placeholder="Ej. 4.5"
                disabled={isSaving}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="repertoire-status"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Estado
              </label>

              <select
                id="repertoire-status"
                value={form.status}
                onChange={(event) =>
                  updateField(
                    "status",
                    event.target
                      .value as RepertoireStatus,
                  )
                }
                disabled={isSaving}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                {repertoireStatuses.map(
                  (status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="repertoire-notes"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Notas
            </label>

            <textarea
              id="repertoire-notes"
              value={form.notes}
              onChange={(event) =>
                updateField(
                  "notes",
                  event.target.value,
                )
              }
              placeholder="Observaciones, versión, dificultad, solistas u otra información."
              rows={4}
              disabled={isSaving}
              className="w-full resize-y rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>

            <Button
              type="submit"
              disabled={isSaving}
            >
              {isSaving
                ? "Guardando..."
                : editingItem
                  ? "Guardar cambios"
                  : "Guardar obra"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}