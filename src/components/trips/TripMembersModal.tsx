"use client";

import AddTripMemberForm from "@/components/trips/AddTripMemberForm";
import TripMemberSummaryCards from "@/components/trips/TripMemberSummaryCards";
import TripMembersTable from "@/components/trips/TripMembersTable";

import useTripMemberSummary from "./hooks/useTripSummary";
import useTripMembers from "./hooks/useTripMembers";

import type { Trip } from "@/types/trip";

interface TripMembersModalProps {
  trip: Trip;
  onClose: () => void;
}

export default function TripMembersModal({
  trip,
  onClose,
}: TripMembersModalProps) {
  const {
    members,
    tripMembers,
    financialSummary,
    selectedMemberId,
    selectedRole,
    selectedParticipationStatus,
    isLoading,
    isSaving,
    processingId,
    message,
    setSelectedMemberId,
    setSelectedRole,
    setSelectedParticipationStatus,
    handleAddMember,
    handleRoleChange,
    handleStatusChange,
    handleRemoveMember,
  } = useTripMembers(trip.id);

  const {
    availableMembers,
    financialByMemberId,
    participantIndicators,
    sortedTripMembers,
  } = useTripMemberSummary({
    members,
    tripMembers,
    financialSummary,
  });

  const isProcessing =
    processingId !== null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8">
      <div className="flex max-h-full w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 sm:px-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Participantes del viaje
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              {trip.name}
              {" · "}
              {trip.destination}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={
              isSaving ||
              isProcessing
            }
            aria-label="Cerrar"
            className="rounded-lg px-3 py-2 text-xl font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ×
          </button>
        </header>

        <div className="overflow-y-auto px-6 py-6 sm:px-8">
          <TripMemberSummaryCards
            total={
              participantIndicators.total
            }
            confirmed={
              participantIndicators.confirmed
            }
            invited={
              participantIndicators.invited
            }
            cancelled={
              participantIndicators.cancelled
            }
            charged={
              participantIndicators.charged
            }
            paid={
              participantIndicators.paid
            }
            partial={
              participantIndicators.partial
            }
            pending={
              participantIndicators.pending
            }
          />

          <AddTripMemberForm
            availableMembers={
              availableMembers
            }
            selectedMemberId={
              selectedMemberId
            }
            selectedRole={selectedRole}
            selectedParticipationStatus={
              selectedParticipationStatus
            }
            isLoading={isLoading}
            isSaving={isSaving}
            onMemberChange={
              setSelectedMemberId
            }
            onRoleChange={
              setSelectedRole
            }
            onParticipationStatusChange={
              setSelectedParticipationStatus
            }
            onAdd={() => {
              void handleAddMember();
            }}
          />

          {message && (
            <div className="mt-5 rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm font-medium text-slate-700 shadow-sm">
              {message}
            </div>
          )}

          <TripMembersTable
            tripMembers={
              sortedTripMembers
            }
            financialByMemberId={
              financialByMemberId
            }
            isLoading={isLoading}
            processingId={processingId}
            onRoleChange={(
              tripMember,
              role,
            ) => {
              void handleRoleChange(
                tripMember,
                role,
              );
            }}
            onStatusChange={(
              tripMember,
              participationStatus,
            ) => {
              void handleStatusChange(
                tripMember,
                participationStatus,
              );
            }}
            onRemove={(tripMember) => {
              void handleRemoveMember(
                tripMember,
              );
            }}
          />
        </div>

        <footer className="flex justify-end border-t border-slate-200 px-6 py-4 sm:px-8">
          <button
            type="button"
            onClick={onClose}
            disabled={
              isSaving ||
              isProcessing
            }
            className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  );
}