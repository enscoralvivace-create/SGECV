import { supabase } from "@/lib/supabase";

const MEMBER_CHARGES_TABLE = "member_charges";
const MEMBERS_TABLE = "members";
const FEE_TYPES_TABLE = "fee_types";

export type ChargeStatus =
  | "pending"
  | "partial"
  | "paid"
  | "cancelled";

interface MemberChargeRow {
  id: string;
  member_id: number;
  fee_type_id: string;
  amount: number;
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

export interface ChargeListItem {
  id: string;
  memberId: number;
  memberName: string;
  feeTypeId: string;
  feeTypeName: string;
  amount: number;
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
}

/**
 * Obtiene los cargos más recientes junto con el nombre del integrante
 * y el concepto correspondiente.
 *
 * La relación se construye en el cliente para no depender del nombre
 * generado por Supabase para las llaves foráneas.
 */
export async function getRecentCharges(
  limit = 10,
): Promise<ChargeListItem[]> {
  const [
    chargesResult,
    membersResult,
    feeTypesResult,
  ] = await Promise.all([
    supabase
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
  .order("created_at", { ascending: false })
  .limit(limit),

    supabase
      .from(MEMBERS_TABLE)
      .select("id, name, last_name"),

    supabase
      .from(FEE_TYPES_TABLE)
      .select("id, name"),
  ]);

  if (chargesResult.error) {
    throw new Error(chargesResult.error.message);
  }

  if (membersResult.error) {
    throw new Error(membersResult.error.message);
  }

  if (feeTypesResult.error) {
    throw new Error(feeTypesResult.error.message);
  }

  const charges =
    (chargesResult.data ?? []) as unknown as MemberChargeRow[];

  const members =
    (membersResult.data ?? []) as unknown as ChargeMemberRow[];

  const feeTypes =
    (feeTypesResult.data ?? []) as ChargeFeeTypeRow[];

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

  return charges.map((charge) => ({
    id: charge.id,
    memberId: charge.member_id,
    memberName:
      membersById.get(charge.member_id) ??
      "Integrante no disponible",
    feeTypeId: charge.fee_type_id,
    feeTypeName:
      feeTypesById.get(charge.fee_type_id) ??
      "Concepto no disponible",
    amount: Number(charge.amount),
    billingPeriod: charge.billing_period,
    dueDate: charge.due_date,
    status: charge.status,
    notes: charge.notes,
    createdAt: charge.created_at,
  }));
}

/**
 * Cuenta los cargos por estado.
 *
 * Más adelante agregaremos aquí los importes pagados y los ingresos
 * reales, usando la tabla payments.
 */
export async function getChargeSummary(): Promise<ChargeSummary> {
  const { data, error } = await supabase
    .from(MEMBER_CHARGES_TABLE)
    .select("status");

  if (error) {
    throw new Error(error.message);
  }

  const summary: ChargeSummary = {
    pending: 0,
    partial: 0,
    paid: 0,
    cancelled: 0,
  };

  for (const row of data ?? []) {
    const status = row.status as ChargeStatus;

    if (status in summary) {
      summary[status] += 1;
    }
  }

  return summary;
}