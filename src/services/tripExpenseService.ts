import { supabase } from "@/lib/supabase";

import type {
  TripExpense,
  TripExpenseFormData,
} from "@/types/tripExpense";

interface TripExpenseRow {
  id: string;

  trip_id: string;

  description: string;

  category: TripExpense["category"];

  amount: number | string;

  expense_date: string;

  supplier: string | null;

  notes: string | null;

  created_at: string;
}

interface TripExpensePayload {
  trip_id: string;

  description: string;

  category: TripExpense["category"];

  amount: number;

  expense_date: string;

  supplier: string | null;

  notes: string | null;
}

function rowToTripExpense(
  row: TripExpenseRow,
): TripExpense {
  return {
    id: row.id,

    tripId: row.trip_id,

    description: row.description,

    category: row.category,

    amount: Number(row.amount),

    expenseDate: row.expense_date,

    supplier: row.supplier,

    notes: row.notes,

    createdAt: row.created_at,
  };
}

function formToPayload(
  tripId: string,
  form: TripExpenseFormData,
): TripExpensePayload {
  return {
    trip_id: tripId,

    description:
      form.description.trim(),

    category: form.category,

    amount: Number(form.amount),

    expense_date: form.expenseDate,

    supplier:
      form.supplier.trim() || null,

    notes:
      form.notes.trim() || null,
  };
}

export async function getTripExpenses(
  tripId: string,
): Promise<TripExpense[]> {
  const { data, error } = await supabase
    .from("trip_expenses")
    .select(`
      id,
      trip_id,
      description,
      category,
      amount,
      expense_date,
      supplier,
      notes,
      created_at
    `)
    .eq("trip_id", tripId)
    .order("expense_date", {
      ascending: false,
    })
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return (
    (data ?? []) as TripExpenseRow[]
  ).map(rowToTripExpense);
}

export async function createTripExpense(
  tripId: string,
  form: TripExpenseFormData,
): Promise<TripExpense> {
  const payload = formToPayload(
    tripId,
    form,
  );

  const { data, error } = await supabase
    .from("trip_expenses")
    .insert(payload)
    .select(`
      id,
      trip_id,
      description,
      category,
      amount,
      expense_date,
      supplier,
      notes,
      created_at
    `)
    .single();

  if (error) {
    throw error;
  }

  return rowToTripExpense(
    data as TripExpenseRow,
  );
}

export async function updateTripExpense(
  expenseId: string,
  tripId: string,
  form: TripExpenseFormData,
): Promise<TripExpense> {
  const payload = formToPayload(
    tripId,
    form,
  );

  const { data, error } = await supabase
    .from("trip_expenses")
    .update(payload)
    .eq("id", expenseId)
    .eq("trip_id", tripId)
    .select(`
      id,
      trip_id,
      description,
      category,
      amount,
      expense_date,
      supplier,
      notes,
      created_at
    `)
    .single();

  if (error) {
    throw error;
  }

  return rowToTripExpense(
    data as TripExpenseRow,
  );
}

export async function deleteTripExpense(
  expenseId: string,
  tripId: string,
): Promise<void> {
  const { error } = await supabase
    .from("trip_expenses")
    .delete()
    .eq("id", expenseId)
    .eq("trip_id", tripId);

  if (error) {
    throw error;
  }
}