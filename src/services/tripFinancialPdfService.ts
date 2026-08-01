import {
  jsPDF,
} from "jspdf";

import autoTable from "jspdf-autotable";

import type {
  TripFinancialReportData,
} from "@/types/tripFinancialReport";

const PAGE_MARGIN = 14;
const CONTENT_WIDTH = 182;

interface JsPdfWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

function getLastAutoTableFinalY(
  document: jsPDF,
): number {
  return (
    document as JsPdfWithAutoTable
  ).lastAutoTable.finalY;
}

function formatCurrency(
  value: number,
): string {
  return new Intl.NumberFormat(
    "es-MX",
    {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    },
  ).format(value);
}

function formatDateTime(
  value: string,
): string {
  return new Intl.DateTimeFormat(
    "es-MX",
    {
      dateStyle: "long",
      timeStyle: "short",
    },
  ).format(new Date(value));
}

function formatPercentage(
  value: number,
): string {
  return `${value.toFixed(1)}%`;
}

function getPaymentStatusLabel(
  status:
    | "paid"
    | "partial"
    | "pending",
): string {
  switch (status) {
    case "paid":
      return "Pagado";

    case "partial":
      return "Parcial";

    case "pending":
      return "Pendiente";
  }
}

function getHealthLevelLabel(
  level:
    | "excellent"
    | "good"
    | "attention"
    | "critical",
): string {
  switch (level) {
    case "excellent":
      return "Excelente";

    case "good":
      return "Buena";

    case "attention":
      return "Atención";

    case "critical":
      return "Crítica";
  }
}

function addDocumentHeader(
  document: jsPDF,
  report: TripFinancialReportData,
): number {
  document.setFillColor(
    15,
    23,
    42,
  );

  document.rect(
    0,
    0,
    210,
    42,
    "F",
  );

  document.setTextColor(
    255,
    255,
    255,
  );

  document.setFont(
    "helvetica",
    "bold",
  );

  document.setFontSize(18);

  document.text(
    "Vivace Suite",
    PAGE_MARGIN,
    16,
  );

  document.setFontSize(13);

  document.text(
    "Reporte financiero de viaje",
    PAGE_MARGIN,
    26,
  );

  document.setFont(
    "helvetica",
    "normal",
  );

  document.setFontSize(10);

  document.text(
    report.tripName,
    PAGE_MARGIN,
    34,
  );

  document.text(
    `Generado: ${formatDateTime(
      report.generatedAt,
    )}`,
    196,
    34,
    {
      align: "right",
    },
  );

  document.setTextColor(
    15,
    23,
    42,
  );

  return 51;
}

function addSectionTitle(
  document: jsPDF,
  title: string,
  y: number,
): number {
  document.setFont(
    "helvetica",
    "bold",
  );

  document.setFontSize(13);

  document.setTextColor(
    15,
    23,
    42,
  );

  document.text(
    title,
    PAGE_MARGIN,
    y,
  );

  document.setDrawColor(
    203,
    213,
    225,
  );

  document.line(
    PAGE_MARGIN,
    y + 2,
    PAGE_MARGIN + CONTENT_WIDTH,
    y + 2,
  );

  return y + 8;
}

function addSummaryCards(
  document: jsPDF,
  report: TripFinancialReportData,
  startY: number,
): number {
  const cards = [
    {
      label: "Presupuesto",
      value: formatCurrency(
        report.summary.estimatedBudget,
      ),
    },
    {
      label: "Cargos",
      value: formatCurrency(
        report.summary.totalCharges,
      ),
    },
    {
      label: "Pagos",
      value: formatCurrency(
        report.summary.totalPaid,
      ),
    },
    {
      label: "Pendiente",
      value: formatCurrency(
        report.summary.totalPending,
      ),
    },
    {
      label: "Gastos",
      value: formatCurrency(
        report.summary.totalExpenses,
      ),
    },
    {
      label: "Efectivo disponible",
      value: formatCurrency(
        report.summary.availableCash,
      ),
    },
    {
      label: "Presupuesto disponible",
      value: formatCurrency(
        report.summary.budgetRemaining,
      ),
    },
    {
      label: "Saldo proyectado",
      value: formatCurrency(
        report.summary.projectedBalance,
      ),
    },
  ];

  const cardWidth = 43;
  const cardHeight = 23;
  const horizontalGap = 3.3;
  const verticalGap = 4;

  cards.forEach(
    (card, index) => {
      const column = index % 4;
      const row = Math.floor(index / 4);

      const x =
        PAGE_MARGIN +
        column *
          (cardWidth + horizontalGap);

      const y =
        startY +
        row *
          (cardHeight + verticalGap);

      document.setFillColor(
        248,
        250,
        252,
      );

      document.setDrawColor(
        226,
        232,
        240,
      );

      document.roundedRect(
        x,
        y,
        cardWidth,
        cardHeight,
        2,
        2,
        "FD",
      );

      document.setFont(
        "helvetica",
        "normal",
      );

      document.setFontSize(8);

      document.setTextColor(
        71,
        85,
        105,
      );

      document.text(
        card.label,
        x + 3,
        y + 7,
        {
          maxWidth: cardWidth - 6,
        },
      );

      document.setFont(
        "helvetica",
        "bold",
      );

      document.setFontSize(10);

      document.setTextColor(
        15,
        23,
        42,
      );

      document.text(
        card.value,
        x + 3,
        y + 17,
        {
          maxWidth: cardWidth - 6,
        },
      );
    },
  );

  return (
    startY +
    cardHeight * 2 +
    verticalGap +
    6
  );
}

function addHealthSection(
  document: jsPDF,
  report: TripFinancialReportData,
  startY: number,
): number {
  const y = addSectionTitle(
    document,
    "Salud financiera",
    startY,
  );

  document.setFillColor(
    248,
    250,
    252,
  );

  document.setDrawColor(
    226,
    232,
    240,
  );

  document.roundedRect(
    PAGE_MARGIN,
    y,
    CONTENT_WIDTH,
    31,
    2,
    2,
    "FD",
  );

  document.setFont(
    "helvetica",
    "bold",
  );

  document.setFontSize(18);

  document.setTextColor(
    15,
    23,
    42,
  );

  document.text(
    `${report.health.score}/100`,
    PAGE_MARGIN + 5,
    y + 11,
  );

  document.setFontSize(11);

  document.text(
    getHealthLevelLabel(
      report.health.level,
    ),
    PAGE_MARGIN + 5,
    y + 20,
  );

  document.setFont(
    "helvetica",
    "normal",
  );

  document.setFontSize(9);

  const diagnosisLines =
    document.splitTextToSize(
      report.health.diagnosis,
      125,
    );

  document.text(
    diagnosisLines,
    PAGE_MARGIN + 48,
    y + 10,
  );

  return y + 38;
}

function addBulletList(
  document: jsPDF,
  title: string,
  items: string[],
  startY: number,
): number {
  let y = addSectionTitle(
    document,
    title,
    startY,
  );

  document.setFont(
    "helvetica",
    "normal",
  );

  document.setFontSize(9);

  document.setTextColor(
    51,
    65,
    85,
  );

  items.forEach(
    (item) => {
      const lines =
        document.splitTextToSize(
          item,
          CONTENT_WIDTH - 8,
        );

      document.text(
        "•",
        PAGE_MARGIN + 1,
        y,
      );

      document.text(
        lines,
        PAGE_MARGIN + 6,
        y,
      );

      y +=
        lines.length * 4.5 +
        2;
    },
  );

  return y + 2;
}

function addPageNumbers(
  document: jsPDF,
): void {
  const pageCount =
    document.getNumberOfPages();

  for (
    let page = 1;
    page <= pageCount;
    page += 1
  ) {
    document.setPage(page);

    document.setFont(
      "helvetica",
      "normal",
    );

    document.setFontSize(8);

    document.setTextColor(
      100,
      116,
      139,
    );

    document.text(
      `Vivace Suite · Página ${page} de ${pageCount}`,
      105,
      290,
      {
        align: "center",
      },
    );
  }
}

function sanitizeFileName(
  value: string,
): string {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .replace(
      /[^a-zA-Z0-9]+/g,
      "-",
    )
    .replace(
      /^-+|-+$/g,
      "",
    )
    .toLowerCase();
}

export function generateTripFinancialReportPdf(
  report: TripFinancialReportData,
): void {
  const document = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  let y = addDocumentHeader(
    document,
    report,
  );

  y = addSectionTitle(
    document,
    "Resumen ejecutivo",
    y,
  );

  y = addSummaryCards(
    document,
    report,
    y,
  );

  y = addHealthSection(
    document,
    report,
    y,
  );

  autoTable(
    document,
    {
      startY: y,
      head: [[
        "Indicador",
        "Resultado",
      ]],
      body: [
        [
          "Cobranza realizada",
          formatPercentage(
            report.summary
              .paymentPercentage,
          ),
        ],
        [
          "Presupuesto consumido",
          formatPercentage(
            report.summary
              .expenseBudgetPercentage,
          ),
        ],
      ],
      theme: "grid",
      margin: {
        left: PAGE_MARGIN,
        right: PAGE_MARGIN,
      },
      styles: {
        font: "helvetica",
        fontSize: 9,
        cellPadding: 3,
        textColor: [
          51,
          65,
          85,
        ],
      },
      headStyles: {
        fillColor: [
          30,
          41,
          59,
        ],
        textColor: [
          255,
          255,
          255,
        ],
      },
    },
  );

  const indicatorsFinalY =
    getLastAutoTableFinalY(document) + 8;

  const factorsFinalY =
    addBulletList(
      document,
      "Factores relevantes",
      report.health.factors,
      indicatorsFinalY,
    );

  addBulletList(
    document,
    "Recomendaciones",
    report.health.recommendations,
    factorsFinalY,
  );

  document.addPage();

  const participantStartY =
    addSectionTitle(
      document,
      "Estado financiero por participante",
      18,
    );

  autoTable(
    document,
    {
      startY: participantStartY,
      head: [[
        "Participante",
        "Cargo",
        "Pagado",
        "Saldo",
        "Estado",
      ]],
      body:
        report.participants.map(
          (participant) => [
            participant.memberName,
            formatCurrency(
              participant.totalCharged,
            ),
            formatCurrency(
              participant.totalPaid,
            ),
            formatCurrency(
              participant.balance,
            ),
            getPaymentStatusLabel(
              participant.paymentStatus,
            ),
          ],
        ),
      theme: "striped",
      margin: {
        left: PAGE_MARGIN,
        right: PAGE_MARGIN,
      },
      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: 2.5,
        textColor: [
          51,
          65,
          85,
        ],
      },
      headStyles: {
        fillColor: [
          30,
          41,
          59,
        ],
        textColor: [
          255,
          255,
          255,
        ],
      },
      columnStyles: {
        0: {
          cellWidth: 62,
        },
        1: {
          halign: "right",
        },
        2: {
          halign: "right",
        },
        3: {
          halign: "right",
        },
        4: {
          halign: "center",
        },
      },
      didDrawPage: () => {
        document.setFontSize(8);
        document.setTextColor(
          100,
          116,
          139,
        );
      },
    },
  );

  const participantFinalY =
    getLastAutoTableFinalY(document) + 10;

  const needsNewPage =
    participantFinalY > 245;

  if (needsNewPage) {
    document.addPage();
  }

  const categoriesStartY =
    addSectionTitle(
      document,
      "Gastos por categoría",
      needsNewPage
        ? 18
        : participantFinalY,
    );

  autoTable(
    document,
    {
      startY: categoriesStartY,
      head: [[
        "Categoría",
        "Movimientos",
        "Total",
        "% gastos",
        "% presupuesto",
      ]],
      body:
        report.expenseCategories.map(
          (category) => [
            category.category,
            String(
              category.expenseCount,
            ),
            formatCurrency(
              category.totalAmount,
            ),
            formatPercentage(
              category
                .expensePercentage,
            ),
            formatPercentage(
              category
                .budgetPercentage,
            ),
          ],
        ),
      theme: "grid",
      margin: {
        left: PAGE_MARGIN,
        right: PAGE_MARGIN,
      },
      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: 2.5,
        textColor: [
          51,
          65,
          85,
        ],
      },
      headStyles: {
        fillColor: [
          30,
          41,
          59,
        ],
        textColor: [
          255,
          255,
          255,
        ],
      },
      columnStyles: {
        0: {
          cellWidth: 57,
        },
        1: {
          halign: "center",
        },
        2: {
          halign: "right",
        },
        3: {
          halign: "right",
        },
        4: {
          halign: "right",
        },
      },
    },
  );

  addPageNumbers(document);

  const fileName = [
    "reporte-financiero",
    sanitizeFileName(
      report.tripName,
    ),
    new Date(
      report.generatedAt,
    )
      .toISOString()
      .slice(
        0,
        10,
      ),
  ].join("-");

  document.save(
    `${fileName}.pdf`,
  );
}