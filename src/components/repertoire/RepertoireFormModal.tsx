"use client";

import type {
  Dispatch,
  FormEvent,
  SetStateAction,
} from "react";

import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";

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

const statuses: RepertoireStatus[] = [
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
  return (
    <Modal
      open={true}
      title={
        editingItem
          ? "Editar obra"
          : "Nueva obra"
      }
      maxWidth="xl"
      onClose={onClose}
    >
      <form
        onSubmit={onSubmit}
        className="space-y-5"
      >
        <div>
          <label
            htmlFor="title"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Título de la obra *
          </label>

          <input
            id="title"
            type="text"
            value={form.title}
            onChange={(event) =>
              setForm((currentForm) => ({
                ...currentForm,
                title: event.target.value,
              }))
            }
            disabled={isSaving}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="composer"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Compositor
            </label>

            <input
              id="composer"
              type="text"
              value={form.composer}
              onChange={(event) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  composer: event.target.value,
                }))
              }
              disabled={isSaving}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label
              htmlFor="arranger"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Arreglista
            </label>

            <input
              id="arranger"
              type="text"
              value={form.arranger}
              onChange={(event) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  arranger: event.target.value,
                }))
              }
              disabled={isSaving}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <label
              htmlFor="key"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Tonalidad
            </label>

            <input
              id="key"
              type="text"
              value={form.key}
              onChange={(event) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  key: event.target.value,
                }))
              }
              disabled={isSaving}
              placeholder="Ej. Sol mayor"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label
              htmlFor="durationMinutes"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Duración en minutos
            </label>

            <input
              id="durationMinutes"
              type="number"
              min="1"
              value={form.durationMinutes}
              onChange={(event) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  durationMinutes:
                    event.target.value,
                }))
              }
              disabled={isSaving}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label
              htmlFor="status"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Estado
            </label>

            <select
              id="status"
              value={form.status}
              onChange={(event) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  status:
                    event.target
                      .value as RepertoireStatus,
                }))
              }
              disabled={isSaving}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            >
              {statuses.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="notes"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Observaciones
          </label>

          <textarea
            id="notes"
            rows={4}
            value={form.notes}
            onChange={(event) =>
              setForm((currentForm) => ({
                ...currentForm,
                notes: event.target.value,
              }))
            }
            disabled={isSaving}
            className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        <div className="flex justify-end gap-3">
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
            loading={isSaving}
          >
            {editingItem
              ? "Guardar cambios"
              : "Registrar obra"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}