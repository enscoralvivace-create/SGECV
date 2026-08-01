import type {
  Dispatch,
  FormEvent,
  SetStateAction,
} from "react";

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

const statusOptions: RepertoireStatus[] = [
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
    Key extends keyof RepertoireFormData,
  >(
    field: Key,
    value: RepertoireFormData[Key],
  ): void {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 sm:items-center sm:px-4 sm:py-8">
      <div className="max-h-[calc(100dvh-var(--safe-top))] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-h-[92vh] sm:rounded-3xl">
        <div className="sticky top-0 z-20 flex items-start justify-between border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-6 sm:py-5">
          <div>
            <p className="text-sm font-semibold text-emerald-700">
              Repertorio
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              {editingItem
                ? "Editar obra"
                : "Agregar obra"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Cerrar"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="grid gap-4 px-4 py-4 pb-[max(1rem,var(--safe-bottom))] sm:grid-cols-2 sm:gap-5 sm:px-6 sm:py-6">
            <div className="sm:col-span-2">
              <label
                htmlFor="repertoire-title"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Título *
              </label>

              <input
                id="repertoire-title"
                type="text"
                value={form.title}
                onChange={(event) => {
                  updateField(
                    "title",
                    event.target.value,
                  );
                }}
                disabled={isSaving}
                placeholder="Ej. Gloria"
                className="min-h-11 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-base sm:text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
              />
            </div>

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
                onChange={(event) => {
                  updateField(
                    "composer",
                    event.target.value,
                  );
                }}
                disabled={isSaving}
                placeholder="Ej. Antonio Vivaldi"
                className="min-h-11 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-base sm:text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
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
                onChange={(event) => {
                  updateField(
                    "arranger",
                    event.target.value,
                  );
                }}
                disabled={isSaving}
                placeholder="Sin especificar"
                className="min-h-11 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-base sm:text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
              />
            </div>

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
                onChange={(event) => {
                  updateField(
                    "key",
                    event.target.value,
                  );
                }}
                disabled={isSaving}
                placeholder="Ej. Re mayor"
                className="min-h-11 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-base sm:text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
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
                step="1"
                value={form.durationMinutes}
                onChange={(event) => {
                  updateField(
                    "durationMinutes",
                    event.target.value,
                  );
                }}
                disabled={isSaving}
                placeholder="Ej. 12"
                className="min-h-11 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-base sm:text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="repertoire-status"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Estado
              </label>

              <select
                id="repertoire-status"
                value={form.status}
                onChange={(event) => {
                  updateField(
                    "status",
                    event.target
                      .value as RepertoireStatus,
                  );
                }}
                disabled={isSaving}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
              >
                {statusOptions.map((status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="repertoire-notes"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Notas generales
              </label>

              <textarea
                id="repertoire-notes"
                rows={4}
                value={form.notes}
                onChange={(event) => {
                  updateField(
                    "notes",
                    event.target.value,
                  );
                }}
                disabled={isSaving}
                placeholder="Información general sobre la obra..."
                className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving
                ? "Guardando..."
                : editingItem
                  ? "Guardar cambios"
                  : "Guardar obra"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}