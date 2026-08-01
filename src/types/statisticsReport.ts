import type {
  ReportDocument,
} from "@/types/report";

export interface StatisticsReportMetric {
  id: string;
  label: string;
  value: string | number;
  description: string;
  category:
    | "members"
    | "attendance"
    | "repertoire"
    | "finances"
    | "trips";
}

export interface StatisticsReportModuleSummary {
  category:
    | "members"
    | "attendance"
    | "repertoire"
    | "finances"
    | "trips";
  title: string;
  description: string;
  metrics: StatisticsReportMetric[];
}

export interface StatisticsReportSummary {
  totalMembers: number;
  activeMembers: number;
  attendancePercentage: number;
  punctualityPercentage: number;
  totalRepertoireWorks: number;
  activeRepertoireWorks: number;
  totalCharges: number;
  totalPaid: number;
  totalPending: number;
  recoveryPercentage: number;
  totalTrips: number;
  activeTrips: number;
  completedTrips: number;
}

export interface StatisticsReportData {
  document: ReportDocument<StatisticsReportMetric>;
  summary: StatisticsReportSummary;
  modules: StatisticsReportModuleSummary[];
  metrics: StatisticsReportMetric[];
}