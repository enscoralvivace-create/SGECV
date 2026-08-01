import { downloadElementAsPdf } from "@/services/pdfService";
import { buildExportFileName } from "@/services/reportService";

interface ReportPdfMetadata {
  title: string;
  subject: string;
  keywords: string[];
}

interface ExportReportElementToPdfOptions {
  element: HTMLElement;
  reportTitle: string;
  fileName?: string;
  metadata: ReportPdfMetadata;
  includeFilters?: boolean;
  marginMm?: number;
  scale?: number;
  imageQuality?: number;
  backgroundColor?: string;
}

const DEFAULT_AUTHOR =
  "Ensamble Coral Vivace";

const DEFAULT_CREATOR =
  "Vivace Suite";

export async function exportReportElementToPdf({
  element,
  reportTitle,
  fileName,
  metadata,
  includeFilters = false,
  marginMm = 8,
  scale = 2,
  imageQuality = 0.95,
  backgroundColor = "#ffffff",
}: ExportReportElementToPdfOptions): Promise<void> {
  const resolvedFileName =
    buildExportFileName(
      reportTitle,
      {
        format: "pdf",
        fileName,
        includeGeneratedAt: true,
        includeFilters,
        includePageNumbers: true,
      },
    );

  await downloadElementAsPdf({
    element,
    fileName: resolvedFileName,
    backgroundColor,
    marginMm,
    scale,
    imageQuality,
    title: metadata.title,
    author: DEFAULT_AUTHOR,
    subject: metadata.subject,
    keywords: [
      DEFAULT_CREATOR,
      DEFAULT_AUTHOR,
      ...metadata.keywords,
    ],
    creator: DEFAULT_CREATOR,
  });
}