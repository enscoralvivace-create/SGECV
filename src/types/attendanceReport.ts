import type {
  AttendanceStatus,
} from "@/types/attendance";

import type {
  ReportDocument,
} from "@/types/report";

export interface AttendanceReportFilters {
  startDate: string | null;
  endDate: string | null;
}

export interface AttendanceReportMemberRow {
  memberId: number;
  memberName: string;
  voice: string;
  totalSessions: number;
  presentCount: number;
  lateCount: number;
  justifiedCount: number;
  absentCount: number;
  attendedCount: number;
  attendancePercentage: number;
}

export interface AttendanceReportSessionRow {
  sessionId: string;
  rehearsalDate: string;
  title: string;
  totalMembers: number;
  presentCount: number;
  lateCount: number;
  justifiedCount: number;
  absentCount: number;
  attendancePercentage: number;
}

export interface AttendanceStatusSummary {
  status: AttendanceStatus;
  label: string;
  total: number;
  percentage: number;
}

export interface AttendanceReportSummary {
  totalSessions: number;
  totalMembers: number;
  totalRecords: number;
  presentCount: number;
  lateCount: number;
  justifiedCount: number;
  absentCount: number;
  attendedCount: number;
  attendancePercentage: number;
  punctualityPercentage: number;
  statuses: AttendanceStatusSummary[];
}

export interface AttendanceReportData {
  document: ReportDocument<AttendanceReportMemberRow>;
  filters: AttendanceReportFilters;
  summary: AttendanceReportSummary;
  members: AttendanceReportMemberRow[];
  sessions: AttendanceReportSessionRow[];
}