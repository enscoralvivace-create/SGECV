"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  getTripExpenses,
} from "@/services/tripExpenseService";

import {
  getTripFinancialSummary,
} from "@/services/tripService";

import type {
  TripExpense,
} from "@/types/tripExpense";

import type {
  TripFinancialDashboardMetrics,
  TripFinancialSummary,
  TripMemberFinancialStatus,
  TripParticipantFinancialSummary,
} from "@/types/tripFinancial";

export interface TripFinancialReconciliation {
  estimatedBudget: number;

  totalCharged: number;

  totalPaid: number;

  totalPending: number;

  totalExpenses: number;

  availableCash: number;

  budgetRemaining: number;

  projectedBalance: number;

  expenseBudgetPercentage: number;
}

export interface TripExpenseCategorySummary {
  category: string;

  expenseCount: number;

  totalAmount: number;

  percentageOfExpenses: number;

  percentageOfBudget: number;
}

interface UseTripFinancialDashboardResult {
  summary: TripFinancialSummary | null;

  participants:
    TripParticipantFinancialSummary[];

  metrics: TripFinancialDashboardMetrics;

  reconciliation:
    TripFinancialReconciliation;

  expenseCategories:
    TripExpenseCategorySummary[];

  leadingExpenseCategory:
    TripExpenseCategorySummary | null;

  expenses: TripExpense[];

  loading: boolean;

  error: string | null;

  refreshFinancialDashboard:
    () => Promise<void>;
}

function getErrorMessage(
  error: unknown,
): string {
  if (error instanceof Error) {
    return error.message;
  }

  return (
    "No fue posible cargar el dashboard " +
    "financiero del viaje."
  );
}

function getFinancialStatus(
  totalCharged: number,
  totalPaid: number,
): TripMemberFinancialStatus {
  if (
    totalCharged > 0 &&
    totalPaid >= totalCharged
  ) {
    return "paid";
  }

  if (totalPaid > 0) {
    return "partial";
  }

  return "pending";
}

function calculatePercentage(
  value: number,
  total: number,
): number {
  if (total <= 0) {
    return 0;
  }

  return Math.round(
    (value / total) * 1000,
  ) / 10;
}

function consolidateParticipants(
  summary: TripFinancialSummary | null,
): TripParticipantFinancialSummary[] {
  if (!summary) {
    return [];
  }

  const participantsMap = new Map<
    number,
    TripParticipantFinancialSummary
  >();

  summary.members.forEach((charge) => {
    const currentParticipant =
      participantsMap.get(
        charge.memberId,
      );

    if (!currentParticipant) {
      participantsMap.set(
        charge.memberId,
        {
          memberId: charge.memberId,
          memberName: charge.memberName,
          chargeCount: 1,
          totalCharged:
            charge.totalCharged,
          totalPaid:
            charge.totalPaid,
          totalPending:
            charge.totalPending,
          status: charge.status,
        },
      );

      return;
    }

    currentParticipant.chargeCount += 1;

    currentParticipant.totalCharged +=
      charge.totalCharged;

    currentParticipant.totalPaid +=
      charge.totalPaid;

    currentParticipant.totalPending +=
      charge.totalPending;

    currentParticipant.status =
      getFinancialStatus(
        currentParticipant.totalCharged,
        currentParticipant.totalPaid,
      );
  });

  return Array.from(
    participantsMap.values(),
  ).sort((firstParticipant, secondParticipant) =>
    firstParticipant.memberName.localeCompare(
      secondParticipant.memberName,
      "es",
    ),
  );
}

function consolidateExpenseCategories(
  expenses: TripExpense[],
  estimatedBudget: number,
): TripExpenseCategorySummary[] {
  const totalExpenses =
    expenses.reduce(
      (
        accumulatedTotal,
        expense,
      ) =>
        accumulatedTotal +
        expense.amount,
      0,
    );

  const categoryMap = new Map<
    string,
    {
      expenseCount: number;
      totalAmount: number;
    }
  >();

  expenses.forEach((expense) => {
    const normalizedCategory =
      expense.category.trim() ||
      "Sin categoría";

    const currentCategory =
      categoryMap.get(
        normalizedCategory,
      );

    if (!currentCategory) {
      categoryMap.set(
        normalizedCategory,
        {
          expenseCount: 1,
          totalAmount:
            expense.amount,
        },
      );

      return;
    }

    currentCategory.expenseCount += 1;
    currentCategory.totalAmount +=
      expense.amount;
  });

  return Array.from(
    categoryMap.entries(),
  )
    .map(
      ([
        category,
        categoryData,
      ]) => ({
        category,

        expenseCount:
          categoryData.expenseCount,

        totalAmount:
          categoryData.totalAmount,

        percentageOfExpenses:
          calculatePercentage(
            categoryData.totalAmount,
            totalExpenses,
          ),

        percentageOfBudget:
          calculatePercentage(
            categoryData.totalAmount,
            estimatedBudget,
          ),
      }),
    )
    .sort(
      (
        firstCategory,
        secondCategory,
      ) =>
        secondCategory.totalAmount -
        firstCategory.totalAmount,
    );
}

export function useTripFinancialDashboard(
  tripId: string,
): UseTripFinancialDashboardResult {
  const [
    summary,
    setSummary,
  ] = useState<TripFinancialSummary | null>(
    null,
  );

  const [
    expenses,
    setExpenses,
  ] = useState<TripExpense[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const requestIdRef = useRef(0);

  const refreshFinancialDashboard =
    useCallback(async (): Promise<void> => {
      const requestId =
        requestIdRef.current + 1;

      requestIdRef.current = requestId;

      setLoading(true);
      setError(null);

      try {
        const [
          financialSummary,
          tripExpenses,
        ] = await Promise.all([
          getTripFinancialSummary(
            tripId,
          ),
          getTripExpenses(
            tripId,
          ),
        ]);

        if (
          requestId !==
          requestIdRef.current
        ) {
          return;
        }

        setSummary(financialSummary);
        setExpenses(tripExpenses);
      } catch (loadError) {
        if (
          requestId !==
          requestIdRef.current
        ) {
          return;
        }

        setSummary(null);
        setExpenses([]);
        setError(
          getErrorMessage(loadError),
        );
      } finally {
        if (
          requestId ===
          requestIdRef.current
        ) {
          setLoading(false);
        }
      }
    }, [tripId]);

  useEffect(() => {
    void refreshFinancialDashboard();

    return () => {
      requestIdRef.current += 1;
    };
  }, [refreshFinancialDashboard]);

  const participants = useMemo(
    () =>
      consolidateParticipants(summary),
    [summary],
  );

  const metrics = useMemo<
    TripFinancialDashboardMetrics
  >(() => {
    const paidParticipantCount =
      participants.filter(
        (participant) =>
          participant.status === "paid",
      ).length;

    const partialParticipantCount =
      participants.filter(
        (participant) =>
          participant.status === "partial",
      ).length;

    const pendingParticipantCount =
      participants.filter(
        (participant) =>
          participant.status === "pending",
      ).length;

    return {
      participantCount:
        participants.length,

      chargeCount:
        summary?.members.length ?? 0,

      paidParticipantCount,

      partialParticipantCount,

      pendingParticipantCount,

      budgetCoveragePercentage:
        calculatePercentage(
          summary?.totalPaid ?? 0,
          summary?.estimatedBudget ?? 0,
        ),
    };
  }, [participants, summary]);

  const reconciliation = useMemo<
    TripFinancialReconciliation
  >(() => {
    const estimatedBudget =
      summary?.estimatedBudget ?? 0;

    const totalCharged =
      summary?.totalCharged ?? 0;

    const totalPaid =
      summary?.totalPaid ?? 0;

    const totalPending =
      summary?.totalPending ?? 0;

    const totalExpenses =
      expenses.reduce(
        (
          accumulatedTotal,
          expense,
        ) =>
          accumulatedTotal +
          expense.amount,
        0,
      );

    return {
      estimatedBudget,

      totalCharged,

      totalPaid,

      totalPending,

      totalExpenses,

      availableCash:
        totalPaid - totalExpenses,

      budgetRemaining:
        estimatedBudget -
        totalExpenses,

      projectedBalance:
        totalCharged -
        totalExpenses,

      expenseBudgetPercentage:
        calculatePercentage(
          totalExpenses,
          estimatedBudget,
        ),
    };
  }, [expenses, summary]);

  const expenseCategories = useMemo<
    TripExpenseCategorySummary[]
  >(
    () =>
      consolidateExpenseCategories(
        expenses,
        summary?.estimatedBudget ?? 0,
      ),
    [
      expenses,
      summary?.estimatedBudget,
    ],
  );

  const leadingExpenseCategory =
    expenseCategories[0] ?? null;

  return {
    summary,
    participants,
    metrics,
    reconciliation,
    expenseCategories,
    leadingExpenseCategory,
    expenses,
    loading,
    error,
    refreshFinancialDashboard,
  };
}