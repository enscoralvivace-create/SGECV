import { exportReportElementToPdf } from "@/services/reports/common/reportPdfService";

interface ExportFinancialReportPdfOptions {
  element: HTMLElement;
  fileName?: string;
}

export async function exportFinancialReportToPdf({
  element,
  fileName,
}: ExportFinancialReportPdfOptions): Promise<void> {
  await exportReportElementToPdf({
    element,
    reportTitle:
      "Reporte financiero general",
    fileName,
    metadata: {
      title:
        "Reporte financiero general",
      subject:
        "Reporte administrativo de cargos, pagos, saldos y recuperación generado desde Vivace Suite",
      keywords: [
        "Finanzas",
        "Cargos",
        "Pagos",
        "Saldos",
        "Recuperación",
        "Cuotas",
        "Reporte",
      ],
    },
  });
}