export type ReportCategory =
  | "members"
  | "attendance"
  | "repertoire"
  | "finances"
  | "trips"
  | "general";

export type ReportExportFormat =
  | "pdf"
  | "xlsx"
  | "csv";

export type ReportStatus =
  | "available"
  | "planned"
  | "generating"
  | "completed"
  | "error";

export type ReportDatePreset =
  | "current-month"
  | "previous-month"
  | "current-year"
  | "previous-year"
  | "custom";

export interface ReportDateRange {
  startDate: string | null;
  endDate: string | null;
}

export interface ReportFilters {
  datePreset?: ReportDatePreset;
  dateRange?: ReportDateRange;
  memberIds?: string[];
  statuses?: string[];
  searchTerm?: string;
}

export interface ReportDefinition {
  id: string;
  category: ReportCategory;
  title: string;
  description: string;
  status: ReportStatus;
  availableFormats: ReportExportFormat[];
  defaultFormat: ReportExportFormat;
}

export interface ReportOrganization {
  name: string;
  subtitle?: string | null;
  logoUrl?: string | null;
}

export interface ReportMetadata {
  reportId: string;
  title: string;
  category: ReportCategory;
  generatedAt: string;
  generatedBy?: string | null;
  organization: ReportOrganization;
  filters?: ReportFilters;
}

export interface ReportColumn<Row> {
  key: keyof Row | string;
  header: string;
  width?: number;
  align?: "left" | "center" | "right";
  format?: (
    value: unknown,
    row: Row,
  ) => string;
}

export interface ReportSummaryMetric {
  id: string;
  label: string;
  value: string | number;
  description?: string | null;
}

export interface ReportSection<Row = Record<string, unknown>> {
  id: string;
  title: string;
  description?: string | null;
  columns?: ReportColumn<Row>[];
  rows?: Row[];
  metrics?: ReportSummaryMetric[];
}

export interface ReportDocument<Row = Record<string, unknown>> {
  metadata: ReportMetadata;
  sections: ReportSection<Row>[];
}

export interface ReportGenerationOptions {
  format: ReportExportFormat;
  fileName?: string;
  includeGeneratedAt?: boolean;
  includeFilters?: boolean;
  includePageNumbers?: boolean;
}

export interface GeneratedReport {
  fileName: string;
  format: ReportExportFormat;
  generatedAt: string;
  blob: Blob;
}

export interface ReportGenerationError {
  code:
    | "invalid-filters"
    | "no-data"
    | "generation-failed"
    | "unsupported-format";
  message: string;
  cause?: unknown;
}