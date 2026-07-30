"use client";

import {
  FileDown,
  LoaderCircle,
} from "lucide-react";

import {
  useState,
} from "react";

import type {
  TripExpenseCategorySummary,
  TripFinancialReconciliation,
} from "@/hooks/useTripFinancialDashboard";

import {
  buildTripFinancialReportData,
} from "@/services/tripFinancialReportService";

import {
  generateTripFinancialReportPdf,
} from "@/services/tripFinancialPdfService";

import type {
  TripParticipantFinancialSummary,
} from "@/types/tripFinancial";

interface TripFinancialExportButtonProps {
  tripId: string;

  tripName: string;

  reconciliation:
    TripFinancialReconciliation;

  participants:
    TripParticipantFinancialSummary[];

  expenseCategories:
    TripExpenseCategorySummary[];
}

function getErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof Error &&
    error.message.trim()
  ) {
    return error.message;
  }

  return (
    "No fue posible generar el reporte " +
    "financiero en PDF."
  );
}

export default function TripFinancialExportButton({
  tripId,
  tripName,
  reconciliation,
  participants,
  expenseCategories,
}: TripFinancialExportButtonProps) {
  const [
    isExporting,
    setIsExporting,
  ] = useState(false);

  const [
    exportError,
    setExportError,
  ] = useState<string | null>(
    null,
  );

  function handleExport(): void {
    if (isExporting) {
      return;
    }

    setIsExporting(true);
    setExportError(null);

    try {
      const report =
        buildTripFinancialReportData({
          tripId,
          tripName,
          reconciliation,
          participants,
          expenseCategories,
        });

      generateTripFinancialReportPdf(
        report,
      );
    } catch (error) {
      setExportError(
        getErrorMessage(error),
      );
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div
      className="
        flex
        flex-col
        items-stretch
        gap-2
        sm:items-end
      "
    >
      <button
        className="
          inline-flex
          items-center
          justify-center
          gap-2
          rounded-lg
          bg-slate-900
          px-4
          py-2
          text-sm
          font-semibold
          text-white
          shadow-sm
          transition-colors
          hover:bg-slate-700
          disabled:cursor-not-allowed
          disabled:opacity-60
          focus:outline-none
          focus:ring-2
          focus:ring-slate-500
          focus:ring-offset-2
        "
        disabled={isExporting}
        onClick={handleExport}
        type="button"
      >
        {isExporting ? (
          <LoaderCircle
            aria-hidden="true"
            className="
              h-4
              w-4
              animate-spin
            "
          />
        ) : (
          <FileDown
            aria-hidden="true"
            className="h-4 w-4"
          />
        )}

        {isExporting
          ? "Generando PDF..."
          : "Exportar PDF"}
      </button>

      {exportError ? (
        <p
          className="
            max-w-sm
            text-right
            text-xs
            leading-5
            text-rose-600
          "
          role="alert"
        >
          {exportError}
        </p>
      ) : null}
    </div>
  );
}