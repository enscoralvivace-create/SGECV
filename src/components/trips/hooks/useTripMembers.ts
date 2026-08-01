"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { getMembers } from "@/services/memberService";

import {
  getTripFinancialSummary,
} from "@/services/tripService";

import type {
  TripFinancialSummary,
} from "@/types/tripFinancial";

import {
  addTripMember,
  getTripMembers,
  removeTripMember,
  updateTripMember,
} from "@/services/tripMemberService";

import type { Member } from "@/types/member";

import type {
  TripMemberListItem,
  TripMemberRole,
  TripParticipationStatus,
} from "@/types/tripMember";

interface UseTripMembersResult {
  members: Member[];
  tripMembers: TripMemberListItem[];
  financialSummary: TripFinancialSummary | null;
  selectedMemberId: string;
  selectedRole: TripMemberRole;
  selectedParticipationStatus:
    TripParticipationStatus;
  isLoading: boolean;
  isSaving: boolean;
  processingId: string | null;
  message: string;
  setSelectedMemberId: (
    memberId: string,
  ) => void;
  setSelectedRole: (
    role: TripMemberRole,
  ) => void;
  setSelectedParticipationStatus: (
    status: TripParticipationStatus,
  ) => void;
  handleAddMember: () => Promise<void>;
  handleRoleChange: (
    tripMember: TripMemberListItem,
    role: TripMemberRole,
  ) => Promise<void>;
  handleStatusChange: (
    tripMember: TripMemberListItem,
    participationStatus:
      TripParticipationStatus,
  ) => Promise<void>;
  handleRemoveMember: (
    tripMember: TripMemberListItem,
  ) => Promise<void>;
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

export default function useTripMembers(
  tripId: string,
): UseTripMembersResult {
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
          getTripMembers(tripId),
          getTripFinancialSummary(
            tripId,
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
    [tripId],
  );

  useEffect(() => {
    void loadData();
  }, [loadData]);

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
        tripId,
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

  return {
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
  };
}