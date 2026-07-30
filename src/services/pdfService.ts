import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

interface DownloadElementAsPdfOptions {
  element: HTMLElement;
  fileName: string;
  backgroundColor?: string;
  marginMm?: number;
  scale?: number;
  imageQuality?: number;
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  creator?: string;
}

function normalizePdfFileName(
  fileName: string,
): string {
  const trimmedFileName = fileName.trim();

  if (!trimmedFileName) {
    return "documento.pdf";
  }

  return trimmedFileName
    .toLowerCase()
    .endsWith(".pdf")
    ? trimmedFileName
    : `${trimmedFileName}.pdf`;
}

function normalizeImageQuality(
  quality: number,
): number {
  return Math.min(
    Math.max(quality, 0.1),
    1,
  );
}

function waitForLayout(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  });
}

function createCanvasSlice(
  sourceCanvas: HTMLCanvasElement,
  startY: number,
  sliceHeight: number,
  backgroundColor: string,
): HTMLCanvasElement {
  const sliceCanvas =
    document.createElement("canvas");

  sliceCanvas.width =
    sourceCanvas.width;

  sliceCanvas.height =
    sliceHeight;

  const context =
    sliceCanvas.getContext("2d");

  if (!context) {
    throw new Error(
      "No fue posible preparar una página del PDF.",
    );
  }

  context.fillStyle =
    backgroundColor;

  context.fillRect(
    0,
    0,
    sliceCanvas.width,
    sliceCanvas.height,
  );

  context.drawImage(
    sourceCanvas,
    0,
    startY,
    sourceCanvas.width,
    sliceHeight,
    0,
    0,
    sourceCanvas.width,
    sliceHeight,
  );

  return sliceCanvas;
}

function drawFooter(
  pdf: jsPDF,
  pageNumber: number,
  totalPages: number,
  generatedAt: string,
): void {
  const pageWidth =
    pdf.internal.pageSize.getWidth();

  const pageHeight =
    pdf.internal.pageSize.getHeight();

  pdf.setFont(
    "helvetica",
    "normal",
  );

  pdf.setFontSize(8);
  pdf.setTextColor(120);

  pdf.text(
    `Generado por Vivace Suite · ${generatedAt}`,
    8,
    pageHeight - 4,
  );

  pdf.text(
    `Página ${pageNumber} de ${totalPages}`,
    pageWidth - 8,
    pageHeight - 4,
    {
      align: "right",
    },
  );
}

export async function downloadElementAsPdf({
  element,
  fileName,
  backgroundColor = "#ffffff",
  marginMm = 8,
  scale = 2,
  imageQuality = 1,
  title = "Documento de Vivace Suite",
  author = "Ensamble Coral Vivace",
  subject = "Documento administrativo",
  keywords = [
    "Vivace Suite",
    "Ensamble Coral Vivace",
  ],
  creator = "Vivace Suite",
}: DownloadElementAsPdfOptions): Promise<void> {
  element.classList.add(
    "pdf-export-mode",
  );

  try {
    await waitForLayout();

    const canvas =
      await html2canvas(
        element,
        {
          scale,
          useCORS: true,
          backgroundColor,
          logging: false,
          windowWidth:
            element.scrollWidth,
          windowHeight:
            element.scrollHeight,
        },
      );

    const normalizedQuality =
      normalizeImageQuality(
        imageQuality,
      );

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "letter",
      compress: true,
    });

    pdf.setProperties({
      title,
      author,
      subject,
      keywords:
        keywords.join(", "),
      creator,
    });

    const creationDate =
      new Date();

    pdf.setCreationDate(
      creationDate,
    );

    const generatedAt =
      new Intl.DateTimeFormat(
        "es-MX",
        {
          dateStyle: "short",
          timeStyle: "short",
        },
      ).format(
        creationDate,
      );

    const pageWidth =
      pdf.internal.pageSize.getWidth();

    const pageHeight =
      pdf.internal.pageSize.getHeight();

    const footerSpaceMm = 7;

   const availableWidth =
  pageWidth - marginMm * 2;

const availableHeight =
  pageHeight - marginMm * 2;

const pixelsPerPage =
  Math.max(
    1,
    Math.floor(
      canvas.width *
        (
          availableHeight /
          availableWidth
        ),
    ),
  );

    const totalPages =
      Math.ceil(
        canvas.height /
          pixelsPerPage,
      );

    for (
      let pageIndex = 0;
      pageIndex < totalPages;
      pageIndex += 1
    ) {
      const startY =
        pageIndex *
        pixelsPerPage;

      const remainingHeight =
        canvas.height -
        startY;

      const sliceHeight =
        Math.min(
          pixelsPerPage,
          remainingHeight,
        );

      const pageCanvas =
        createCanvasSlice(
          canvas,
          startY,
          sliceHeight,
          backgroundColor,
        );

      const imageData =
        pageCanvas.toDataURL(
          "image/jpeg",
          normalizedQuality,
        );

      const imageHeight =
        (
          sliceHeight /
          canvas.width
        ) * availableWidth;

      if (pageIndex > 0) {
        pdf.addPage(
          "letter",
          "portrait",
        );
      }

      pdf.addImage(
        imageData,
        "JPEG",
        marginMm,
        marginMm,
        availableWidth,
        imageHeight,
        undefined,
        "FAST",
      );

      drawFooter(
        pdf,
        pageIndex + 1,
        totalPages,
        generatedAt,
      );
    }

    pdf.save(
      normalizePdfFileName(
        fileName,
      ),
    );
  } finally {
    element.classList.remove(
      "pdf-export-mode",
    );
  }
}