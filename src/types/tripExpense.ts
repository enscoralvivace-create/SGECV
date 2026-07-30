export type TripExpenseCategory =
  | "Hospedaje"
  | "Transporte"
  | "Alimentos"
  | "Material"
  | "Inscripción"
  | "Logística"
  | "Otro";

export interface TripExpense {
  id: string;

  tripId: string;

  description: string;

  category: TripExpenseCategory;

  amount: number;

  expenseDate: string;

  supplier: string | null;

  notes: string | null;

  createdAt: string;
}

export interface TripExpenseFormData {
  description: string;

  category: TripExpenseCategory;

  amount: string;

  expenseDate: string;

  supplier: string;

  notes: string;
}