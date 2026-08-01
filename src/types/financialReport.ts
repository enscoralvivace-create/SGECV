import type {
  ReportDocument,
} from "@/types/report";

export type FinancialReportChargeStatus =
  | "pending"
  | "partial"
  | "paid";

export interface FinancialReportMemberRow {
  memberId: number;
  memberName: string;
  chargeCount: number;
  totalCharged: number;
  totalPaid: number;
  totalPending: number;
  recoveryPercentage: number;
  status: FinancialReportChargeStatus;
}

export interface FinancialReportFeeTypeRow {
  feeTypeId: number;
  feeTypeName: string;
  category: string;
  chargeCount: number;
  totalCharged: number;
  totalPaid: number;
  totalPending: number;
  recoveryPercentage: number;
}

export interface FinancialReportPaymentMethodRow {
  paymentMethod: string;
  paymentCount: number;
  totalPaid: number;
  percentage: number;
}

export interface FinancialReportSummary {
  totalChargesCount: number;
  totalPaymentsCount: number;
  totalCharged: number;
  totalPaid: number;
  totalPending: number;
  recoveryPercentage: number;
  paidChargesCount: number;
  partialChargesCount: number;
  pendingChargesCount: number;
  membersWithCharges: number;
  membersWithPendingBalance: number;
}

export interface FinancialReportData {
  document: ReportDocument<FinancialReportMemberRow>;
  summary: FinancialReportSummary;
  members: FinancialReportMemberRow[];
  feeTypes: FinancialReportFeeTypeRow[];
  paymentMethods: FinancialReportPaymentMethodRow[];
}