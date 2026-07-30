import type {
  TripExpenseCategorySummary,
  TripFinancialReconciliation,
} from "@/hooks/useTripFinancialDashboard";

import type {
  TripParticipantFinancialSummary,
} from "@/types/tripFinancial";

import type {
  TripFinancialReportData,
} from "@/types/tripFinancialReport";

import {
  calculateTripFinancialHealth,
} from "@/utils/tripFinancialHealth";

interface BuildTripFinancialReportDataParams {
  tripId: string;

  tripName: string;

  reconciliation:
    TripFinancialReconciliation;

  participants:
    TripParticipantFinancialSummary[];

  expenseCategories:
    TripExpenseCategorySummary[];

  generatedAt?: Date;
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

export function buildTripFinancialReportData({
  tripId,
  tripName,
  reconciliation,
  participants,
  expenseCategories,
  generatedAt = new Date(),
}: BuildTripFinancialReportDataParams):
  TripFinancialReportData {
  const health =
    calculateTripFinancialHealth(
      reconciliation,
      participants,
    );

  return {
    tripId,
    tripName,
    generatedAt:
      generatedAt.toISOString(),

    summary: {
      estimatedBudget:
        reconciliation.estimatedBudget,

      totalCharges:
        reconciliation.totalCharged,

      totalPaid:
        reconciliation.totalPaid,

      totalPending:
        reconciliation.totalPending,

      totalExpenses:
        reconciliation.totalExpenses,

      availableCash:
        reconciliation.availableCash,

      budgetRemaining:
        reconciliation.budgetRemaining,

      projectedBalance:
        reconciliation.projectedBalance,

      paymentPercentage:
        calculatePercentage(
          reconciliation.totalPaid,
          reconciliation.totalCharged,
        ),

      expenseBudgetPercentage:
        reconciliation
          .expenseBudgetPercentage,
    },

    participants:
      participants.map(
        (participant) => ({
          memberId:
            participant.memberId,

          memberName:
            participant.memberName,

          totalCharged:
            participant.totalCharged,

          totalPaid:
            participant.totalPaid,

          balance:
            participant.totalPending,

          paymentStatus:
            participant.status,
        }),
      ),

    expenseCategories:
      expenseCategories.map(
        (category) => ({
          category:
            category.category,

          expenseCount:
            category.expenseCount,

          totalAmount:
            category.totalAmount,

          expensePercentage:
            category
              .percentageOfExpenses,

          budgetPercentage:
            category
              .percentageOfBudget,
        }),
      ),

    health: {
      score:
        health.score,

      level:
        health.level,

      diagnosis:
        health.summary,

      factors:
        health.factors,

      recommendations:
        health.recommendations,
    },
  };
}