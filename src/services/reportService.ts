import type {
  ReportDateRange,
  ReportDatePreset,
  ReportGenerationOptions,
  ReportMetadata,
  ReportOrganization,
} from "@/types/report";

const DEFAULT_ORGANIZATION: ReportOrganization = {
  name: "Ensamble Coral Vivace",
  subtitle: "Vivace Suite",
  logoUrl: "/images/logo.png",
};

function formatDate(
  value: Date,
): string {
  return value.toISOString();
}

export function getCurrentDateRange(): ReportDateRange {
  const now = new Date();

  return {
    startDate: new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    ).toISOString(),
    endDate: new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    ).toISOString(),
  };
}

export function resolveDatePreset(
  preset: ReportDatePreset,
): ReportDateRange {
  const now = new Date();

  switch (preset) {
    case "current-month":
      return getCurrentDateRange();

    case "previous-month":
      return {
        startDate: new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          1,
        ).toISOString(),
        endDate: new Date(
          now.getFullYear(),
          now.getMonth(),
          0,
          23,
          59,
          59,
          999,
        ).toISOString(),
      };

    case "current-year":
      return {
        startDate: new Date(
          now.getFullYear(),
          0,
          1,
        ).toISOString(),
        endDate: new Date(
          now.getFullYear(),
          11,
          31,
          23,
          59,
          59,
          999,
        ).toISOString(),
      };

    case "previous-year":
      return {
        startDate: new Date(
          now.getFullYear() - 1,
          0,
          1,
        ).toISOString(),
        endDate: new Date(
          now.getFullYear() - 1,
          11,
          31,
          23,
          59,
          59,
          999,
        ).toISOString(),
      };

    case "custom":
    default:
      return {
        startDate: null,
        endDate: null,
      };
  }
}

export function buildReportMetadata(
  metadata: Omit<
    ReportMetadata,
    "generatedAt" | "organization"
  >,
): ReportMetadata {
  return {
    ...metadata,
    generatedAt: formatDate(new Date()),
    organization: DEFAULT_ORGANIZATION,
  };
}

export function buildReportFileName(
  title: string,
  extension: string,
): string {
  const normalizedTitle = title
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-");

  return `${normalizedTitle}-${timestamp}.${extension}`;
}

export function resolveExportExtension(
  options: ReportGenerationOptions,
): string {
  switch (options.format) {
    case "pdf":
      return "pdf";

    case "xlsx":
      return "xlsx";

    case "csv":
      return "csv";
  }
}

export function buildExportFileName(
  reportTitle: string,
  options: ReportGenerationOptions,
): string {
  if (options.fileName?.trim()) {
    return options.fileName.trim();
  }

  return buildReportFileName(
    reportTitle,
    resolveExportExtension(options),
  );
}