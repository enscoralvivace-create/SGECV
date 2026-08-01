import type {
  RepertoireStatus,
} from "@/types/repertoire";

import type {
  ReportDocument,
} from "@/types/report";

export interface RepertoireReportRow {
  id: number;
  title: string;
  composer: string;
  arranger: string;
  key: string;
  durationMinutes: number | null;
  formattedDuration: string;
  status: RepertoireStatus;
  notes: string;
}

export interface RepertoireStatusSummary {
  status: RepertoireStatus;
  total: number;
  percentage: number;
}

export interface RepertoireComposerSummary {
  composer: string;
  totalWorks: number;
  percentage: number;
}

export interface RepertoireReportSummary {
  totalWorks: number;
  activeWorks: number;
  studyWorks: number;
  archivedWorks: number;
  totalDurationMinutes: number;
  formattedTotalDuration: string;
  worksWithDuration: number;
  worksWithoutDuration: number;
  statuses: RepertoireStatusSummary[];
  composers: RepertoireComposerSummary[];
}

export interface RepertoireReportData {
  document: ReportDocument<RepertoireReportRow>;
  summary: RepertoireReportSummary;
  works: RepertoireReportRow[];
}