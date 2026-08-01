"use client";

import type {
  FormEvent,
  Dispatch,
  SetStateAction,
} from "react";

import type {
  Member,
  MemberFormData,
} from "@/types/member";

interface MemberFormModalProps {
  form: MemberFormData;
  setForm: Dispatch<
    SetStateAction<MemberFormData>
  >;
  editingMember: Member | null;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (
    event: FormEvent<HTMLFormElement>,
  ) => void;
}

export default function MemberFormModal({
  form,
  setForm,
  editingMember,
  isSaving,
  onClose,
  onSubmit,
}: MemberFormModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 sm:items-center sm:p-4">
      <div className="max-h-[calc(100dvh-var(--safe-top))] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-h-[92vh] sm:rounded-3xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-6 sm:py-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
              {editingMember
                ? "Editar integrante"
                : "Nuevo integrante"}
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              {editingMember
                ? "Actualiza la información del integrante."
                : "Registra la información general del integrante."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl text-slate-500 transition hover:bg-slate-100 active:scale-95 disabled:opacity-50"
            aria-label="Cerrar formulario"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          className="p-4 pb-[max(1rem,var(--safe-bottom))] sm:p-6"
        >
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
            <label className="block">
              <span className="mb-2 block font-semibold text-slate-700">
                Nombre *
              </span>

              <input
                type="text"
                required
                value={form.name}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    name: event.target.value,
                  }))
                }
                className="w-full min-h-11 rounded-xl border border-slate-300 px-4 py-2.5 text-base sm:text-sm text-slate-900 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block font-semibold text-slate-700">
                Apellidos *
              </span>

              <input
                type="text"
                required
                value={form.lastName}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    lastName:
                      event.target.value,
                  }))
                }
                className="w-full min-h-11 rounded-xl border border-slate-300 px-4 py-2.5 text-base sm:text-sm text-slate-900 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block font-semibold text-slate-700">
                Voz o función *
              </span>

              <select
                required
                value={form.voice}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    voice:
                      event.target
                        .value as MemberFormData["voice"],
                  }))
                }
                className="w-full min-h-11 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base sm:text-sm text-slate-900 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">
                  Selecciona una opción
                </option>

                <option value="Soprano">
                  Soprano
                </option>

                <option value="Contralto">
                  Contralto
                </option>

                <option value="Tenor">
                  Tenor
                </option>

                <option value="Bajo">
                  Bajo
                </option>

                <option value="Director">
                  Director
                </option>

                <option value="Pianista">
                  Pianista
                </option>

                <option value="Administración">
                  Administración
                </option>

                <option value="Otra">
                  Otra
                </option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block font-semibold text-slate-700">
                Estado
              </span>

              <select
                value={form.status}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    status:
                      event.target
                        .value as MemberFormData["status"],
                  }))
                }
                className="w-full min-h-11 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base sm:text-sm text-slate-900 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="Activo">
                  Activo
                </option>

                <option value="Permiso temporal">
                  Permiso temporal
                </option>

                <option value="Inactivo">
                  Inactivo
                </option>

                <option value="Baja definitiva">
                  Baja definitiva
                </option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block font-semibold text-slate-700">
                Teléfono
              </span>

              <input
                type="tel"
                value={form.phone}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    phone: event.target.value,
                  }))
                }
                className="w-full min-h-11 rounded-xl border border-slate-300 px-4 py-2.5 text-base sm:text-sm text-slate-900 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block font-semibold text-slate-700">
                Correo electrónico
              </span>

              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    email: event.target.value,
                  }))
                }
                className="w-full min-h-11 rounded-xl border border-slate-300 px-4 py-2.5 text-base sm:text-sm text-slate-900 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block font-semibold text-slate-700">
                Fecha de ingreso
              </span>

              <input
                type="date"
                value={form.joinDate}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    joinDate:
                      event.target.value,
                  }))
                }
                className="w-full min-h-11 rounded-xl border border-slate-300 px-4 py-2.5 text-base sm:text-sm text-slate-900 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block font-semibold text-slate-700">
                Fecha de nacimiento
              </span>

              <input
                type="date"
                value={form.birthDate}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    birthDate:
                      event.target.value,
                  }))
                }
                className="w-full min-h-11 rounded-xl border border-slate-300 px-4 py-2.5 text-base sm:text-sm text-slate-900 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block font-semibold text-slate-700">
                Contacto de emergencia
              </span>

              <input
                type="text"
                value={form.emergencyContact}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    emergencyContact:
                      event.target.value,
                  }))
                }
                className="w-full min-h-11 rounded-xl border border-slate-300 px-4 py-2.5 text-base sm:text-sm text-slate-900 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block font-semibold text-slate-700">
                Teléfono de emergencia
              </span>

              <input
                type="tel"
                value={form.emergencyPhone}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    emergencyPhone:
                      event.target.value,
                  }))
                }
                className="w-full min-h-11 rounded-xl border border-slate-300 px-4 py-2.5 text-base sm:text-sm text-slate-900 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-2 block font-semibold text-slate-700">
                Observaciones
              </span>

              <textarea
                rows={4}
                value={form.observations}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    observations:
                      event.target.value,
                  }))
                }
                className="w-full resize-none min-h-11 rounded-xl border border-slate-300 px-4 py-2.5 text-base sm:text-sm text-slate-900 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-emerald-800 px-5 py-3 font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving
                ? editingMember
                  ? "Actualizando..."
                  : "Guardando..."
                : editingMember
                  ? "Actualizar integrante"
                  : "Guardar integrante"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}