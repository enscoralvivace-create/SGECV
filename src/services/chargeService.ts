import { supabase } from "@/lib/supabase";

const MEMBER_CHARGES_TABLE = "member_charges";
const MEMBERS_TABLE = "members";
const FEE_TYPES_TABLE = "fee_types";
const PAYMENTS_TABLE = "payments";

export type ChargeStatus =
  | "pending"
  | "partial"
  | "paid"
  | "cancelled";

interface MemberChargeRow {
  id: string;
  member_id: number;
  fee_type_id: string;
  amount: number | string;
  billing_period: string | null;
  due_date: string | null;
  status: ChargeStatus;
  notes: string | null;
  created_at: string;
}

interface ChargeMemberRow {
  id: number;
  name: string;
  last_name: string;
}

interface ChargeFeeTypeRow {
  id: string;
  name: string;
}

interface ChargePaymentRow {
  member_charge_id: string;
  amount: number | string;
}

interface MonthlyPaymentRow {
  amount: number | string;
}

export interface ChargeListItem {
  id: string;
  memberId: number;
  memberName: string;
  feeTypeId: string;
  feeTypeName: string;
  amount: number;
  paidAmount: number;
  balance: number;
  billingPeriod: string | null;
  dueDate: string | null;
  status: ChargeStatus;
  notes: string | null;
  createdAt: string;
}

export interface ChargeSummary {
  pending: number;
  partial: number;
  paid: number;
  cancelled: number;
  monthlyIncome: number;
}

/**
 * Obtiene los cargos más recientes, junto con los
 * integrantes, conceptos y pagos registrados.
 */
export async function getRecentCharges(
  limit = 10,
): Promise<ChargeListItem[]> {
  const { data, error } = await supabase
    .from(MEMBER_CHARGES_TABLE)
    .select(`
      id,
      member_id,
      fee_type_id,
      amount,
      billing_period,
      due_date,
      status,
      notes,
      created_at
    `)
    .order("created_at", {
      ascending: false,
    })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  const charges =
    (data ?? []) as unknown as MemberChargeRow[];

  return buildChargeListItems(charges);
}

/**
 * Obtiene todos los cargos pertenecientes a un
 * integrante, ordenados del más reciente al más antiguo.
 */
export async function getChargesByMember(
  memberId: number,
): Promise<ChargeListItem[]> {
  const { data, error } = await supabase
    .from(MEMBER_CHARGES_TABLE)
    .select(`
      id,
      member_id,
      fee_type_id,
      amount,
      billing_period,
      due_date,
      status,
      notes,
      created_at
    `)
    .eq("member_id", memberId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  const charges =
    (data ?? []) as unknown as MemberChargeRow[];

  return buildChargeListItems(charges);
}

/**
 * Obtiene el número de cargos por estado y calcula
 * los ingresos recibidos durante el mes actual.
 */
export async function getChargeSummary(): Promise<ChargeSummary> {
  const { startOfMonth, startOfNextMonth } =
    getCurrentMonthDateRange();

  const [
    chargesResult,
    monthlyPaymentsResult,
  ] = await Promise.all([
    supabase
      .from(MEMBER_CHARGES_TABLE)
      .select("status"),

    supabase
      .from(PAYMENTS_TABLE)
      .select("amount")
      .gte("payment_date", startOfMonth)
      .lt("payment_date", startOfNextMonth),
  ]);

  if (chargesResult.error) {
    throw new Error(chargesResult.error.message);
  }

  if (monthlyPaymentsResult.error) {
    throw new Error(
      monthlyPaymentsResult.error.message,
    );
  }

  const summary: ChargeSummary = {
    pending: 0,
    partial: 0,
    paid: 0,
    cancelled: 0,
    monthlyIncome: 0,
  };

  for (const row of chargesResult.data ?? []) {
    const status = row.status as ChargeStatus;

    if (
      status === "pending" ||
      status === "partial" ||
      status === "paid" ||
      status === "cancelled"
    ) {
      summary[status] += 1;
    }
  }

  const monthlyPayments =
    (monthlyPaymentsResult.data ??
      []) as unknown as MonthlyPaymentRow[];

  summary.monthlyIncome = monthlyPayments.reduce(
    (total, payment) =>
      total + Number(payment.amount),
    0,
  );

  return summary;
}

/**
 * Completa la información de los cargos con el nombre
 * del integrante, concepto y cantidades pagadas.
 */
async function buildChargeListItems(
  charges: MemberChargeRow[],
): Promise<ChargeListItem[]> {
  if (charges.length === 0) {
    return [];
  }

  const memberIds = [
    ...new Set(
      charges.map((charge) => charge.member_id),
    ),
  ];

  const feeTypeIds = [
    ...new Set(
      charges.map((charge) => charge.fee_type_id),
    ),
  ];

  const chargeIds = charges.map(
    (charge) => charge.id,
  );

  const [
    membersResult,
    feeTypesResult,
    paymentsResult,
  ] = await Promise.all([
    supabase
      .from(MEMBERS_TABLE)
      .select("id, name, last_name")
      .in("id", memberIds),

    supabase
      .from(FEE_TYPES_TABLE)
      .select("id, name")
      .in("id", feeTypeIds),

    supabase
      .from(PAYMENTS_TABLE)
      .select("member_charge_id, amount")
      .in("member_charge_id", chargeIds),
  ]);

  if (membersResult.error) {
    throw new Error(membersResult.error.message);
  }

  if (feeTypesResult.error) {
    throw new Error(feeTypesResult.error.message);
  }

  if (paymentsResult.error) {
    throw new Error(paymentsResult.error.message);
  }

  const members =
    (membersResult.data ??
      []) as unknown as ChargeMemberRow[];

  const feeTypes =
    (feeTypesResult.data ??
      []) as unknown as ChargeFeeTypeRow[];

  const payments =
    (paymentsResult.data ??
      []) as unknown as ChargePaymentRow[];

  const membersById = new Map(
    members.map((member) => [
      member.id,
      `${member.name} ${member.last_name}`.trim(),
    ]),
  );

  const feeTypesById = new Map(
    feeTypes.map((feeType) => [
      feeType.id,
      feeType.name,
    ]),
  );

  const paidAmountByChargeId = new Map<
    string,
    number
  >();

  for (const payment of payments) {
    const currentPaidAmount =
      paidAmountByChargeId.get(
        payment.member_charge_id,
      ) ?? 0;

    paidAmountByChargeId.set(
      payment.member_charge_id,
      currentPaidAmount + Number(payment.amount),
    );
  }

  return charges.map((charge) => {
    const amount = Number(charge.amount);

    const paidAmount =
      paidAmountByChargeId.get(charge.id) ?? 0;

    const balance = Math.max(
      amount - paidAmount,
      0,
    );

    return {
      id: charge.id,
      memberId: charge.member_id,
      memberName:
        membersById.get(charge.member_id) ??
        "Integrante no disponible",
      feeTypeId: charge.fee_type_id,
      feeTypeName:
        feeTypesById.get(charge.fee_type_id) ??
        "Concepto no disponible",
      amount,
      paidAmount,
      balance,
      billingPeriod: charge.billing_period,
      dueDate: charge.due_date,
      status: charge.status,
      notes: charge.notes,
      createdAt: charge.created_at,
    };
  });
}

function getCurrentMonthDateRange(): {
  startOfMonth: string;
  startOfNextMonth: string;
} {
  const now = new Date();

  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
    0,
    0,
    0,
    0,
  );

  const startOfNextMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    1,
    0,
    0,
    0,
    0,
  );

  return {
    startOfMonth: startOfMonth.toISOString(),
    startOfNextMonth:
      startOfNextMonth.toISOString(),
  };
}