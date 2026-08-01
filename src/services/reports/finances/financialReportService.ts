import { supabase } from "@/lib/supabase";

import { buildReportMetadata } from "@/services/reportService";

import type {
  FinancialReportChargeStatus,
  FinancialReportData,
  FinancialReportFeeTypeRow,
  FinancialReportMemberRow,
  FinancialReportPaymentMethodRow,
  FinancialReportSummary,
} from "@/types/financialReport";

import type {
  ReportColumn,
  ReportDocument,
  ReportSection,
  ReportSummaryMetric,
} from "@/types/report";

interface PaymentRow {
  amount: number | string | null;
  payment_method: string | null;
}

interface MemberRelationRow {
  name: string | null;
  last_name: string | null;
}

interface FeeTypeRelationRow {
  name: string | null;
  category: string | null;
}

interface ChargeRow {
  id: number;
  member_id: number;
  fee_type_id: number;
  amount: number | string | null;
  status: string;
  members:
    | MemberRelationRow[]
    | null;
  fee_types:
    | FeeTypeRelationRow[]
    | null;
  payments:
    | PaymentRow[]
    | null;
}

const memberColumns:
ReportColumn<FinancialReportMemberRow>[] = [
  {
    key: "memberName",
    header: "Integrante",
    align: "left",
  },
  {
    key: "chargeCount",
    header: "Cargos",
    align: "center",
  },
  {
    key: "totalCharged",
    header: "Cargado",
    align: "right",
    format: (value) =>
      formatCurrency(
        Number(value ?? 0),
      ),
  },
  {
    key: "totalPaid",
    header: "Pagado",
    align: "right",
    format: (value) =>
      formatCurrency(
        Number(value ?? 0),
      ),
  },
  {
    key: "totalPending",
    header: "Pendiente",
    align: "right",
    format: (value) =>
      formatCurrency(
        Number(value ?? 0),
      ),
  },
  {
    key: "recoveryPercentage",
    header: "Recuperación",
    align: "right",
    format: (value) =>
      `${Number(value ?? 0).toFixed(2)}%`,
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

function buildMemberName(
  charge: ChargeRow,
): string {
  const member =
    charge.members?.[0];

  const name =
    member?.name?.trim() ?? "";

  const lastName =
    member?.last_name?.trim() ?? "";

  return [name, lastName]
    .filter(Boolean)
    .join(" ") ||
    "Integrante no disponible";
}

function getFeeTypeRelation(
  charge: ChargeRow,
): FeeTypeRelationRow | null {
  return charge.fee_types?.[0] ?? null;
}

function normalizeChargeStatus(
  charged: number,
  paid: number,
): FinancialReportChargeStatus {
  if (paid >= charged && charged > 0) {
    return "paid";
  }

  if (paid > 0) {
    return "partial";
  }

  return "pending";
}

async function getFinancialRows(): Promise<ChargeRow[]> {
  const { data, error } = await supabase
    .from("member_charges")
    .select(`
      id,
      member_id,
      fee_type_id,
      amount,
      status,
      members (
        name,
        last_name
      ),
      fee_types (
        name,
        category
      ),
      payments (
        amount,
        payment_method
      )
    `)
    .neq("status", "cancelled");

  if (error) {
    throw new Error(
      `No fue posible consultar la información financiera: ${error.message}`,
    );
  }

  return (data ?? []) as ChargeRow[];
}

function buildMemberRows(
  charges: ChargeRow[],
): FinancialReportMemberRow[] {
  const map = new Map<
    number,
    FinancialReportMemberRow
  >();

  charges.forEach((charge) => {
    const charged =
      Number(charge.amount ?? 0);

    const paid =
      (charge.payments ?? []).reduce(
        (total, payment) =>
          total +
          Number(payment.amount ?? 0),
        0,
      );

    const pending = Math.max(
      charged - paid,
      0,
    );

    const current = map.get(
      charge.member_id,
    ) ?? {
      memberId: charge.member_id,
      memberName:
        buildMemberName(charge),
      chargeCount: 0,
      totalCharged: 0,
      totalPaid: 0,
      totalPending: 0,
      recoveryPercentage: 0,
      status: "pending",
    };

    current.chargeCount += 1;
    current.totalCharged += charged;
    current.totalPaid += paid;
    current.totalPending += pending;

    map.set(
      charge.member_id,
      current,
    );
  });

  return Array.from(map.values())
    .map((row) => ({
      ...row,
      recoveryPercentage:
        calculatePercentage(
          row.totalPaid,
          row.totalCharged,
        ),
      status:
        normalizeChargeStatus(
          row.totalCharged,
          row.totalPaid,
        ),
    }))
    .sort((a, b) =>
      a.memberName.localeCompare(
        b.memberName,
        "es",
      ),
    );
}

function buildFeeTypeRows(
  charges: ChargeRow[],
): FinancialReportFeeTypeRow[] {
  const map = new Map<
    number,
    FinancialReportFeeTypeRow
  >();

  charges.forEach((charge) => {
    const charged =
      Number(charge.amount ?? 0);

    const paid =
      (charge.payments ?? []).reduce(
        (total, payment) =>
          total +
          Number(payment.amount ?? 0),
        0,
      );

    const feeType =
      getFeeTypeRelation(charge);

    const current = map.get(
      charge.fee_type_id,
    ) ?? {
      feeTypeId:
        charge.fee_type_id,
      feeTypeName:
        feeType?.name?.trim() ||
        "Tipo no disponible",
      category:
        feeType?.category?.trim() ||
        "Sin categoría",
      chargeCount: 0,
      totalCharged: 0,
      totalPaid: 0,
      totalPending: 0,
      recoveryPercentage: 0,
    };

    current.chargeCount += 1;
    current.totalCharged += charged;
    current.totalPaid += paid;
    current.totalPending += Math.max(
      charged - paid,
      0,
    );

    map.set(
      charge.fee_type_id,
      current,
    );
  });

  return Array.from(map.values())
    .map((row) => ({
      ...row,
      recoveryPercentage:
        calculatePercentage(
          row.totalPaid,
          row.totalCharged,
        ),
    }))
    .sort((a, b) =>
      b.totalCharged -
      a.totalCharged,
    );
}

function buildPaymentMethodRows(
  charges: ChargeRow[],
): FinancialReportPaymentMethodRow[] {
  const totals = new Map<
    string,
    {
      paymentCount: number;
      totalPaid: number;
    }
  >();

  charges.forEach((charge) => {
    (charge.payments ?? []).forEach(
      (payment) => {
        const method =
          payment.payment_method?.trim() ||
          "No especificado";

        const current =
          totals.get(method) ?? {
            paymentCount: 0,
            totalPaid: 0,
          };

        current.paymentCount += 1;
        current.totalPaid += Number(
          payment.amount ?? 0,
        );

        totals.set(method, current);
      },
    );
  });

  const grandTotal = Array.from(
    totals.values(),
  ).reduce(
    (total, row) =>
      total + row.totalPaid,
    0,
  );

  return Array.from(totals.entries())
    .map(
      ([
        paymentMethod,
        row,
      ]) => ({
        paymentMethod,
        paymentCount:
          row.paymentCount,
        totalPaid:
          row.totalPaid,
        percentage:
          calculatePercentage(
            row.totalPaid,
            grandTotal,
          ),
      }),
    )
    .sort((a, b) =>
      b.totalPaid -
      a.totalPaid,
    );
}

function buildSummary(
  charges: ChargeRow[],
  members: FinancialReportMemberRow[],
): FinancialReportSummary {
  const totalCharged = charges.reduce(
    (total, charge) =>
      total +
      Number(charge.amount ?? 0),
    0,
  );

  const totalPaid = charges.reduce(
    (total, charge) =>
      total +
      (charge.payments ?? []).reduce(
        (paymentTotal, payment) =>
          paymentTotal +
          Number(payment.amount ?? 0),
        0,
      ),
    0,
  );

  const totalPending = Math.max(
    totalCharged - totalPaid,
    0,
  );

  const chargeStatuses = charges.map(
    (charge) => {
      const charged =
        Number(charge.amount ?? 0);

      const paid =
        (charge.payments ?? []).reduce(
          (total, payment) =>
            total +
            Number(payment.amount ?? 0),
          0,
        );

      return normalizeChargeStatus(
        charged,
        paid,
      );
    },
  );

  return {
    totalChargesCount:
      charges.length,
    totalPaymentsCount:
      charges.reduce(
        (total, charge) =>
          total +
          (charge.payments?.length ?? 0),
        0,
      ),
    totalCharged,
    totalPaid,
    totalPending,
    recoveryPercentage:
      calculatePercentage(
        totalPaid,
        totalCharged,
      ),
    paidChargesCount:
      chargeStatuses.filter(
        (status) =>
          status === "paid",
      ).length,
    partialChargesCount:
      chargeStatuses.filter(
        (status) =>
          status === "partial",
      ).length,
    pendingChargesCount:
      chargeStatuses.filter(
        (status) =>
          status === "pending",
      ).length,
    membersWithCharges:
      members.length,
    membersWithPendingBalance:
      members.filter(
        (member) =>
          member.totalPending > 0,
      ).length,
  };
}

function buildSummaryMetrics(
  summary: FinancialReportSummary,
): ReportSummaryMetric[] {
  return [
    {
      id: "financial-charged",
      label: "Total cargado",
      value:
        formatCurrency(
          summary.totalCharged,
        ),
      description:
        `${summary.totalChargesCount} cargos incluidos.`,
    },
    {
      id: "financial-paid",
      label: "Total pagado",
      value:
        formatCurrency(
          summary.totalPaid,
        ),
      description:
        `${summary.totalPaymentsCount} pagos registrados.`,
    },
    {
      id: "financial-pending",
      label: "Saldo pendiente",
      value:
        formatCurrency(
          summary.totalPending,
        ),
      description:
        `${summary.membersWithPendingBalance} integrantes con saldo.`,
    },
    {
      id: "financial-recovery",
      label: "Recuperación",
      value:
        `${summary.recoveryPercentage.toFixed(
          2,
        )}%`,
      description:
        "Pagos recibidos respecto de cargos.",
    },
  ];
}

function buildSections(
  members: FinancialReportMemberRow[],
  summary: FinancialReportSummary,
): ReportSection<FinancialReportMemberRow>[] {
  return [
    {
      id: "financial-summary",
      title: "Resumen general",
      description:
        "Indicadores principales de recuperación financiera.",
      metrics:
        buildSummaryMetrics(summary),
    },
    {
      id: "financial-members",
      title: "Consolidado por integrante",
      description:
        "Cargos, pagos y saldos pendientes por integrante.",
      columns: memberColumns,
      rows: members,
    },
  ];
}

export async function getFinancialReportData(): Promise<FinancialReportData> {
  const charges =
    await getFinancialRows();

  const members =
    buildMemberRows(charges);

  const feeTypes =
    buildFeeTypeRows(charges);

  const paymentMethods =
    buildPaymentMethodRows(charges);

  const summary =
    buildSummary(
      charges,
      members,
    );

  const document:
  ReportDocument<FinancialReportMemberRow> = {
    metadata:
      buildReportMetadata({
        reportId:
          "financial-general-report",
        title:
          "Reporte financiero general",
        category: "finances",
      }),
    sections: buildSections(
      members,
      summary,
    ),
  };

  return {
    document,
    summary,
    members,
    feeTypes,
    paymentMethods,
  };
}