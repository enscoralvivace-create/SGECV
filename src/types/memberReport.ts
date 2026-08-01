import type {
  MemberStatus,
  MemberVoice,
} from "@/types/member";

import type {
  ReportDocument,
} from "@/types/report";

export interface MemberReportRow {
  id: number;
  fullName: string;
  voice: MemberVoice;
  status: MemberStatus;
  email: string;
  phone: string;
  joinDate: string;
}

export interface MemberVoiceSummary {
  voice: MemberVoice;
  total: number;
  percentage: number;
}

export interface MemberStatusSummary {
  status: MemberStatus;
  total: number;
  percentage: number;
}

export interface MemberReportSummary {
  totalMembers: number;
  activeMembers: number;
  temporaryLeaveMembers: number;
  inactiveMembers: number;
  permanentlyInactiveMembers: number;
  activePercentage: number;
  voices: MemberVoiceSummary[];
  statuses: MemberStatusSummary[];
}

export interface MemberReportData {
  document: ReportDocument<MemberReportRow>;
  summary: MemberReportSummary;
  members: MemberReportRow[];
}