export interface TripChargeFormData {
  feeTypeId: string;
  amount: string;
  dueDate: string;
  notes: string;
}

export interface CreateTripChargesPayload {
  tripId: string;
  memberIds: number[];
  feeTypeId: string;
  amount: number;
  dueDate: string | null;
  notes: string | null;
}

export interface CreateTripChargesResult {
  createdCount: number;
  skippedCount: number;
}

export const emptyTripChargeForm:
  TripChargeFormData = {
    feeTypeId: "",
    amount: "",
    dueDate: "",
    notes: "",
  };