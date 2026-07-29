"use client";

import {
  type FormEvent,
  useMemo,
  useState,
} from "react";
import Link from "next/link";

import Button from "@/components/common/Button";
import TripChargesModal from "@/components/trips/TripChargesModal";
import TripFinancialSummaryModal from "@/components/trips/TripFinancialSummaryModal";
import TripFormModal from "@/components/trips/TripFormModal";
import TripMembersModal from "@/components/trips/TripMembersModal";
import TripsTable from "@/components/trips/TripsTable";

import { useTrips } from "@/hooks/useTrips";

import {
  emptyTripForm,
  type Trip,
  type TripFormData,
  type TripStatus,
} from "@/types/trip";

function tripToForm(
  trip: Trip,
): TripFormData {
  return {
    name: trip.name,
    destination: trip.destination,
    startDate: trip.start_date ?? "",
    endDate: trip.end_date ?? "",
    description: trip.description ?? "",
    responsibleMemberId:
      trip.responsible_member_id?.toString() ??
      "",
    estimatedBudget:
      trip.estimated_budget?.toString() ?? "",
    status: trip.status,
  };
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

    try {
      const serialized =
        JSON.stringify(error);

      if (
        serialized &&
        serialized !== "{}"
      ) {
        return serialized;
      }
    } catch {
      // Continuamos con el mensaje alternativo.
    }
  }

  return fallback;
}

export default function TripsPage() {
  const {
    trips,
    loading,
    error,
    createItem,
    updateItem,
    changeStatus,
  } = useTrips();

  const [search, setSearch] =
    useState("");

  const [form, setForm] =
    useState<TripFormData>(
      emptyTripForm,
    );

  const [editingTrip, setEditingTrip] =
    useState<Trip | null>(null);

  const [
    selectedTripForMembers,
    setSelectedTripForMembers,
  ] = useState<Trip | null>(null);

  const [
    selectedTripForCharges,
    setSelectedTripForCharges,
  ] = useState<Trip | null>(null);

  const [
    selectedTripForFinancialSummary,
    setSelectedTripForFinancialSummary,
  ] = useState<Trip | null>(null);

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [isSaving, setIsSaving] =
    useState(false);

  const [processingId, setProcessingId] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState("");

  const filteredTrips = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    if (!normalizedSearch) {
      return trips;
    }

    return trips.filter((trip) => {
      const searchableText = [
        trip.name,
        trip.destination,
        trip.description ?? "",
        trip.status,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(
        normalizedSearch,
      );
    });
  }, [search, trips]);

  function openCreateForm() {
    setEditingTrip(null);
    setForm(emptyTripForm);
    setMessage("");
    setIsFormOpen(true);
  }

  function openEditForm(
    trip: Trip,
  ) {
    setEditingTrip(trip);
    setForm(tripToForm(trip));
    setMessage("");
    setIsFormOpen(true);
  }

  function closeForm() {
    if (isSaving) {
      return;
    }

    setEditingTrip(null);
    setForm(emptyTripForm);
    setIsFormOpen(false);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!form.name.trim()) {
      setMessage(
        "Escribe el nombre del viaje.",
      );

      return;
    }

    if (!form.destination.trim()) {
      setMessage(
        "Escribe el destino del viaje.",
      );

      return;
    }

    if (
      form.startDate &&
      form.endDate &&
      form.endDate < form.startDate
    ) {
      setMessage(
        "La fecha de finalización no puede ser anterior a la fecha de inicio.",
      );

      return;
    }

    if (
      form.estimatedBudget &&
      Number(form.estimatedBudget) < 0
    ) {
      setMessage(
        "El presupuesto no puede ser negativo.",
      );

      return;
    }

    const wasEditing =
      editingTrip !== null;

    try {
      setIsSaving(true);
      setMessage("");

      if (editingTrip) {
        await updateItem(
          editingTrip.id,
          form,
        );
      } else {
        await createItem(form);
      }

      setEditingTrip(null);
      setForm(emptyTripForm);
      setIsFormOpen(false);

      setMessage(
        wasEditing
          ? "Viaje actualizado correctamente."
          : "Viaje creado correctamente.",
      );
    } catch (submitError: unknown) {
      setMessage(
        `No fue posible guardar el viaje: ${getErrorMessage(
          submitError,
          "Error desconocido.",
        )}`,
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleChangeStatus(
    trip: Trip,
    status: TripStatus,
  ) {
    const statusLabels: Record<
      TripStatus,
      string
    > = {
      planning: "Planeación",
      active: "Activo",
      completed: "Finalizado",
      cancelled: "Cancelado",
    };

    const actionLabels: Record<
      TripStatus,
      string
    > = {
      planning:
        "cambiar a planeación",
      active: "activar",
      completed: "finalizar",
      cancelled: "cancelar",
    };

    const confirmed = window.confirm(
      `¿Deseas ${actionLabels[status]} el viaje “${trip.name}”?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(trip.id);
      setMessage("");

      await changeStatus(
        trip.id,
        status,
      );

      setMessage(
        `El viaje cambió al estado “${statusLabels[status]}” correctamente.`,
      );
    } catch (statusError: unknown) {
      console.error(statusError);

      setMessage(
        `No fue posible cambiar el estado del viaje: ${getErrorMessage(
          statusError,
          "Error desconocido.",
        )}`,
      );
    } finally {
      setProcessingId(null);
    }
  }

  function handleChargesCreated() {
    setMessage(
      "Los cargos del viaje fueron creados correctamente.",
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="bg-emerald-900 px-6 py-6 text-white">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="text-sm font-semibold text-emerald-200 transition hover:text-white"
          >
            ← Volver al panel
          </Link>

          <h1 className="mt-4 text-3xl font-bold">
            Viajes
          </h1>

          <p className="mt-2 text-emerald-100">
            Planeación y administración de
            viajes del Ensamble Coral Vivace.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Viajes registrados
            </h2>

            <p className="mt-1 text-slate-600">
              {trips.length}{" "}
              {trips.length === 1
                ? "viaje registrado"
                : "viajes registrados"}
              .
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <input
              type="search"
              placeholder="Buscar por nombre, destino o estado"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 sm:w-96"
            />

            <Button
              onClick={openCreateForm}
            >
              + Nuevo viaje
            </Button>
          </div>
        </div>

        {(message || error) && (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm font-medium text-slate-700 shadow-sm">
            {message ||
              `No fue posible cargar los viajes: ${error}`}
          </div>
        )}

        <TripsTable
          trips={filteredTrips}
          search={search}
          isLoading={loading}
          processingId={processingId}
          onEdit={openEditForm}
          onManageMembers={(trip) =>
            setSelectedTripForMembers(trip)
          }
          onManageCharges={(trip) =>
            setSelectedTripForCharges(trip)
          }
          onViewFinancialSummary={(trip) =>
            setSelectedTripForFinancialSummary(
              trip,
            )
          }
          onChangeStatus={(
            trip,
            status,
          ) => {
            void handleChangeStatus(
              trip,
              status,
            );
          }}
        />
      </section>

      {selectedTripForMembers && (
        <TripMembersModal
          trip={selectedTripForMembers}
          onClose={() =>
            setSelectedTripForMembers(null)
          }
        />
      )}

      {selectedTripForCharges && (
        <TripChargesModal
          tripId={selectedTripForCharges.id}
          tripName={selectedTripForCharges.name}
          onClose={() =>
            setSelectedTripForCharges(null)
          }
          onChargesCreated={
            handleChargesCreated
          }
        />
      )}

      {selectedTripForFinancialSummary && (
        <TripFinancialSummaryModal
          tripId={
            selectedTripForFinancialSummary.id
          }
          tripName={
            selectedTripForFinancialSummary.name
          }
          onClose={() =>
            setSelectedTripForFinancialSummary(
              null,
            )
          }
        />
      )}

      {isFormOpen && (
        <TripFormModal
          form={form}
          setForm={setForm}
          editingTrip={editingTrip}
          isSaving={isSaving}
          onClose={closeForm}
          onSubmit={handleSubmit}
        />
      )}
    </main>
  );
}