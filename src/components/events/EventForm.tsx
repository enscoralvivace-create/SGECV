"use client";

import { FormEvent, useEffect, useState } from "react";
import type {
  ChoirEvent,
  ChoirEventPayload,
  EventStatus,
  EventType,
} from "@/types/event";
import {
  EVENT_STATUSES,
  EVENT_TYPES,
} from "@/utils/event";

interface EventFormProps {
  eventToEdit?: ChoirEvent | null;
  onCancel: () => void;
  onSubmit: (event: ChoirEventPayload) => Promise<void>;
}

const initialFormData: ChoirEventPayload = {
  title: "",
  event_type: "Ensayo",
  event_date: "",
  start_time: null,
  end_time: null,
  location: null,
  description: null,
  status: "Programado",
  is_extra: false,
};

export default function EventForm({
  eventToEdit,
  onCancel,
  onSubmit,
}: EventFormProps) {
  const [formData, setFormData] =
    useState<ChoirEventPayload>(initialFormData);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (eventToEdit) {
      setFormData({
        title: eventToEdit.title,
        event_type: eventToEdit.event_type,
        event_date: eventToEdit.event_date,
        start_time: eventToEdit.start_time,
        end_time: eventToEdit.end_time,
        location: eventToEdit.location,
        description: eventToEdit.description,
        status: eventToEdit.status,
        is_extra: eventToEdit.is_extra,
      });
    } else {
      setFormData(initialFormData);
    }

    setFormError("");
  }, [eventToEdit]);

  function updateField<K extends keyof ChoirEventPayload>(
    field: K,
    value: ChoirEventPayload[K]
  ) {
    setFormData((currentData) => ({
      ...currentData,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formData.title.trim()) {
      setFormError("El nombre del evento es obligatorio.");
      return;
    }

    if (!formData.event_date) {
      setFormError("La fecha del evento es obligatoria.");
      return;
    }

    if (
      formData.start_time &&
      formData.end_time &&
      formData.end_time <= formData.start_time
    ) {
      setFormError(
        "La hora de finalización debe ser posterior a la hora de inicio."
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError("");

      await onSubmit({
        ...formData,
        title: formData.title.trim(),
        location: formData.location?.trim() || null,
        description: formData.description?.trim() || null,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible guardar el evento.";

      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
      <div className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-6 sm:py-5">
          <div>
            <p className="text-sm font-medium text-indigo-600">
              Ensayos y eventos
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              {eventToEdit ? "Editar evento" : "Nuevo evento"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-3 py-1.5 text-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Cerrar formulario"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 pb-[max(1rem,var(--safe-bottom))] sm:p-6">
          {formError && (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {formError}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
            <div className="sm:col-span-2">
              <label
                htmlFor="event-title"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Nombre del evento
              </label>

              <input
                id="event-title"
                type="text"
                value={formData.title}
                onChange={(event) =>
                  updateField("title", event.target.value)
                }
                placeholder="Ej. Concierto de Navidad"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                required
              />
            </div>

            <div>
              <label
                htmlFor="event-type"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Tipo
              </label>

              <select
                id="event-type"
                value={formData.event_type}
                onChange={(event) =>
                  updateField(
                    "event_type",
                    event.target.value as EventType
                  )
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                {EVENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="event-status"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Estado
              </label>

              <select
                id="event-status"
                value={formData.status}
                onChange={(event) =>
                  updateField(
                    "status",
                    event.target.value as EventStatus
                  )
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                {EVENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="event-date"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Fecha
              </label>

              <input
                id="event-date"
                type="date"
                value={formData.event_date}
                onChange={(event) =>
                  updateField("event_date", event.target.value)
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                required
              />
            </div>

            <div className="flex items-end">
              <label className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-slate-300 px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={formData.is_extra}
                  onChange={(event) =>
                    updateField("is_extra", event.target.checked)
                  }
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />

                <span className="text-sm font-medium text-slate-700">
                  Es un evento extraordinario
                </span>
              </label>
            </div>

            <div>
              <label
                htmlFor="event-start-time"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Hora de inicio
              </label>

              <input
                id="event-start-time"
                type="time"
                value={formData.start_time ?? ""}
                onChange={(event) =>
                  updateField(
                    "start_time",
                    event.target.value || null
                  )
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label
                htmlFor="event-end-time"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Hora de finalización
              </label>

              <input
                id="event-end-time"
                type="time"
                value={formData.end_time ?? ""}
                onChange={(event) =>
                  updateField(
                    "end_time",
                    event.target.value || null
                  )
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="event-location"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Lugar
              </label>

              <input
                id="event-location"
                type="text"
                value={formData.location ?? ""}
                onChange={(event) =>
                  updateField("location", event.target.value)
                }
                placeholder="Ej. Teatro Principal"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="event-description"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Descripción o notas
              </label>

              <textarea
                id="event-description"
                value={formData.description ?? ""}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                rows={4}
                placeholder="Agrega información adicional del evento"
                className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Guardando..."
                : eventToEdit
                  ? "Guardar cambios"
                  : "Crear evento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}