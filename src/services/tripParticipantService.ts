import { supabase } from "@/lib/supabase";

import type {
  AddTripParticipantPayload,
  TripParticipant,
  TripParticipantRow,
  UpdateTripParticipantPayload,
} from "@/types/tripParticipant";

function getRelatedMember(
  row: TripParticipantRow,
): {
  name: string;
  last_name: string;
  voice: string | null;
} | null {
  if (!row.members) {
    return null;
  }

  if (Array.isArray(row.members)) {
    return row.members[0] ?? null;
  }

  return row.members;
}

function mapTripParticipant(
  row: TripParticipantRow,
): TripParticipant {
  const member = getRelatedMember(row);

  return {
    id: row.id,
    tripId: row.trip_id,
    memberId: row.member_id,
    memberName: member?.name ?? "",
    memberLastName: member?.last_name ?? "",
    memberVoice: member?.voice ?? null,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export async function getTripParticipants(
  tripId: string,
): Promise<TripParticipant[]> {
  const { data, error } = await supabase
    .from("trip_participants")
    .select(`
      id,
      trip_id,
      member_id,
      status,
      notes,
      created_at,
      members (
        name,
        last_name,
        voice
      )
    `)
    .eq("trip_id", tripId)
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return (
    (data ?? []) as TripParticipantRow[]
  )
    .map(mapTripParticipant)
    .sort((firstParticipant, secondParticipant) => {
      const firstName =
        `${firstParticipant.memberLastName} ${firstParticipant.memberName}`.trim();

      const secondName =
        `${secondParticipant.memberLastName} ${secondParticipant.memberName}`.trim();

      return firstName.localeCompare(
        secondName,
        "es-MX",
      );
    });
}

export async function addTripParticipant(
  payload: AddTripParticipantPayload,
): Promise<TripParticipant> {
  const { data, error } = await supabase
    .from("trip_participants")
    .insert({
      trip_id: payload.tripId,
      member_id: payload.memberId,
      status: payload.status ?? "pending",
      notes: payload.notes?.trim() || null,
    })
    .select(`
      id,
      trip_id,
      member_id,
      status,
      notes,
      created_at,
      members (
        name,
        last_name,
        voice
      )
    `)
    .single();

  if (error) {
    throw error;
  }

  return mapTripParticipant(
    data as TripParticipantRow,
  );
}

export async function updateTripParticipant(
  participantId: string,
  payload: UpdateTripParticipantPayload,
): Promise<TripParticipant> {
  const updatePayload: {
    status?: UpdateTripParticipantPayload["status"];
    notes?: string | null;
    updated_at: string;
  } = {
    updated_at: new Date().toISOString(),
  };

  if (payload.status !== undefined) {
    updatePayload.status = payload.status;
  }

  if (payload.notes !== undefined) {
    updatePayload.notes =
      payload.notes?.trim() || null;
  }

  const { data, error } = await supabase
    .from("trip_participants")
    .update(updatePayload)
    .eq("id", participantId)
    .select(`
      id,
      trip_id,
      member_id,
      status,
      notes,
      created_at,
      members (
        name,
        last_name,
        voice
      )
    `)
    .single();

  if (error) {
    throw error;
  }

  return mapTripParticipant(
    data as TripParticipantRow,
  );
}

export async function removeTripParticipant(
  participantId: string,
): Promise<void> {
  const { error } = await supabase
    .from("trip_participants")
    .delete()
    .eq("id", participantId);

  if (error) {
    throw error;
  }
}