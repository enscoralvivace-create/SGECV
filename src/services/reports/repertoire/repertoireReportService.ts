import { getRepertoire } from "@/services/repertoireService";
import { buildReportMetadata } from "@/services/reportService";

import type {
  RepertoireItem,
  RepertoireStatus,
} from "@/types/repertoire";

import type {
  RepertoireComposerSummary,
  RepertoireReportData,
  RepertoireReportRow,
  RepertoireReportSummary,
  RepertoireStatusSummary,
} from "@/types/repertoireReport";

import type {
  ReportColumn,
  ReportDocument,
  ReportSection,
  ReportSummaryMetric,
} from "@/types/report";

const STATUS_ORDER: RepertoireStatus[] = [
  "Activo",
  "En estudio",
  "Archivado",
];

const repertoireColumns:
ReportColumn<RepertoireReportRow>[] = [
  {
    key: "title",
    header: "Obra",
    align: "left",
  },
  {
    key: "composer",
    header: "Compositor",
    align: "left",
  },
  {
    key: "arranger",
    header: "Arreglista",
    align: "left",
  },
  {
    key: "key",
    header: "Tonalidad",
    align: "center",
  },
  {
    key: "formattedDuration",
    header: "Duración",
    align: "center",
  },
  {
    key: "status",
    header: "Estado",
    align: "center",
  },
];

function calculatePercentage(
  value: number,
  total: number,
): number {
  if (total <= 0) {
    return 0;
  }

  return Number(
    ((value / total) * 100).toFixed(2),
  );
}

function formatOptionalValue(
  value: string | null | undefined,
  fallback: string,
): string {
  const normalizedValue = value?.trim();

  return normalizedValue || fallback;
}

function formatDuration(
  minutes: number | null,
): string {
  if (
    minutes === null ||
    !Number.isFinite(minutes) ||
    minutes <= 0
  ) {
    return "No registrada";
  }

  const totalSeconds = Math.round(
    minutes * 60,
  );

  const hours = Math.floor(
    totalSeconds / 3600,
  );

  const remainingSeconds =
    totalSeconds % 3600;

  const wholeMinutes = Math.floor(
    remainingSeconds / 60,
  );

  const seconds =
    remainingSeconds % 60;

  if (hours > 0) {
    return `${hours} h ${wholeMinutes} min`;
  }

  if (seconds > 0) {
    return `${wholeMinutes} min ${seconds} s`;
  }

  return `${wholeMinutes} min`;
}

function mapRepertoireItemToRow(
  item: RepertoireItem,
): RepertoireReportRow {
  return {
    id: item.id,
    title: item.title.trim(),
    composer: formatOptionalValue(
      item.composer,
      "No registrado",
    ),
    arranger: formatOptionalValue(
      item.arranger,
      "No registrado",
    ),
    key: formatOptionalValue(
      item.key,
      "No registrada",
    ),
    durationMinutes:
      item.duration_minutes,
    formattedDuration: formatDuration(
      item.duration_minutes,
    ),
    status: item.status,
    notes: formatOptionalValue(
      item.notes,
      "Sin notas",
    ),
  };
}

function countByStatus(
  items: RepertoireItem[],
  status: RepertoireStatus,
): number {
  return items.filter(
    (item) => item.status === status,
  ).length;
}

function buildStatusSummary(
  items: RepertoireItem[],
): RepertoireStatusSummary[] {
  return STATUS_ORDER.map(
    (status) => {
      const total = countByStatus(
        items,
        status,
      );

      return {
        status,
        total,
        percentage:
          calculatePercentage(
            total,
            items.length,
          ),
      };
    },
  );
}

function buildComposerSummary(
  items: RepertoireItem[],
): RepertoireComposerSummary[] {
  const counts = new Map<
    string,
    number
  >();

  items.forEach((item) => {
    const composer =
      formatOptionalValue(
        item.composer,
        "No registrado",
      );

    counts.set(
      composer,
      (counts.get(composer) ?? 0) + 1,
    );
  });

  return Array.from(
    counts.entries(),
  )
    .map(
      ([composer, totalWorks]) => ({
        composer,
        totalWorks,
        percentage:
          calculatePercentage(
            totalWorks,
            items.length,
          ),
      }),
    )
    .sort((a, b) => {
      if (
        b.totalWorks !==
        a.totalWorks
      ) {
        return (
          b.totalWorks -
          a.totalWorks
        );
      }

      return a.composer.localeCompare(
        b.composer,
        "es",
      );
    });
}

function buildSummary(
  items: RepertoireItem[],
): RepertoireReportSummary {
  const durationValues = items
    .map(
      (item) =>
        item.duration_minutes,
    )
    .filter(
      (
        value,
      ): value is number =>
        typeof value === "number" &&
        Number.isFinite(value) &&
        value > 0,
    );

  const totalDurationMinutes =
    durationValues.reduce(
      (total, value) =>
        total + value,
      0,
    );

  const worksWithDuration =
    durationValues.length;

  return {
    totalWorks: items.length,
    activeWorks: countByStatus(
      items,
      "Activo",
    ),
    studyWorks: countByStatus(
      items,
      "En estudio",
    ),
    archivedWorks: countByStatus(
      items,
      "Archivado",
    ),
    totalDurationMinutes,
    formattedTotalDuration:
      formatDuration(
        totalDurationMinutes,
      ),
    worksWithDuration,
    worksWithoutDuration:
      items.length -
      worksWithDuration,
    statuses:
      buildStatusSummary(items),
    composers:
      buildComposerSummary(items),
  };
}

function buildSummaryMetrics(
  summary: RepertoireReportSummary,
): ReportSummaryMetric[] {
  return [
    {
      id: "total-works",
      label: "Obras registradas",
      value: summary.totalWorks,
      description:
        "Total de obras incluidas en el reporte.",
    },
    {
      id: "active-works",
      label: "Obras activas",
      value: summary.activeWorks,
      description:
        "Obras disponibles para programación.",
    },
    {
      id: "study-works",
      label: "En estudio",
      value: summary.studyWorks,
      description:
        "Obras actualmente en preparación.",
    },
    {
      id: "total-duration",
      label: "Duración acumulada",
      value:
        summary.formattedTotalDuration,
      description:
        "Suma de las duraciones registradas.",
    },
  ];
}

function buildSections(
  works: RepertoireReportRow[],
  summary: RepertoireReportSummary,
): ReportSection<RepertoireReportRow>[] {
  return [
    {
      id: "repertoire-summary",
      title: "Resumen general",
      description:
        "Indicadores principales del repertorio registrado.",
      metrics:
        buildSummaryMetrics(summary),
    },
    {
      id: "repertoire-list",
      title: "Listado de obras",
      description:
        "Relación general del repertorio registrado en Vivace Suite.",
      columns:
        repertoireColumns,
      rows: works,
    },
  ];
}

export async function getRepertoireReportData(): Promise<RepertoireReportData> {
  const sourceItems =
    await getRepertoire();

  const works = sourceItems.map(
    mapRepertoireItemToRow,
  );

  const summary =
    buildSummary(sourceItems);

  const document:
  ReportDocument<RepertoireReportRow> = {
    metadata:
      buildReportMetadata({
        reportId:
          "repertoire-general-report",
        title:
          "Reporte general de repertorio",
        category: "repertoire",
      }),
    sections: buildSections(
      works,
      summary,
    ),
  };

  return {
    document,
    summary,
    works,
  };
}