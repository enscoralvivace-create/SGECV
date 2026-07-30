import { supabase } from "@/lib/supabase";

import type {
  TripBudgetItem,
  TripBudgetItemFormData,
  TripBudgetItemPayload,
  TripBudgetSummary,
} from "@/types/tripBudget";

interface TripBudgetItemRow {
  id: string;
  trip_id: string;
  category: TripBudgetItem["category"];
  description: string;
  estimated_amount: number;
  actual_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function mapRow(
  row: TripBudgetItemRow,
): TripBudgetItem {
  return {
    id: row.id,
    tripId: row.trip_id,
    category: row.category,
    description: row.description,
    estimatedAmount: Number(
      row.estimated_amount,
    ),
    actualAmount: Number(
      row.actual_amount,
    ),
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function formToPayload(
  tripId: string,
  form: TripBudgetItemFormData,
): TripBudgetItemPayload {
  return {
    trip_id: tripId,
    category: form.category,
    description: form.description.trim(),
    estimated_amount:
      Number(form.estimatedAmount) || 0,
    actual_amount:
      Number(form.actualAmount) || 0,
    notes:
      form.notes.trim() || null,
  };
}

export async function getTripBudgetItems(
  tripId: string,
): Promise<TripBudgetItem[]> {
  const { data, error } =
    await supabase
      .from("trip_budget_items")
      .select("*")
      .eq("trip_id", tripId)
      .order("category")
      .order("description");

  if (error) {
    throw error;
  }

  return (
    (data as TripBudgetItemRow[])
      ?.map(mapRow) ?? []
  );
}

export async function createTripBudgetItem(
  tripId: string,
  form: TripBudgetItemFormData,
): Promise<void> {
  const payload =
    formToPayload(
      tripId,
      form,
    );

  const { error } =
    await supabase
      .from("trip_budget_items")
      .insert(payload);

  if (error) {
    throw error;
  }
}

export async function updateTripBudgetItem(
  itemId: string,
  tripId: string,
  form: TripBudgetItemFormData,
): Promise<void> {
  const payload =
    formToPayload(
      tripId,
      form,
    );

  const { error } =
    await supabase
      .from("trip_budget_items")
      .update(payload)
      .eq("id", itemId)
      .eq("trip_id", tripId);

  if (error) {
    throw error;
  }
}

export async function deleteTripBudgetItem(
  itemId: string,
  tripId: string,
): Promise<void> {
  const { error } =
    await supabase
      .from("trip_budget_items")
      .delete()
      .eq("id", itemId)
      .eq("trip_id", tripId);

  if (error) {
    throw error;
  }
}

export function calculateTripBudgetSummary(
  items: TripBudgetItem[],
): TripBudgetSummary {
  const totalEstimated =
    items.reduce(
      (sum, item) =>
        sum + item.estimatedAmount,
      0,
    );

  const totalActual =
    items.reduce(
      (sum, item) =>
        sum + item.actualAmount,
      0,
    );

  const variance =
    totalActual - totalEstimated;

  const executionPercentage =
    totalEstimated === 0
      ? 0
      : (
          totalActual /
          totalEstimated
        ) * 100;

  return {
    totalEstimated,
    totalActual,
    variance,
    executionPercentage,
  };
}