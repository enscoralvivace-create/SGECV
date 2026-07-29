import { supabase } from "@/lib/supabase";

export type PaymentMethod =
  | "cash"
  | "transfer"
  | "card"
  | "other";

export interface PaymentFormData {
  memberChargeId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate?: string;
  reference?: string;
  notes?: string;
}

export interface Payment {
  id: string;
  member_charge_id: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_date: string;
  reference: string | null;
  notes: string | null;
  receipt_number: string | null;
  receipt_issued_at: string | null;
  created_at: string;
}

export interface PaymentListItem {
  id: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  reference: string | null;
  notes: string | null;
  receiptNumber: string | null;
  createdAt: string;
}

export async function createPayment(
  payment: PaymentFormData,
): Promise<Payment> {
  const payload = {
    member_charge_id: payment.memberChargeId,
    amount: payment.amount,
    payment_method: payment.paymentMethod,
    payment_date:
      payment.paymentDate?.trim() || undefined,
    reference: payment.reference?.trim() || null,
    notes: payment.notes?.trim() || null,
  };

  const { data, error } = await supabase
    .from("payments")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw createSupabaseError(error);
  }

  return {
    ...data,
    amount: Number(data.amount),
  } as Payment;
}

export async function getPaymentsByCharge(
  memberChargeId: string,
): Promise<PaymentListItem[]> {
  const { data, error } = await supabase
    .from("payments")
    .select(
      `
        id,
        amount,
        payment_method,
        payment_date,
        reference,
        notes,
        receipt_number,
        created_at
      `,
    )
    .eq("member_charge_id", memberChargeId)
    .order("payment_date", {
      ascending: false,
    })
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw createSupabaseError(error);
  }

  return (data ?? []).map((payment) => ({
    id: payment.id,
    amount: Number(payment.amount),
    paymentMethod:
      payment.payment_method as PaymentMethod,
    paymentDate: payment.payment_date,
    reference: payment.reference,
    notes: payment.notes,
    receiptNumber: payment.receipt_number,
    createdAt: payment.created_at,
  }));
}

interface SupabaseErrorData {
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
}

function createSupabaseError(
  error: SupabaseErrorData,
): Error {
  return new Error(
    [
      error.message,
      error.details,
      error.hint,
      error.code
        ? `Código: ${error.code}`
        : null,
    ]
      .filter(Boolean)
      .join(" | "),
  );
}