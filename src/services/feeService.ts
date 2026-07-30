import { supabase } from "@/lib/supabase";

const FEE_TYPES_TABLE = "fee_types";
const MEMBER_CHARGES_TABLE =
  "member_charges";

export type FeeCategory =
  | "Ordinaria"
  | "Extraordinaria"
  | "Material"
  | "Viaje"
  | "Evento"
  | "Otro";

export interface FeeType {
  id: string;
  name: string;
  category: FeeCategory;
  default_amount: number | null;
  is_active: boolean;
  created_at: string;
}

/**
 * Obtiene los tipos de cuota activos.
 *
 * Los conceptos se ordenan alfabéticamente para que puedan
 * mostrarse directamente en formularios y selectores.
 */
export async function getActiveFeeTypes(): Promise<
  FeeType[]
> {
  const { data, error } = await supabase
    .from(FEE_TYPES_TABLE)
    .select("*")
    .eq("is_active", true)
    .order("name", {
      ascending: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as FeeType[];
}

export interface CreateChargePayload {
  member_id: number;
  fee_type_id: string;
  amount: number;
  billing_period: string | null;
  due_date: string | null;
  notes: string | null;
  trip_id?: string | null;
}

/**
 * Crea un cargo individual para un integrante.
 *
 * El estado no se envía desde el formulario. La base de datos
 * utiliza su valor predeterminado y el trigger lo actualizará
 * posteriormente cuando se registren pagos.
 */
export async function createCharge(
  charge: CreateChargePayload,
): Promise<void> {
  const { error } = await supabase
    .from(MEMBER_CHARGES_TABLE)
    .insert(charge);

  if (error) {
    throw new Error(error.message);
  }
}

export interface CreateTripChargesPayload {
  tripId: string;
  memberIds: number[];
  feeTypeId: string;
  amount: number;
  billingPeriod: string | null;
  dueDate: string | null;
  notes: string | null;
}

export interface CreateTripChargesResult {
  createdCount: number;
  skippedCount: number;
}

/**
 * Crea cargos para varios participantes de un viaje.
 *
 * Antes de insertar, consulta los cargos existentes asociados
 * al mismo viaje y concepto para evitar duplicados.
 */
export async function createTripCharges(
  payload: CreateTripChargesPayload,
): Promise<CreateTripChargesResult> {
  const uniqueMemberIds = [
    ...new Set(payload.memberIds),
  ];

  if (uniqueMemberIds.length === 0) {
    return {
      createdCount: 0,
      skippedCount: 0,
    };
  }

  const { data: existingCharges, error: existingError } =
    await supabase
      .from(MEMBER_CHARGES_TABLE)
      .select("member_id")
      .eq("trip_id", payload.tripId)
      .eq(
        "fee_type_id",
        payload.feeTypeId,
      )
      .in(
        "member_id",
        uniqueMemberIds,
      );

  if (existingError) {
    throw new Error(
      existingError.message,
    );
  }

  const existingMemberIds =
    new Set(
      (existingCharges ?? []).map(
        (charge) =>
          charge.member_id as number,
      ),
    );

  const pendingMemberIds =
    uniqueMemberIds.filter(
      (memberId) =>
        !existingMemberIds.has(memberId),
    );

  if (pendingMemberIds.length === 0) {
    return {
      createdCount: 0,
      skippedCount:
        uniqueMemberIds.length,
    };
  }

  const charges: CreateChargePayload[] =
    pendingMemberIds.map(
      (memberId) => ({
        member_id: memberId,
        fee_type_id:
          payload.feeTypeId,
        amount: payload.amount,
        billing_period:
          payload.billingPeriod,
        due_date: payload.dueDate,
        notes: payload.notes,
        trip_id: payload.tripId,
      }),
    );

  const { error: insertError } =
    await supabase
      .from(MEMBER_CHARGES_TABLE)
      .insert(charges);

  if (insertError) {
    throw new Error(
      insertError.message,
    );
  }

  return {
    createdCount:
      pendingMemberIds.length,
    skippedCount:
      uniqueMemberIds.length -
      pendingMemberIds.length,
  };
}