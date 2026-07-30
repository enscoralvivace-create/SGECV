"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  createTripExpense,
  deleteTripExpense,
  getTripExpenses,
  updateTripExpense,
} from "@/services/tripExpenseService";

import type {
  TripExpense,
  TripExpenseFormData,
} from "@/types/tripExpense";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "No fue posible completar la operación.";
}

export function useTripExpenses(tripId: string) {
  const [expenses, setExpenses] = useState<TripExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestIdRef = useRef(0);

  const refreshExpenses = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    setLoading(true);
    setError(null);

    try {
      const data = await getTripExpenses(tripId);

      if (requestId !== requestIdRef.current) {
        return;
      }

      setExpenses(data);
    } catch (err) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setError(getErrorMessage(err));
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [tripId]);

  useEffect(() => {
    void refreshExpenses();

    return () => {
      requestIdRef.current += 1;
    };
  }, [refreshExpenses]);

  async function addExpense(form: TripExpenseFormData) {
    await createTripExpense(tripId, form);
    await refreshExpenses();
  }

  async function editExpense(
    expenseId: string,
    form: TripExpenseFormData,
  ) {
    await updateTripExpense(expenseId, tripId, form);
    await refreshExpenses();
  }

  async function removeExpense(expenseId: string) {
    await deleteTripExpense(expenseId, tripId);
    await refreshExpenses();
  }

  return {
    expenses,
    loading,
    error,
    refreshExpenses,
    addExpense,
    editExpense,
    removeExpense,
  };
}