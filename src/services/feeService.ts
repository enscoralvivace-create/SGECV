import { supabase } from "@/lib/supabase";

const FEE_TYPES_TABLE = "fee_types";
const MEMBER_CHARGES_TABLE = "member_charges";

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
export async function getActiveFeeTypes(): Promise<FeeType[]> {
  const { data, error } = await supabase
    .from(FEE_TYPES_TABLE)
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });

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