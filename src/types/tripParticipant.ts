export type TripParticipantStatus =
  | "pending"
  | "confirmed"
  | "declined"
  | "cancelled";

export interface TripParticipant {
  id: string;
  tripId: string;
  memberId: number;
  memberName: string;
  memberLastName: string;
  memberVoice: string | null;
  status: TripParticipantStatus;
  notes: string | null;
  createdAt: string;
}

export interface TripParticipantRow {
  id: string;
  trip_id: string;
  member_id: number;
  status: TripParticipantStatus;
  notes: string | null;
  created_at: string;
  members:
    | {
        name: string;
        last_name: string;
        voice: string | null;
      }
    | {
        name: string;
        last_name: string;
        voice: string | null;
      }[]
    | null;
}

export interface AddTripParticipantPayload {
  tripId: string;
  memberId: number;
  status?: TripParticipantStatus;
  notes?: string | null;
}

export interface UpdateTripParticipantPayload {
  status?: TripParticipantStatus;
  notes?: string | null;
}

export const tripParticipantStatusLabels: Record<
  TripParticipantStatus,
  string
> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  declined: "No participará",
  cancelled: "Cancelado",
};