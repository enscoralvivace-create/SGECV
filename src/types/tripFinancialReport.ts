export interface TripFinancialReportSummary {
  estimatedBudget: number;
  totalCharges: number;
  totalPaid: number;
  totalPending: number;
  totalExpenses: number;
  availableCash: number;
  budgetRemaining: number;
  projectedBalance: number;
  paymentPercentage: number;
  expenseBudgetPercentage: number;
}

export interface TripFinancialReportParticipant {
  memberId: number | string;
  memberName: string;
  totalCharged: number;
  totalPaid: number;
  balance: number;
  paymentStatus:
    | "paid"
    | "partial"
    | "pending";
}

export interface TripFinancialReportExpenseCategory {
  category: string;
  expenseCount: number;
  totalAmount: number;
  expensePercentage: number;
  budgetPercentage: number;
}

export interface TripFinancialReportHealth {
  score: number;
  level:
    | "excellent"
    | "good"
    | "attention"
    | "critical";
  diagnosis: string;
  factors: string[];
  recommendations: string[];
}

export interface TripFinancialReportData {
  tripId: string;
  tripName: string;
  generatedAt: string;
  summary: TripFinancialReportSummary;
  participants: TripFinancialReportParticipant[];
  expenseCategories:
    TripFinancialReportExpenseCategory[];
  health: TripFinancialReportHealth;
}