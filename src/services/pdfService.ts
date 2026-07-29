import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

interface DownloadElementAsPdfOptions {
  element: HTMLElement;
  fileName: string;
  backgroundColor?: string;
  marginMm?: number;
}

export async function downloadElementAsPdf({
  element,
  fileName,
  backgroundColor = "#ffffff",
  marginMm = 8,
}: DownloadElementAsPdfOptions): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor,
    logging: false,
  });

  const imageData = canvas.toDataURL(
    "image/png",
    1,
  );

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "letter",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const availableWidth =
    pageWidth - marginMm * 2;

  const availableHeight =
    pageHeight - marginMm * 2;

  const imageRatio =
    canvas.width / canvas.height;

  let imageWidth = availableWidth;
  let imageHeight =
    imageWidth / imageRatio;

  if (imageHeight > availableHeight) {
    imageHeight = availableHeight;
    imageWidth =
      imageHeight * imageRatio;
  }

  const positionX =
    (pageWidth - imageWidth) / 2;

  const positionY =
    (pageHeight - imageHeight) / 2;

  pdf.addImage(
    imageData,
    "PNG",
    positionX,
    positionY,
    imageWidth,
    imageHeight,
  );

  pdf.save(
    fileName.toLowerCase().endsWith(".pdf")
      ? fileName
      : `${fileName}.pdf`,
  );
}