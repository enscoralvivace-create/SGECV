export type TripMemberRole =
  | "participant"
  | "staff"
  | "director";

export type TripParticipationStatus =
  | "invited"
  | "confirmed"
  | "cancelled";

export interface TripMember {
  id: string;

  trip_id: string;

  member_id: number;

  role: TripMemberRole;

  participation_status:
    TripParticipationStatus;

  created_at: string;
}

export interface TripMemberListItem {
  id: string;

  tripId: string;

  memberId: number;

  memberName: string;

  memberVoice: string | null;

  role: TripMemberRole;

  participationStatus:
    TripParticipationStatus;

  createdAt: string;
}

export interface AddTripMemberPayload {
  tripId: string;

  memberId: number;

  role: TripMemberRole;

  participationStatus:
    TripParticipationStatus;
}