"use client";

import {
  type FormEvent,
  useState,
} from "react";

import {
  CheckCircle2,
  CircleDollarSign,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";

import { useParams } from "next/navigation";

import AddTripParticipantModal from "@/components/trips/AddTripParticipantModal";
import GenerateTripChargesModal, {
  type GenerateTripChargesFormData,
} from "@/components/trips/GenerateTripChargesModal";
import TripDetailHeader from "@/components/trips/TripDetailHeader";
import TripFinancialDashboard from "@/components/trips/TripFinancialDashboard";
import TripFormModal from "@/components/trips/TripFormModal";
import TripParticipantsCard from "@/components/trips/TripParticipantsCard";
import TripQuickActions from "@/components/trips/TripQuickActions";

import { useAvailableMembers } from "@/hooks/useAvailableMembers";
import { useTripDetail } from "@/hooks/useTripDetail";
import { useTripParticipants } from "@/hooks/useTripParticipants";

import {
  createTripCharges,
  getActiveFeeTypes,
  type FeeType,
} from "@/services/feeService";

import {
  updateTrip,
} from "@/services/tripService";

import {
  emptyTripForm,
  type TripFormData,
} from "@/types/trip";

import type {
  TripParticipantStatus,
} from "@/types/tripParticipant";

function getErrorMessage(
  error: unknown,
): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "No fue posible completar la operación.";
}

export default function TripDetailPage() {
  const params = useParams<{
    tripId: string;
  }>();

  const tripId = params.tripId;

  const {
    trip,
    loading,
    error,
    refreshTrip,
  } = useTripDetail(tripId);

  const {
    participants,
    loading: participantsLoading,
    error: participantsError,
    refreshParticipants,
    createParticipant,
    editParticipant,
    deleteParticipant,
  } = useTripParticipants(tripId);

  const {
    members,
    loading: membersLoading,
    error: membersError,
  } = useAvailableMembers();

  const [
    form,
    setForm,
  ] = useState<TripFormData>(
    emptyTripForm,
  );

  const [
    isEditModalOpen,
    setIsEditModalOpen,
  ] = useState(false);

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    saveError,
    setSaveError,
  ] = useState<string | null>(null);

  const [
    successMessage,
    setSuccessMessage,
  ] = useState<string | null>(null);

  const [
    isParticipantModalOpen,
    setIsParticipantModalOpen,
  ] = useState(false);

  const [
    isAddingParticipant,
    setIsAddingParticipant,
  ] = useState(false);

  const [
    participantSaveError,
    setParticipantSaveError,
  ] = useState<string | null>(null);

  const [
    participantActionError,
    setParticipantActionError,
  ] = useState<string | null>(null);

  const [
    updatingParticipantId,
    setUpdatingParticipantId,
  ] = useState<string | null>(null);

  const [
    isChargesModalOpen,
    setIsChargesModalOpen,
  ] = useState(false);

  const [
    feeTypes,
    setFeeTypes,
  ] = useState<FeeType[]>([]);

  const [
    feeTypesLoading,
    setFeeTypesLoading,
  ] = useState(false);

  const [
    feeTypesError,
    setFeeTypesError,
  ] = useState<string | null>(null);

  const [
    isGeneratingCharges,
    setIsGeneratingCharges,
  ] = useState(false);

  const [
    financialActionError,
    setFinancialActionError,
  ] = useState<string | null>(null);

  const confirmedParticipants =
    participants.filter(
      (participant) =>
        participant.status ===
        "confirmed",
    );

  function openEditModal(): void {
    if (!trip) {
      return;
    }

    setForm({
      name: trip.name,
      destination: trip.destination,
      startDate: trip.start_date ?? "",
      endDate: trip.end_date ?? "",
      description: trip.description ?? "",

      responsibleMemberId:
        trip.responsible_member_id
          ? String(
              trip.responsible_member_id,
            )
          : "",

      estimatedBudget:
        trip.estimated_budget !== null
          ? String(trip.estimated_budget)
          : "",

      status: trip.status,
    });

    setSaveError(null);
    setSuccessMessage(null);
    setIsEditModalOpen(true);
  }

  function closeEditModal(): void {
    if (isSaving) {
      return;
    }

    setIsEditModalOpen(false);
    setSaveError(null);
  }

  function openParticipantModal(): void {
    setParticipantSaveError(null);
    setParticipantActionError(null);
    setFinancialActionError(null);
    setSuccessMessage(null);
    setIsParticipantModalOpen(true);
  }

  function closeParticipantModal(): void {
    if (isAddingParticipant) {
      return;
    }

    setIsParticipantModalOpen(false);
    setParticipantSaveError(null);
  }

  async function loadFeeTypes(): Promise<void> {
    setFeeTypesLoading(true);
    setFeeTypesError(null);

    try {
      const activeFeeTypes =
        await getActiveFeeTypes();

      setFeeTypes(activeFeeTypes);
    } catch (loadError) {
      setFeeTypesError(
        getErrorMessage(loadError),
      );
    } finally {
      setFeeTypesLoading(false);
    }
  }

  function openChargesModal(): void {
    setFinancialActionError(null);
    setParticipantActionError(null);
    setSuccessMessage(null);
    setIsChargesModalOpen(true);

    if (feeTypes.length === 0) {
      void loadFeeTypes();
    }
  }

  function closeChargesModal(): void {
    if (isGeneratingCharges) {
      return;
    }

    setIsChargesModalOpen(false);
  }

  async function handleGenerateCharges(
    formData: GenerateTripChargesFormData,
  ): Promise<void> {
    if (confirmedParticipants.length === 0) {
      throw new Error(
        "El viaje no tiene participantes confirmados.",
      );
    }

    setIsGeneratingCharges(true);
    setFinancialActionError(null);
    setSuccessMessage(null);

    try {
      const result =
        await createTripCharges({
          tripId,
          memberIds:
            confirmedParticipants.map(
              (participant) =>
                participant.memberId,
            ),
          feeTypeId:
            formData.feeTypeId,
          amount: formData.amount,
          billingPeriod:
            formData.billingPeriod,
          dueDate: formData.dueDate,
          notes: formData.notes,
        });

      setIsChargesModalOpen(false);

      if (
        result.createdCount > 0 &&
        result.skippedCount > 0
      ) {
        setSuccessMessage(
          `Se crearon ${result.createdCount} cargos y se omitieron ${result.skippedCount} porque ya existían.`,
        );
      } else if (
        result.createdCount > 0
      ) {
        setSuccessMessage(
          `Se crearon ${result.createdCount} cargos correctamente.`,
        );
      } else {
        setSuccessMessage(
          "No se crearon cargos nuevos porque todos los participantes confirmados ya tenían este concepto asignado.",
        );
      }
    } catch (generateError) {
      const message =
        getErrorMessage(generateError);

      setFinancialActionError(message);
      throw generateError;
    } finally {
      setIsGeneratingCharges(false);
    }
  }

  async function handleAddParticipant(
    memberId: number,
    status: TripParticipantStatus,
  ): Promise<void> {
    setIsAddingParticipant(true);
    setParticipantSaveError(null);
    setParticipantActionError(null);
    setFinancialActionError(null);
    setSuccessMessage(null);

    try {
      await createParticipant({
        memberId,
        status,
        notes: null,
      });

      setIsParticipantModalOpen(false);
      setSuccessMessage(
        "Participante agregado correctamente.",
      );
    } catch (addError) {
      setParticipantSaveError(
        getErrorMessage(addError),
      );
    } finally {
      setIsAddingParticipant(false);
    }
  }

  async function handleChangeParticipantStatus(
    participantId: string,
    status: TripParticipantStatus,
  ): Promise<void> {
    setUpdatingParticipantId(
      participantId,
    );
    setParticipantActionError(null);
    setFinancialActionError(null);
    setSuccessMessage(null);

    try {
      await editParticipant(
        participantId,
        {
          status,
        },
      );

      setSuccessMessage(
        "Estado del participante actualizado correctamente.",
      );
    } catch (updateError) {
      setParticipantActionError(
        getErrorMessage(updateError),
      );
    } finally {
      setUpdatingParticipantId(null);
    }
  }

  async function handleRemoveParticipant(
    participantId: string,
  ): Promise<void> {
    const participant =
      participants.find(
        (item) =>
          item.id === participantId,
      );

    const participantName =
      participant
        ? `${participant.memberName} ${participant.memberLastName}`
        : "este participante";

    const confirmed =
      window.confirm(
        `¿Deseas eliminar a ${participantName} del viaje? Esta acción no se puede deshacer.`,
      );

    if (!confirmed) {
      return;
    }

    setUpdatingParticipantId(
      participantId,
    );
    setParticipantActionError(null);
    setFinancialActionError(null);
    setSuccessMessage(null);

    try {
      await deleteParticipant(
        participantId,
      );

      setSuccessMessage(
        "Participante eliminado correctamente.",
      );
    } catch (removeError) {
      setParticipantActionError(
        getErrorMessage(removeError),
      );
    } finally {
      setUpdatingParticipantId(null);
    }
  }

  async function handleUpdateTrip(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (!trip) {
      return;
    }

    const trimmedName =
      form.name.trim();

    const trimmedDestination =
      form.destination.trim();

    if (
      !trimmedName ||
      !trimmedDestination
    ) {
      setSaveError(
        "El nombre y el destino del viaje son obligatorios.",
      );

      return;
    }

    if (
      form.startDate &&
      form.endDate &&
      form.endDate < form.startDate
    ) {
      setSaveError(
        "La fecha de finalización no puede ser anterior a la fecha de inicio.",
      );

      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSuccessMessage(null);

    try {
      await updateTrip(
        trip.id,
        form,
      );

      await refreshTrip();

      setIsEditModalOpen(false);
      setSuccessMessage(
        "Viaje actualizado correctamente.",
      );
    } catch (updateError) {
      setSaveError(
        getErrorMessage(updateError),
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="space-y-6">
        <div
          className="
            flex min-h-72 items-center
            justify-center rounded-2xl
            border border-slate-200
            bg-white p-8 shadow-sm
          "
        >
          <div
            className="
              flex flex-col items-center
              gap-3 text-center
            "
          >
            <RefreshCw
              aria-hidden="true"
              className="
                h-7 w-7 animate-spin
                text-slate-500
              "
            />

            <div>
              <p
                className="
                  font-semibold
                  text-slate-900
                "
              >
                Cargando viaje
              </p>

              <p
                className="
                  mt-1 text-sm
                  text-slate-500
                "
              >
                Estamos consultando la
                información registrada.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !trip) {
    return (
      <main className="space-y-6">
        <div
          className="
            flex min-h-72 items-center
            justify-center rounded-2xl
            border border-red-200
            bg-red-50 p-8
          "
        >
          <div
            className="
              flex max-w-md flex-col
              items-center gap-4
              text-center
            "
          >
            <div
              className="
                flex h-12 w-12
                items-center justify-center
                rounded-full bg-red-100
              "
            >
              <TriangleAlert
                aria-hidden="true"
                className="
                  h-6 w-6 text-red-700
                "
              />
            </div>

            <div>
              <h1
                className="
                  text-lg font-semibold
                  text-red-950
                "
              >
                No fue posible cargar el viaje
              </h1>

              <p
                className="
                  mt-2 text-sm leading-6
                  text-red-800
                "
              >
                {error ??
                  "El viaje solicitado no existe o ya no está disponible."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                void refreshTrip();
              }}
              className="
                inline-flex items-center
                gap-2 rounded-lg
                bg-red-700 px-4 py-2
                text-sm font-semibold
                text-white transition-colors
                hover:bg-red-800
                focus:outline-none
                focus:ring-2
                focus:ring-red-500
                focus:ring-offset-2
              "
            >
              <RefreshCw
                aria-hidden="true"
                className="h-4 w-4"
              />

              Intentar nuevamente
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-8">
      <TripDetailHeader trip={trip} />

      {successMessage ? (
        <div
          className="
            flex items-start gap-3
            rounded-xl border
            border-emerald-200
            bg-emerald-50 px-4 py-3
            text-sm text-emerald-900
          "
        >
          <CheckCircle2
            aria-hidden="true"
            className="
              mt-0.5 h-5 w-5
              shrink-0 text-emerald-700
            "
          />

          <p>{successMessage}</p>
        </div>
      ) : null}

      {participantActionError ? (
        <div
          role="alert"
          className="
            flex items-start gap-3
            rounded-xl border
            border-red-200 bg-red-50
            px-4 py-3
            text-sm text-red-900
          "
        >
          <TriangleAlert
            aria-hidden="true"
            className="
              mt-0.5 h-5 w-5
              shrink-0 text-red-700
            "
          />

          <p>{participantActionError}</p>
        </div>
      ) : null}

      {financialActionError &&
      !isChargesModalOpen ? (
        <div
          role="alert"
          className="
            flex items-start gap-3
            rounded-xl border
            border-red-200 bg-red-50
            px-4 py-3
            text-sm text-red-900
          "
        >
          <TriangleAlert
            aria-hidden="true"
            className="
              mt-0.5 h-5 w-5
              shrink-0 text-red-700
            "
          />

          <p>{financialActionError}</p>
        </div>
      ) : null}

      <TripQuickActions
        onEditTrip={openEditModal}
      />

      <TripParticipantsCard
        participants={participants}
        loading={participantsLoading}
        error={participantsError}
        updatingParticipantId={
          updatingParticipantId
        }
        onAddParticipant={
          openParticipantModal
        }
        onRetry={() => {
          void refreshParticipants();
        }}
        onChangeStatus={(
          participantId,
          status,
        ) => {
          void handleChangeParticipantStatus(
            participantId,
            status,
          );
        }}
        onRemoveParticipant={(
          participant,
        ) => {
          void handleRemoveParticipant(
            participant.id,
          );
        }}
      />

      <section className="space-y-4">
        <div
          className="
            flex flex-col gap-4
            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >
          <div>
            <h2
              className="
                text-xl font-bold
                tracking-tight text-slate-950
              "
            >
              Estado financiero
            </h2>

            <p
              className="
                mt-1 text-sm
                text-slate-600
              "
            >
              Seguimiento de cargos, pagos y
              saldos de los participantes.
            </p>
          </div>

          <button
            type="button"
            onClick={openChargesModal}
            disabled={
              participantsLoading ||
              confirmedParticipants.length === 0
            }
            className="
              inline-flex items-center
              justify-center gap-2
              rounded-lg bg-emerald-700
              px-4 py-2.5
              text-sm font-semibold
              text-white transition-colors
              hover:bg-emerald-800
              focus:outline-none
              focus:ring-2
              focus:ring-emerald-500
              focus:ring-offset-2
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <CircleDollarSign
              aria-hidden="true"
              className="h-4 w-4"
            />

            Generar cargos
          </button>
        </div>

        {confirmedParticipants.length ===
          0 &&
        !participantsLoading ? (
          <p
            className="
              rounded-lg border
              border-amber-200
              bg-amber-50 px-4 py-3
              text-sm text-amber-900
            "
          >
            Confirma al menos un participante
            para poder generar cargos del
            viaje.
          </p>
        ) : null}

        <TripFinancialDashboard
          tripId={trip.id}
          tripName={trip.name}
        />
      </section>

      {isParticipantModalOpen ? (
        <AddTripParticipantModal
          members={members}
          existingMemberIds={participants.map(
            (participant) =>
              participant.memberId,
          )}
          loading={membersLoading}
          isSaving={isAddingParticipant}
          error={
            participantSaveError ??
            membersError
          }
          onClose={
            closeParticipantModal
          }
          onAdd={(
            memberId,
            status,
          ) => {
            void handleAddParticipant(
              memberId,
              status,
            );
          }}
        />
      ) : null}

      {isChargesModalOpen ? (
        <GenerateTripChargesModal
          tripName={trip.name}
          confirmedParticipantsCount={
            confirmedParticipants.length
          }
          feeTypes={feeTypes}
          loadingFeeTypes={
            feeTypesLoading
          }
          feeTypesError={
            feeTypesError
          }
          submitting={
            isGeneratingCharges
          }
          onClose={closeChargesModal}
          onRetryFeeTypes={() => {
            void loadFeeTypes();
          }}
          onSubmit={
            handleGenerateCharges
          }
        />
      ) : null}

      {isEditModalOpen ? (
        <>
          <TripFormModal
            form={form}
            setForm={setForm}
            editingTrip={trip}
            isSaving={isSaving}
            onClose={closeEditModal}
            onSubmit={(event) => {
              void handleUpdateTrip(event);
            }}
          />

          {saveError ? (
            <div
              role="alert"
              className="
                fixed bottom-5 left-1/2
                z-[60] w-[calc(100%-2rem)]
                max-w-xl -translate-x-1/2
                rounded-xl border
                border-red-200 bg-red-50
                px-4 py-3 shadow-lg
              "
            >
              <div
                className="
                  flex items-start gap-3
                  text-sm text-red-900
                "
              >
                <TriangleAlert
                  aria-hidden="true"
                  className="
                    mt-0.5 h-5 w-5
                    shrink-0 text-red-700
                  "
                />

                <p>{saveError}</p>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </main>
  );
}