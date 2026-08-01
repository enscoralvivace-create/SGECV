import { exportReportElementToPdf } from "@/services/reports/common/reportPdfService";

interface ExportTripReportPdfOptions {
  element: HTMLElement;
  fileName?: string;
}

export async function exportTripReportToPdf({
  element,
  fileName,
}: ExportTripReportPdfOptions): Promise<void> {
  await exportReportElementToPdf({
    element,
    reportTitle:
      "Reporte general de viajes",
    fileName,
    metadata: {
      title:
        "Reporte general de viajes",
      subject:
        "Reporte administrativo de viajes, participación, recuperación financiera y presupuesto generado desde Vivace Suite",
      keywords: [
        "Viajes",
        "Participantes",
        "Presupuesto",
        "Recuperación financiera",
        "Gastos",
        "Proyectos",
        "Reporte",
      ],
    },
  });
}