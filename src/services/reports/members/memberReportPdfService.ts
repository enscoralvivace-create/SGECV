import { downloadElementAsPdf } from "@/services/pdfService";
import { buildExportFileName } from "@/services/reportService";

interface ExportMemberReportPdfOptions {
  element: HTMLElement;
  fileName?: string;
}

export async function exportMemberReportToPdf({
  element,
  fileName,
}: ExportMemberReportPdfOptions): Promise<void> {
  const resolvedFileName = buildExportFileName(
    "Reporte general de integrantes",
    {
      format: "pdf",
      fileName,
      includeGeneratedAt: true,
      includeFilters: false,
      includePageNumbers: true,
    },
  );

  await downloadElementAsPdf({
    element,
    fileName: resolvedFileName,
    backgroundColor: "#ffffff",
    marginMm: 8,
    scale: 2,
    imageQuality: 0.95,
    title: "Reporte general de integrantes",
    author: "Ensamble Coral Vivace",
    subject:
      "Reporte administrativo de integrantes generado desde Vivace Suite",
    keywords: [
      "Vivace Suite",
      "Ensamble Coral Vivace",
      "Integrantes",
      "Reporte",
    ],
    creator: "Vivace Suite",
  });
}