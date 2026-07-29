import { supabase } from "@/lib/supabase";

import type {
  AddTripMemberPayload,
  TripMemberListItem,
  TripMemberRole,
  TripParticipationStatus,
} from "@/types/tripMember";

interface TripMemberRow {
  id: string;
  trip_id: string;
  member_id: number;
  role: TripMemberRole;
  participation_status:
    TripParticipationStatus;
  created_at: string;

  members:
    | {
        name: string;
        last_name: string | null;
        voice: string | null;
      }
    | {
        name: string;
        last_name: string | null;
        voice: string | null;
      }[]
    | null;
}

function getRelatedMember(
  relation: TripMemberRow["members"],
) {
  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation;
}

export async function getTripMembers(
  tripId: string,
): Promise<TripMemberListItem[]> {
  const { data, error } = await supabase
    .from("trip_members")
    .select(`
      id,
      trip_id,
      member_id,
      role,
      participation_status,
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

  const rows =
    (data ?? []) as TripMemberRow[];

  return rows.map((row) => {
    const member = getRelatedMember(
      row.members,
    );

    const memberName = member
      ? [
          member.name,
          member.last_name,
        ]
          .filter(Boolean)
          .join(" ")
      : "Integrante no disponible";

    return {
      id: row.id,
      tripId: row.trip_id,
      memberId: row.member_id,
      memberName,
      memberVoice:
        member?.voice ?? null,
      role: row.role,
      participationStatus:
        row.participation_status,
      createdAt: row.created_at,
    };
  });
}

export async function addTripMember(
  payload: AddTripMemberPayload,
): Promise<void> {
  const { error } = await supabase
    .from("trip_members")
    .insert({
      trip_id: payload.tripId,
      member_id: payload.memberId,
      role: payload.role,
      participation_status:
        payload.participationStatus,
    });

  if (error) {
    throw error;
  }
}

export async function updateTripMember(
  id: string,
  role: TripMemberRole,
  participationStatus:
    TripParticipationStatus,
): Promise<void> {
  const { error } = await supabase
    .from("trip_members")
    .update({
      role,
      participation_status:
        participationStatus,
    })
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function removeTripMember(
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from("trip_members")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
}