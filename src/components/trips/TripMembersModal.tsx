"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import AddTripMemberForm from "@/components/trips/AddTripMemberForm";
import TripMemberSummaryCards from "@/components/trips/TripMemberSummaryCards";
import TripMembersTable, {
  type TripMemberFinancialOverview,
} from "@/components/trips/TripMembersTable";

import { getMembers } from "@/services/memberService";

import {
  getTripFinancialSummary,
  type TripFinancialSummary,
  type TripMemberFinancialStatus,
} from "@/services/tripService";

import {
  addTripMember,
  getTripMembers,
  removeTripMember,
  updateTripMember,
} from "@/services/tripMemberService";

import type { Member } from "@/types/member";
import type { Trip } from "@/types/trip";

import type {
  TripMemberListItem,
  TripMemberRole,
  TripParticipationStatus,
} from "@/types/tripMember";

interface TripMembersModalProps {
  trip: Trip;
  onClose: () => void;
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
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return fallback;
}

function getFinancialStatus(
  totalCharged: number,
  totalPaid: number,
): TripMemberFinancialStatus {
  if (
    totalCharged > 0 &&
    totalPaid >= totalCharged
  ) {
    return "paid";
  }

  if (totalPaid > 0) {
    return "partial";
  }

  return "pending";
}

export default function TripMembersModal({
  trip,
  onClose,
}: TripMembersModalProps) {
  const [members, setMembers] =
    useState<Member[]>([]);

  const [tripMembers, setTripMembers] =
    useState<TripMemberListItem[]>([]);

  const [
    financialSummary,
    setFinancialSummary,
  ] = useState<TripFinancialSummary | null>(
    null,
  );

  const [
    selectedMemberId,
    setSelectedMemberId,
  ] = useState("");

  const [selectedRole, setSelectedRole] =
    useState<TripMemberRole>(
      "participant",
    );

  const [
    selectedParticipationStatus,
    setSelectedParticipationStatus,
  ] =
    useState<TripParticipationStatus>(
      "confirmed",
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [processingId, setProcessingId] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState("");

  const loadData = useCallback(
    async () => {
      try {
        setIsLoading(true);
        setMessage("");

        const [
          membersData,
          tripMembersData,
          financialSummaryData,
        ] = await Promise.all([
          getMembers(),
          getTripMembers(trip.id),
          getTripFinancialSummary(
            trip.id,
          ),
        ]);

        setMembers(membersData);
        setTripMembers(tripMembersData);
        setFinancialSummary(
          financialSummaryData,
        );
      } catch (error: unknown) {
        console.error(error);

        setMessage(
          `No fue posible cargar los participantes: ${getErrorMessage(
            error,
            "Error desconocido.",
          )}`,
        );
      } finally {
        setIsLoading(false);
      }
    },
    [trip.id],
  );

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const activeMembers = useMemo(
    () =>
      members.filter(
        (member) =>
          member.status.toLowerCase() ===
          "activo",
      ),
    [members],
  );

  const availableMembers = useMemo(() => {
    const registeredMemberIds =
      new Set(
        tripMembers.map(
          (tripMember) =>
            tripMember.memberId,
        ),
      );

    return activeMembers.filter(
      (member) =>
        !registeredMemberIds.has(
          member.id,
        ),
    );
  }, [activeMembers, tripMembers]);

  const financialByMemberId =
    useMemo(() => {
      const financialMap =
        new Map<
          number,
          TripMemberFinancialOverview
        >();

      for (const financialMember of
        financialSummary?.members ?? []) {
        const current =
          financialMap.get(
            financialMember.memberId,
          );

        const totalCharged =
          (current?.totalCharged ?? 0) +
          financialMember.totalCharged;

        const totalPaid =
          (current?.totalPaid ?? 0) +
          financialMember.totalPaid;

        const totalPending = Math.max(
          totalCharged - totalPaid,
          0,
        );

        financialMap.set(
          financialMember.memberId,
          {
            memberId:
              financialMember.memberId,
            hasCharge: true,
            totalCharged,
            totalPaid,
            totalPending,
            status:
              getFinancialStatus(
                totalCharged,
                totalPaid,
              ),
          },
        );
      }

      return financialMap;
    }, [financialSummary]);

  const participantIndicators =
    useMemo(() => {
      const confirmedCount =
        tripMembers.filter(
          (tripMember) =>
            tripMember.participationStatus ===
            "confirmed",
        ).length;

      const invitedCount =
        tripMembers.filter(
          (tripMember) =>
            tripMember.participationStatus ===
            "invited",
        ).length;

      const cancelledCount =
        tripMembers.filter(
          (tripMember) =>
            tripMember.participationStatus ===
            "cancelled",
        ).length;

      const financialMembers = [
        ...financialByMemberId.values(),
      ];

      const chargedCount =
        financialMembers.length;

      const paidCount =
        financialMembers.filter(
          (member) =>
            member.status === "paid",
        ).length;

      const partialCount =
        financialMembers.filter(
          (member) =>
            member.status === "partial",
        ).length;

      const pendingCount =
        financialMembers.filter(
          (member) =>
            member.status === "pending",
        ).length;

      return {
        total: tripMembers.length,
        confirmed: confirmedCount,
        invited: invitedCount,
        cancelled: cancelledCount,
        charged: chargedCount,
        paid: paidCount,
        partial: partialCount,
        pending: pendingCount,
      };
    }, [
      financialByMemberId,
      tripMembers,
    ]);

  const sortedTripMembers =
    useMemo(() => {
      const financialPriority: Record<
        TripMemberFinancialStatus,
        number
      > = {
        pending: 0,
        partial: 1,
        paid: 2,
      };

      return [...tripMembers].sort(
        (firstMember, secondMember) => {
          const firstFinancial =
            financialByMemberId.get(
              firstMember.memberId,
            );

          const secondFinancial =
            financialByMemberId.get(
              secondMember.memberId,
            );

          const firstPriority =
            firstFinancial
              ? financialPriority[
                  firstFinancial.status
                ]
              : 3;

          const secondPriority =
            secondFinancial
              ? financialPriority[
                  secondFinancial.status
                ]
              : 3;

          if (
            firstPriority !==
            secondPriority
          ) {
            return (
              firstPriority -
              secondPriority
            );
          }

          return firstMember.memberName.localeCompare(
            secondMember.memberName,
            "es",
            {
              sensitivity: "base",
            },
          );
        },
      );
    }, [
      financialByMemberId,
      tripMembers,
    ]);

  async function handleAddMember() {
    if (!selectedMemberId) {
      setMessage(
        "Selecciona un integrante.",
      );

      return;
    }

    const memberId =
      Number(selectedMemberId);

    if (
      !Number.isInteger(memberId) ||
      memberId <= 0
    ) {
      setMessage(
        "El integrante seleccionado no es válido.",
      );

      return;
    }

    try {
      setIsSaving(true);
      setMessage("");

      await addTripMember({
        tripId: trip.id,
        memberId,
        role: selectedRole,
        participationStatus:
          selectedParticipationStatus,
      });

      await loadData();

      setSelectedMemberId("");
      setSelectedRole("participant");
      setSelectedParticipationStatus(
        "confirmed",
      );

      setMessage(
        "Participante agregado correctamente.",
      );
    } catch (error: unknown) {
      console.error(error);

      setMessage(
        `No fue posible agregar al participante: ${getErrorMessage(
          error,
          "Error desconocido.",
        )}`,
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRoleChange(
    tripMember: TripMemberListItem,
    role: TripMemberRole,
  ) {
    try {
      setProcessingId(tripMember.id);
      setMessage("");

      await updateTripMember(
        tripMember.id,
        role,
        tripMember.participationStatus,
      );

      setTripMembers(
        (currentTripMembers) =>
          currentTripMembers.map(
            (currentTripMember) =>
              currentTripMember.id ===
              tripMember.id
                ? {
                    ...currentTripMember,
                    role,
                  }
                : currentTripMember,
          ),
      );

      setMessage(
        "Rol actualizado correctamente.",
      );
    } catch (error: unknown) {
      console.error(error);

      setMessage(
        `No fue posible actualizar el rol: ${getErrorMessage(
          error,
          "Error desconocido.",
        )}`,
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function handleStatusChange(
    tripMember: TripMemberListItem,
    participationStatus:
      TripParticipationStatus,
  ) {
    try {
      setProcessingId(tripMember.id);
      setMessage("");

      await updateTripMember(
        tripMember.id,
        tripMember.role,
        participationStatus,
      );

      setTripMembers(
        (currentTripMembers) =>
          currentTripMembers.map(
            (currentTripMember) =>
              currentTripMember.id ===
              tripMember.id
                ? {
                    ...currentTripMember,
                    participationStatus,
                  }
                : currentTripMember,
          ),
      );

      setMessage(
        "Estado de participación actualizado correctamente.",
      );
    } catch (error: unknown) {
      console.error(error);

      setMessage(
        `No fue posible actualizar el estado: ${getErrorMessage(
          error,
          "Error desconocido.",
        )}`,
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function handleRemoveMember(
    tripMember: TripMemberListItem,
  ) {
    const confirmed = window.confirm(
      `¿Deseas quitar a ${tripMember.memberName} de este viaje?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(tripMember.id);
      setMessage("");

      await removeTripMember(
        tripMember.id,
      );

      setTripMembers(
        (currentTripMembers) =>
          currentTripMembers.filter(
            (currentTripMember) =>
              currentTripMember.id !==
              tripMember.id,
          ),
      );

      setMessage(
        "Participante eliminado correctamente.",
      );
    } catch (error: unknown) {
      console.error(error);

      setMessage(
        `No fue posible quitar al participante: ${getErrorMessage(
          error,
          "Error desconocido.",
        )}`,
      );
    } finally {
      setProcessingId(null);
    }
  }

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
              processingId !== null
            }
            aria-label="Cerrar"
            className="rounded-lg px-3 py-2 text-xl font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ×
          </button>
        </header>

        <div className="overflow-y-auto px-6 py-6 sm:px-8">
          <TripMemberSummaryCards
            total={participantIndicators.total}
            confirmed={participantIndicators.confirmed}
            invited={participantIndicators.invited}
            cancelled={participantIndicators.cancelled}
            charged={participantIndicators.charged}
            paid={participantIndicators.paid}
            partial={participantIndicators.partial}
            pending={participantIndicators.pending}
          />

          <AddTripMemberForm
            availableMembers={availableMembers}
            selectedMemberId={selectedMemberId}
            selectedRole={selectedRole}
            selectedParticipationStatus={
              selectedParticipationStatus
            }
            isLoading={isLoading}
            isSaving={isSaving}
            onMemberChange={
              setSelectedMemberId
            }
            onRoleChange={setSelectedRole}
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
            tripMembers={sortedTripMembers}
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
              processingId !== null
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