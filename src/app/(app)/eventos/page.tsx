"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import EventCalendar from "@/components/events/EventCalendar";
import EventForm from "@/components/events/EventForm";
import VivacePageHeader from "@/components/ui/VivacePageHeader";

import useUserAccess from "@/hooks/useUserAccess";

import {
  createEvent,
  deleteEvent,
  getEvents,
  updateEvent,
} from "@/services/eventService";

import type {
  ChoirEvent,
  ChoirEventPayload,
  EventStatus,
  EventType,
} from "@/types/event";

import {
  EVENT_STATUSES,
  EVENT_TYPES,
  formatEventDate,
  formatEventSchedule,
  getEventCountdown,
  getEventTypeLabel,
} from "@/utils/event";

export default function EventsPage() {
  const {
    hasPermission,
  } = useUserAccess();

  const canManageEvents =
    hasPermission(
      "events.manage",
    );

  const [
    events,
    setEvents,
  ] =
    useState<ChoirEvent[]>([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    typeFilter,
    setTypeFilter,
  ] =
    useState<
      EventType | "Todos"
    >("Todos");

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<
      EventStatus | "Todos"
    >("Todos");

  const [
    isFormOpen,
    setIsFormOpen,
  ] = useState(false);

  const [
    eventToEdit,
    setEventToEdit,
  ] =
    useState<ChoirEvent | null>(
      null,
    );

  const loadEvents =
    useCallback(async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const data =
          await getEvents();

        setEvents(data);
      } catch (
        error: unknown
      ) {
        const message =
          error instanceof Error
            ? error.message
            : "No fue posible cargar los eventos.";

        setErrorMessage(
          message,
        );
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  const filteredEvents =
    useMemo(() => {
      const normalizedSearch =
        searchTerm
          .trim()
          .toLocaleLowerCase(
            "es-MX",
          );

      return events.filter(
        (choirEvent) => {
          const title =
            choirEvent.title.toLocaleLowerCase(
              "es-MX",
            );

          const location =
            choirEvent.location?.toLocaleLowerCase(
              "es-MX",
            ) ?? "";

          const description =
            choirEvent.description?.toLocaleLowerCase(
              "es-MX",
            ) ?? "";

          const matchesSearch =
            normalizedSearch.length ===
              0 ||
            title.includes(
              normalizedSearch,
            ) ||
            location.includes(
              normalizedSearch,
            ) ||
            description.includes(
              normalizedSearch,
            );

          const matchesType =
            typeFilter ===
              "Todos" ||
            choirEvent.event_type ===
              typeFilter;

          const matchesStatus =
            statusFilter ===
              "Todos" ||
            choirEvent.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesType &&
            matchesStatus
          );
        },
      );
    }, [
      events,
      searchTerm,
      typeFilter,
      statusFilter,
    ]);

  function openCreateForm(): void {
    if (!canManageEvents) {
      return;
    }

    setEventToEdit(null);
    setIsFormOpen(true);
  }

  function openEditForm(
    choirEvent: ChoirEvent,
  ): void {
    if (!canManageEvents) {
      return;
    }

    setEventToEdit(
      choirEvent,
    );

    setIsFormOpen(true);
  }

  function closeForm(): void {
    setIsFormOpen(false);
    setEventToEdit(null);
  }

  async function handleFormSubmit(
    eventPayload:
      ChoirEventPayload,
  ): Promise<void> {
    if (!canManageEvents) {
      throw new Error(
        "No tienes permiso para administrar eventos.",
      );
    }

    try {
      setErrorMessage("");

      if (eventToEdit) {
        await updateEvent(
          eventToEdit.id,
          eventPayload,
        );
      } else {
        await createEvent(
          eventPayload,
        );
      }

      await loadEvents();
      closeForm();
    } catch (
      error: unknown
    ) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible guardar el evento.";

      setErrorMessage(
        message,
      );

      throw error;
    }
  }

  async function handleDelete(
    choirEvent: ChoirEvent,
  ): Promise<void> {
    if (!canManageEvents) {
      return;
    }

    const confirmed =
      window.confirm(
        `¿Deseas eliminar el evento "${choirEvent.title}"?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setErrorMessage("");

      await deleteEvent(
        choirEvent.id,
      );

      setEvents(
        (currentEvents) =>
          currentEvents.filter(
            (
              currentEvent,
            ) =>
              currentEvent.id !==
              choirEvent.id,
          ),
      );
    } catch (
      error: unknown
    ) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible eliminar el evento.";

      setErrorMessage(
        message,
      );
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-5 sm:px-6 sm:py-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <VivacePageHeader
          eyebrow="Agenda coral"
          title="Ensayos y eventos"
          description={
            canManageEvents
              ? "Administra conciertos, ensayos, reuniones, talleres y actividades del ensamble."
              : "Consulta conciertos, ensayos, reuniones, talleres y actividades del ensamble."
          }
          actions={
            canManageEvents ? (
              <button
                type="button"
                onClick={
                  openCreateForm
                }
                className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-emerald-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900 active:scale-[0.98] sm:w-auto"
              >
                + Nuevo evento
              </button>
            ) : null
          }
        />

        {errorMessage ? (
          <div
            role="alert"
            className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:mb-6"
          >
            {errorMessage}
          </div>
        ) : null}

        <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:mb-6 sm:rounded-3xl sm:p-5">
          <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
            <div>
              <label
                htmlFor="event-search"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Buscar
              </label>

              <input
                id="event-search"
                type="search"
                value={searchTerm}
                onChange={(
                  event,
                ) => {
                  setSearchTerm(
                    event.target.value,
                  );
                }}
                placeholder="Nombre, lugar o descripción"
                className="min-h-11 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-base text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="event-type-filter"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Tipo
              </label>

              <select
                id="event-type-filter"
                value={typeFilter}
                onChange={(
                  event,
                ) => {
                  setTypeFilter(
                    event.target
                      .value as
                      | EventType
                      | "Todos",
                  );
                }}
                className="min-h-11 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-base text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 sm:text-sm"
              >
                <option value="Todos">
                  Todos los tipos
                </option>

                {EVENT_TYPES.map(
                  (type) => (
                    <option
                      key={type}
                      value={type}
                    >
                      {type}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="event-status-filter"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Estado
              </label>

              <select
                id="event-status-filter"
                value={
                  statusFilter
                }
                onChange={(
                  event,
                ) => {
                  setStatusFilter(
                    event.target
                      .value as
                      | EventStatus
                      | "Todos",
                  );
                }}
                className="min-h-11 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-base text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 sm:text-sm"
              >
                <option value="Todos">
                  Todos los estados
                </option>

                {EVENT_STATUSES.map(
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
        </section>

        <section className="mb-6">
          {isLoading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <p className="text-sm text-slate-600">
                Cargando calendario...
              </p>
            </div>
          ) : (
            <EventCalendar
              events={
                filteredEvents
              }
            />
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Lista de eventos
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                {filteredEvents.length ===
                1
                  ? "1 evento encontrado"
                  : `${filteredEvents.length} eventos encontrados`}
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <p className="text-sm text-slate-600">
                Cargando eventos...
              </p>
            </div>
          ) : filteredEvents.length ===
            0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <div className="text-4xl">
                📅
              </div>

              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                No hay eventos para mostrar
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                {canManageEvents
                  ? "Registra el primer evento o modifica los filtros de búsqueda."
                  : "Modifica los filtros de búsqueda para consultar otros eventos."}
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredEvents.map(
                (
                  choirEvent,
                ) => (
                  <EventCard
                    key={
                      choirEvent.id
                    }
                    event={
                      choirEvent
                    }
                    canManage={
                      canManageEvents
                    }
                    onEdit={
                      openEditForm
                    }
                    onDelete={
                      handleDelete
                    }
                  />
                ),
              )}
            </div>
          )}
        </section>
      </div>

      {isFormOpen &&
      canManageEvents ? (
        <EventForm
          eventToEdit={
            eventToEdit
          }
          onCancel={
            closeForm
          }
          onSubmit={
            handleFormSubmit
          }
        />
      ) : null}
    </main>
  );
}

interface EventCardProps {
  event: ChoirEvent;
  canManage: boolean;
  onEdit: (
    event: ChoirEvent,
  ) => void;
  onDelete: (
    event: ChoirEvent,
  ) => void;
}

function EventCard({
  event,
  canManage,
  onEdit,
  onDelete,
}: EventCardProps) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-emerald-700">
            {getEventTypeLabel(
              event.event_type,
            )}
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900">
            {event.title}
          </h2>
        </div>

        <StatusBadge
          status={event.status}
        />
      </div>

      <div className="mt-5 space-y-3 text-sm text-slate-600">
        <p>
          <span aria-hidden="true">
            📅
          </span>{" "}
          <span className="font-medium text-slate-700">
            {formatEventDate(
              event.event_date,
            )}
          </span>
        </p>

        <p>
          <span aria-hidden="true">
            🕗
          </span>{" "}
          {formatEventSchedule(
            event.start_time,
            event.end_time,
          )}
        </p>

        <p>
          <span aria-hidden="true">
            📍
          </span>{" "}
          {event.location ||
            "Lugar pendiente"}
        </p>

        {event.description ? (
          <p className="line-clamp-3 border-t border-slate-100 pt-3">
            {event.description}
          </p>
        ) : null}
      </div>

      <div className="mt-5 flex-1">
        <p className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {getEventCountdown(
            event.event_date,
          )}
        </p>
      </div>

      {canManage ? (
        <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => {
              onEdit(event);
            }}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Editar
          </button>

          <button
            type="button"
            onClick={() => {
              onDelete(event);
            }}
            className="flex-1 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            Eliminar
          </button>
        </div>
      ) : (
        <div className="mt-5 border-t border-slate-100 pt-4">
          <p className="text-sm font-medium text-slate-400">
            Solo consulta
          </p>
        </div>
      )}
    </article>
  );
}

interface StatusBadgeProps {
  status: EventStatus;
}

function StatusBadge({
  status,
}: StatusBadgeProps) {
  const statusStyles:
  Record<EventStatus, string> = {
    Programado:
      "border-amber-200 bg-amber-50 text-amber-700",
    Confirmado:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    Cancelado:
      "border-red-200 bg-red-50 text-red-700",
    Finalizado:
      "border-slate-200 bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}
