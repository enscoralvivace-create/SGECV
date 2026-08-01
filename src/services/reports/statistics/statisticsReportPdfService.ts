import { exportReportElementToPdf } from "@/services/reports/common/reportPdfService";

interface ExportStatisticsReportPdfOptions {
  element: HTMLElement;
  fileName?: string;
}

export async function exportStatisticsReportToPdf({
  element,
  fileName,
}: ExportStatisticsReportPdfOptions): Promise<void> {
  await exportReportElementToPdf({
    element,
    reportTitle:
      "Reporte estadístico general",
    fileName,
    metadata: {
      title:
        "Reporte estadístico general",
      subject:
        "Resumen ejecutivo de Vivace Suite generado para el Ensamble Coral Vivace",
      keywords: [
        "Estadísticas",
        "Indicadores",
        "Integrantes",
        "Asistencias",
        "Repertorio",
        "Finanzas",
        "Viajes",
        "Reporte ejecutivo",
      ],
    },
  });
}