import { downloadElementAsPdf } from "@/services/pdfService";
import { buildExportFileName } from "@/services/reportService";

interface ExportAttendanceReportPdfOptions {
  element: HTMLElement;
  fileName?: string;
}

export async function exportAttendanceReportToPdf({
  element,
  fileName,
}: ExportAttendanceReportPdfOptions): Promise<void> {
  const resolvedFileName = buildExportFileName(
    "Reporte general de asistencias",
    {
      format: "pdf",
      fileName,
      includeGeneratedAt: true,
      includeFilters: true,
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
    title: "Reporte general de asistencias",
    author: "Ensamble Coral Vivace",
    subject:
      "Reporte administrativo de asistencias generado desde Vivace Suite",
    keywords: [
      "Vivace Suite",
      "Ensamble Coral Vivace",
      "Asistencias",
      "Ensayos",
      "Reporte",
    ],
    creator: "Vivace Suite",
  });
}