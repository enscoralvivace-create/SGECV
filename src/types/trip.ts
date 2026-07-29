export type TripStatus =
  | "planning"
  | "active"
  | "completed"
  | "cancelled";

export interface Trip {
  id: string;

  name: string;

  destination: string;

  start_date: string | null;

  end_date: string | null;

  description: string | null;

  responsible_member_id: number | null;

  estimated_budget: number | null;

  status: TripStatus;

  created_at: string;

  updated_at: string;
}

export interface TripFormData {
  name: string;

  destination: string;

  startDate: string;

  endDate: string;

  description: string;

  responsibleMemberId: string;

  estimatedBudget: string;

  status: TripStatus;
}

export const emptyTripForm: TripFormData = {
  name: "",

  destination: "",

  startDate: "",

  endDate: "",

  description: "",

  responsibleMemberId: "",

  estimatedBudget: "",

  status: "planning",
};