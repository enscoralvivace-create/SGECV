"use client";

import { useCallback, useEffect, useState } from "react";

import {
  addTripParticipant,
  getTripParticipants,
  removeTripParticipant,
  updateTripParticipant,
} from "@/services/tripParticipantService";

import type {
  AddTripParticipantPayload,
  TripParticipant,
  UpdateTripParticipantPayload,
} from "@/types/tripParticipant";

function getErrorMessage(
  error: unknown,
): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Ocurrió un error al cargar los participantes.";
}

export function useTripParticipants(
  tripId: string,
) {
  const [
    participants,
    setParticipants,
  ] = useState<TripParticipant[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const refreshParticipants =
    useCallback(async () => {
      if (!tripId) {
        setParticipants([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data =
          await getTripParticipants(
            tripId,
          );

        setParticipants(data);
      } catch (loadError) {
        setError(
          getErrorMessage(loadError),
        );
      } finally {
        setLoading(false);
      }
    }, [tripId]);

  useEffect(() => {
    void refreshParticipants();
  }, [refreshParticipants]);

  async function createParticipant(
    payload: Omit<
      AddTripParticipantPayload,
      "tripId"
    >,
  ) {
    const participant =
      await addTripParticipant({
        tripId,
        ...payload,
      });

    setParticipants((current) =>
      [...current, participant].sort(
        (first, second) => {
          const firstName =
            `${first.memberLastName} ${first.memberName}`;

          const secondName =
            `${second.memberLastName} ${second.memberName}`;

          return firstName.localeCompare(
            secondName,
            "es-MX",
          );
        },
      ),
    );

    return participant;
  }

  async function editParticipant(
    participantId: string,
    payload: UpdateTripParticipantPayload,
  ) {
    const updated =
      await updateTripParticipant(
        participantId,
        payload,
      );

    setParticipants((current) =>
      current.map((participant) =>
        participant.id ===
        participantId
          ? updated
          : participant,
      ),
    );

    return updated;
  }

  async function deleteParticipant(
    participantId: string,
  ) {
    await removeTripParticipant(
      participantId,
    );

    setParticipants((current) =>
      current.filter(
        (participant) =>
          participant.id !==
          participantId,
      ),
    );
  }

  return {
    participants,
    loading,
    error,
    refreshParticipants,
    createParticipant,
    editParticipant,
    deleteParticipant,
  };
}