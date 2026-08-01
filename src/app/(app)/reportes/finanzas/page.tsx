"use client";

import {
  useRef,
  useState,
} from "react";

import EmptyReportState from "@/components/reports/common/EmptyReportState";
import ReportErrorState from "@/components/reports/common/ReportErrorState";
import ReportExportButton from "@/components/reports/common/ReportExportButton";
import ReportLoadingState from "@/components/reports/common/ReportLoadingState";
import ReportPageHeader from "@/components/reports/common/ReportPageHeader";
import ReportPrintHeader from "@/components/reports/common/ReportPrintHeader";
import ReportSummaryCards, {
  type ReportMetric,
} from "@/components/reports/common/ReportSummaryCards";
import ReportTableCard from "@/components/reports/common/ReportTableCard";

import useReportLoader from "@/hooks/useReportLoader";

import { exportFinancialReportToPdf } from "@/services/reports/finances/financialReportPdfService";
import { getFinancialReportData } from "@/services/reports/finances/financialReportService";

import type {
  FinancialReportData,
  FinancialReportFeeTypeRow,
  FinancialReportMemberRow,
  FinancialReportPaymentMethodRow,
} from "@/types/financialReport";

import {
  formatReportCurrency,
} from "@/utils/reportFormatters";

export default function FinancialReportPage() {
  const {
    data: reportData,
    isLoading,
    error,
  } = useReportLoader(
    getFinancialReportData,
  );

  const [isExporting, setIsExporting] =
    useState(false);

  const [exportError, setExportError] =
    useState("");

  const reportRef =
    useRef<HTMLDivElement | null>(null);

  async function handleExportPdf(): Promise<void> {
    if (
      !reportRef.current ||
      !reportData
    ) {
      return;
    }

    try {
      setIsExporting(true);
      setExportError("");

      await exportFinancialReportToPdf({
        element: reportRef.current,
      });
    } catch (
      exportPdfError: unknown
    ) {
      console.error(exportPdfError);

      setExportError(
        exportPdfError instanceof Error
          ? exportPdfError.message
          : "No fue posible generar el archivo PDF.",
      );
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <main className="space-y-8">
      <ReportPageHeader
        eyebrow="Reporte administrativo"
        title="Reporte financiero general"
        description="Consulta cargos, pagos, saldos pendientes y recuperación financiera del Ensamble Coral Vivace."
        actions={
          <ReportExportButton
            isLoading={isLoading}
            isExporting={isExporting}
            isDisabled={!reportData}
            onExport={() => {
              void handleExportPdf();
            }}
          />
        }
      />

      {exportError ? (
        <ReportErrorState
          title="No fue posible exportar el reporte"
          message={exportError}
        />
      ) : null}

      {isLoading ? (
        <ReportLoadingState message="Cargando reporte financiero..." />
      ) : null}

      {!isLoading && error ? (
        <ReportErrorState message={error} />
      ) : null}

      {!isLoading &&
      !error &&
      reportData ? (
        <FinancialReportContent
          reportData={reportData}
          reportRef={reportRef}
        />
      ) : null}
    </main>
  );
}

interface FinancialReportContentProps {
  reportData: FinancialReportData;
  reportRef:
    React.RefObject<HTMLDivElement | null>;
}

function FinancialReportContent({
  reportData,
  reportRef,
}: FinancialReportContentProps) {
  const {
    document,
    summary,
    members,
    feeTypes,
    paymentMethods,
  } = reportData;

  const metrics: ReportMetric[] = [
    {
      label: "Total cargado",
      value:
        formatReportCurrency(
          summary.totalCharged,
        ),
      description:
        `${summary.totalChargesCount} cargos incluidos`,
    },
    {
      label: "Total pagado",
      value:
        formatReportCurrency(
          summary.totalPaid,
        ),
      description:
        `${summary.totalPaymentsCount} pagos registrados`,
    },
    {
      label: "Saldo pendiente",
      value:
        formatReportCurrency(
          summary.totalPending,
        ),
      description:
        `${summary.membersWithPendingBalance} integrantes con saldo`,
    },
    {
      label: "Recuperación",
      value:
        `${summary.recoveryPercentage.toFixed(
          2,
        )}%`,
      description:
        "Pagos recibidos respecto de cargos",
    },
  ];

  return (
    <div
      ref={reportRef}
      className="space-y-8 bg-slate-50"
    >
      <ReportPrintHeader
        organization="Ensamble Coral Vivace"
        reportTitle="Reporte financiero general"
        subtitle="Vivace Suite"
        generatedAt={
          document.metadata.generatedAt
        }
      />

      <ReportSummaryCards
        metrics={metrics}
        columns={4}
      />

      <section className="grid gap-6 xl:grid-cols-2">
        <ChargeStatusCard
          paid={summary.paidChargesCount}
          partial={summary.partialChargesCount}
          pending={summary.pendingChargesCount}
          total={summary.totalChargesCount}
        />

        <PaymentMethodsCard
          rows={paymentMethods}
        />
      </section>

      <ReportTableCard
        title="Consolidado por integrante"
        description={`${members.length} ${
          members.length === 1
            ? "integrante incluido"
            : "integrantes incluidos"
        }.`}
      >
        <MemberFinancialTable
          members={members}
        />
      </ReportTableCard>

      <ReportTableCard
        title="Consolidado por tipo de cuota"
        description={`${feeTypes.length} ${
          feeTypes.length === 1
            ? "tipo de cuota incluido"
            : "tipos de cuota incluidos"
        }.`}
      >
        <FeeTypeFinancialTable
          feeTypes={feeTypes}
        />
      </ReportTableCard>
    </div>
  );
}

interface ChargeStatusCardProps {
  paid: number;
  partial: number;
  pending: number;
  total: number;
}

function ChargeStatusCard({
  paid,
  partial,
  pending,
  total,
}: ChargeStatusCardProps) {
  const rows = [
    {
      label: "Pagados",
      value: paid,
    },
    {
      label: "Parciales",
      value: partial,
    },
    {
      label: "Pendientes",
      value: pending,
    },
  ];

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        Estado de los cargos
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Distribución general por situación de pago.
      </p>

      <div className="mt-6 space-y-4">
        {rows.map((row) => {
          const percentage =
            total > 0
              ? (row.value / total) * 100
              : 0;

          return (
            <div key={row.label}>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="font-medium text-slate-700">
                  {row.label}
                </span>

                <span className="text-slate-500">
                  {row.value} ·{" "}
                  {percentage.toFixed(2)}%
                </span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-700"
                  style={{
                    width: `${Math.min(
                      percentage,
                      100,
                    )}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}

interface PaymentMethodsCardProps {
  rows: FinancialReportPaymentMethodRow[];
}

function PaymentMethodsCard({
  rows,
}: PaymentMethodsCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        Métodos de pago
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Distribución de los pagos registrados.
      </p>

      <div className="mt-6 space-y-4">
        {rows.length === 0 ? (
          <EmptyReportState
            title="No hay pagos registrados"
            message="La distribución aparecerá cuando existan pagos."
          />
        ) : (
          rows.map((row) => (
            <div key={row.paymentMethod}>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="font-medium text-slate-700">
                  {row.paymentMethod}
                </span>

                <span className="text-slate-500">
                  {formatReportCurrency(
                    row.totalPaid,
                  )} ·{" "}
                  {row.percentage.toFixed(
                    2,
                  )}
                  %
                </span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-700"
                  style={{
                    width: `${Math.min(
                      row.percentage,
                      100,
                    )}%`,
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </article>
  );
}

interface MemberFinancialTableProps {
  members: FinancialReportMemberRow[];
}

function MemberFinancialTable({
  members,
}: MemberFinancialTableProps) {
  if (members.length === 0) {
    return (
      <EmptyReportState
        title="No hay cargos registrados"
        message="El reporte se actualizará cuando existan movimientos."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <TableHeader>
              Integrante
            </TableHeader>

            <TableHeader>
              Cargos
            </TableHeader>

            <TableHeader>
              Cargado
            </TableHeader>

            <TableHeader>
              Pagado
            </TableHeader>

            <TableHeader>
              Pendiente
            </TableHeader>

            <TableHeader>
              Recuperación
            </TableHeader>

            <TableHeader>
              Estado
            </TableHeader>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 bg-white">
          {members.map((member) => (
            <tr
              key={member.memberId}
              className="transition hover:bg-slate-50"
            >
              <TableCell className="font-semibold text-slate-900">
                {member.memberName}
              </TableCell>

              <TableCell>
                {member.chargeCount}
              </TableCell>

              <TableCell>
                {formatReportCurrency(
                  member.totalCharged,
                )}
              </TableCell>

              <TableCell>
                {formatReportCurrency(
                  member.totalPaid,
                )}
              </TableCell>

              <TableCell>
                {formatReportCurrency(
                  member.totalPending,
                )}
              </TableCell>

              <TableCell className="font-semibold text-emerald-800">
                {member.recoveryPercentage.toFixed(
                  2,
                )}
                %
              </TableCell>

              <TableCell>
                <FinancialStatusBadge
                  status={member.status}
                />
              </TableCell>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface FeeTypeFinancialTableProps {
  feeTypes: FinancialReportFeeTypeRow[];
}

function FeeTypeFinancialTable({
  feeTypes,
}: FeeTypeFinancialTableProps) {
  if (feeTypes.length === 0) {
    return (
      <EmptyReportState
        title="No hay tipos de cuota con movimientos"
        message="El reporte se actualizará cuando existan cargos."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <TableHeader>
              Tipo de cuota
            </TableHeader>

            <TableHeader>
              Categoría
            </TableHeader>

            <TableHeader>
              Cargos
            </TableHeader>

            <TableHeader>
              Cargado
            </TableHeader>

            <TableHeader>
              Pagado
            </TableHeader>

            <TableHeader>
              Pendiente
            </TableHeader>

            <TableHeader>
              Recuperación
            </TableHeader>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 bg-white">
          {feeTypes.map((feeType) => (
            <tr
              key={feeType.feeTypeId}
              className="transition hover:bg-slate-50"
            >
              <TableCell className="font-semibold text-slate-900">
                {feeType.feeTypeName}
              </TableCell>

              <TableCell>
                {feeType.category}
              </TableCell>

              <TableCell>
                {feeType.chargeCount}
              </TableCell>

              <TableCell>
                {formatReportCurrency(
                  feeType.totalCharged,
                )}
              </TableCell>

              <TableCell>
                {formatReportCurrency(
                  feeType.totalPaid,
                )}
              </TableCell>

              <TableCell>
                {formatReportCurrency(
                  feeType.totalPending,
                )}
              </TableCell>

              <TableCell className="font-semibold text-emerald-800">
                {feeType.recoveryPercentage.toFixed(
                  2,
                )}
                %
              </TableCell>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface TableHeaderProps {
  children: React.ReactNode;
}

function TableHeader({
  children,
}: TableHeaderProps) {
  return (
    <th
      scope="col"
      className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
    >
      {children}
    </th>
  );
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
}

function TableCell({
  children,
  className = "",
}: TableCellProps) {
  return (
    <td
      className={`whitespace-nowrap px-6 py-4 text-sm text-slate-600 ${className}`}
    >
      {children}
    </td>
  );
}

interface FinancialStatusBadgeProps {
  status: FinancialReportMemberRow["status"];
}

function FinancialStatusBadge({
  status,
}: FinancialStatusBadgeProps) {
  const labels = {
    paid: "Pagado",
    partial: "Parcial",
    pending: "Pendiente",
  } satisfies Record<
    FinancialReportMemberRow["status"],
    string
  >;

  const styles = {
    paid:
      "bg-emerald-100 text-emerald-800",
    partial:
      "bg-amber-100 text-amber-800",
    pending:
      "bg-rose-100 text-rose-800",
  } satisfies Record<
    FinancialReportMemberRow["status"],
    string
  >;

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
