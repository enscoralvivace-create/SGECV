import { exportReportElementToPdf } from "@/services/reports/common/reportPdfService";

interface ExportRepertoireReportPdfOptions {
  element: HTMLElement;
  fileName?: string;
}

export async function exportRepertoireReportToPdf({
  element,
  fileName,
}: ExportRepertoireReportPdfOptions): Promise<void> {
  await exportReportElementToPdf({
    element,
    reportTitle:
      "Reporte general de repertorio",
    fileName,
    metadata: {
      title:
        "Reporte general de repertorio",
      subject:
        "Reporte administrativo de repertorio generado desde Vivace Suite",
      keywords: [
        "Repertorio",
        "Obras",
        "Compositores",
        "Música coral",
        "Reporte",
      ],
    },
  });
}