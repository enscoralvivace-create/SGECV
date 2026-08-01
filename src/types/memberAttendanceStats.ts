export type MemberAttendanceStatus =
  | "present"
  | "late"
  | "justified"
  | "absent";

export interface MemberAttendanceRecord {
  attendanceId: string;
  sessionId: string;
  sessionTitle: string;
  sessionDate: string;
  checkedInAt: string | null;
  status: MemberAttendanceStatus;
  notes: string | null;
}

export interface MemberAttendanceTotals {
  totalSessions: number;
  presentCount: number;
  lateCount: number;
  justifiedCount: number;
  absentCount: number;
}

export interface MemberAttendancePercentages {
  attendancePercentage: number;
  punctualityPercentage: number;
  justifiedPercentage: number;
  absencePercentage: number;
}

export interface MemberAttendanceTrendPoint {
  period: string;
  label: string;
  totalSessions: number;
  attendedSessions: number;
  attendancePercentage: number;
}

export interface MemberAttendanceStats {
  memberId: number;
  memberName: string;
  memberStatus: string;
  voice: string | null;
  totals: MemberAttendanceTotals;
  percentages: MemberAttendancePercentages;
  recentRecords: MemberAttendanceRecord[];
  trend: MemberAttendanceTrendPoint[];
}

export interface MemberAttendanceStatsFilters {
  startDate?: string;
  endDate?: string;
  recentLimit?: number;
}

export const EMPTY_MEMBER_ATTENDANCE_TOTALS:
MemberAttendanceTotals = {
  totalSessions: 0,
  presentCount: 0,
  lateCount: 0,
  justifiedCount: 0,
  absentCount: 0,
};

export const EMPTY_MEMBER_ATTENDANCE_PERCENTAGES:
MemberAttendancePercentages = {
  attendancePercentage: 0,
  punctualityPercentage: 0,
  justifiedPercentage: 0,
  absencePercentage: 0,
};