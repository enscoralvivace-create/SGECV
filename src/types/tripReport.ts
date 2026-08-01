import type {
  ReportDocument,
} from "@/types/report";

import type {
  TripStatus,
} from "@/types/trip";

export interface TripReportRow {
  tripId: string;
  tripName: string;
  destination: string;
  status: TripStatus;
  participantCount: number;
  estimatedBudget: number;
  totalCharged: number;
  totalPaid: number;
  totalPending: number;
  recoveryPercentage: number;
  budgetCoveragePercentage: number;
}

export interface TripReportBudgetRow {
  tripId: string;
  tripName: string;
  totalEstimated: number;
  totalActual: number;
  variance: number;
  executionPercentage: number;
  conceptCount: number;
}

export interface TripReportStatusSummary {
  status: TripStatus;
  label: string;
  total: number;
  percentage: number;
}

export interface TripReportSummary {
  totalTrips: number;
  planningTrips: number;
  activeTrips: number;
  completedTrips: number;
  cancelledTrips: number;
  totalParticipants: number;
  totalEstimatedBudget: number;
  totalCharged: number;
  totalPaid: number;
  totalPending: number;
  recoveryPercentage: number;
  budgetCoveragePercentage: number;
  totalEstimatedExpenses: number;
  totalActualExpenses: number;
  totalBudgetVariance: number;
  budgetExecutionPercentage: number;
  statuses: TripReportStatusSummary[];
}

export interface TripReportData {
  document: ReportDocument<TripReportRow>;
  summary: TripReportSummary;
  trips: TripReportRow[];
  budgets: TripReportBudgetRow[];
}