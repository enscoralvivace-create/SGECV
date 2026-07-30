export const TRIP_BUDGET_CATEGORIES = [
  "transportation",
  "lodging",
  "food",
  "registration",
  "insurance",
  "materials",
  "activities",
  "other",
] as const;

export type TripBudgetCategory =
  (typeof TRIP_BUDGET_CATEGORIES)[number];

export const TRIP_BUDGET_CATEGORY_LABELS: Record<
  TripBudgetCategory,
  string
> = {
  transportation: "Transporte",
  lodging: "Hospedaje",
  food: "Alimentación",
  registration: "Inscripción",
  insurance: "Seguros",
  materials: "Materiales",
  activities: "Actividades",
  other: "Otros",
};

export interface TripBudgetItem {
  id: string;
  tripId: string;
  category: TripBudgetCategory;
  description: string;
  estimatedAmount: number;
  actualAmount: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TripBudgetItemFormData {
  category: TripBudgetCategory;
  description: string;
  estimatedAmount: string;
  actualAmount: string;
  notes: string;
}

export interface TripBudgetItemPayload {
  trip_id: string;
  category: TripBudgetCategory;
  description: string;
  estimated_amount: number;
  actual_amount: number;
  notes: string | null;
}

export interface TripBudgetSummary {
  totalEstimated: number;
  totalActual: number;
  variance: number;
  executionPercentage: number;
}

export const EMPTY_TRIP_BUDGET_FORM: TripBudgetItemFormData = {
  category: "transportation",
  description: "",
  estimatedAmount: "",
  actualAmount: "",
  notes: "",
};