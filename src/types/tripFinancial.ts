export type TripMemberFinancialStatus =
  | "paid"
  | "partial"
  | "pending";

export interface TripMemberFinancialSummary {
  chargeId: string;

  memberId: number;

  memberName: string;

  feeTypeName: string;

  totalCharged: number;

  totalPaid: number;

  totalPending: number;

  status: TripMemberFinancialStatus;
}

export interface TripParticipantFinancialSummary {
  memberId: number;

  memberName: string;

  chargeCount: number;

  totalCharged: number;

  totalPaid: number;

  totalPending: number;

  status: TripMemberFinancialStatus;
}

export interface TripFinancialSummary {
  estimatedBudget: number;

  totalCharged: number;

  totalPaid: number;

  totalPending: number;

  recoveryPercentage: number;

  members: TripMemberFinancialSummary[];
}

export interface TripFinancialDashboardMetrics {
  participantCount: number;

  chargeCount: number;

  paidParticipantCount: number;

  partialParticipantCount: number;

  pendingParticipantCount: number;

  budgetCoveragePercentage: number;
}