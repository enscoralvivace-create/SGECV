import { supabase } from "@/lib/supabase";
import type {
  ApprovedIntakeRequest,
  CreatedIntakeWindow,
  IntakeRequest,
  IntakeRequestInput,
  IntakeRequestStatus,
  IntakeRequestedRole,
  IntakeWindowSummary,
  IntakeWindowValidation,
} from "@/types/intake";

type RpcRow = Record<string, unknown>;

function firstRow(data: unknown): RpcRow {
  if (!Array.isArray(data) || !data[0] || typeof data[0] !== "object") {
    throw new Error("La respuesta del servidor no tiene el formato esperado.");
  }
  return data[0] as RpcRow;
}

function text(row: RpcRow, key: string): string {
  if (typeof row[key] !== "string") throw new Error("Respuesta incompleta.");
  return row[key];
}

function number(row: RpcRow, key: string): number {
  const value = Number(row[key]);
  if (!Number.isFinite(value)) throw new Error("Respuesta incompleta.");
  return value;
}

export async function createIntakeWindow(input: {
  name: string;
  validForHours: number;
  message?: string;
}): Promise<CreatedIntakeWindow> {
  const { data, error } = await supabase.rpc("create_intake_window", {
    p_name: input.name,
    p_valid_for_hours: input.validForHours,
    p_message: input.message?.trim() || null,
  });
  if (error) throw new Error(error.message);
  const row = firstRow(data);
  return {
    id: text(row, "window_id"),
    name: text(row, "window_name"),
    expiresAt: text(row, "expires_at"),
    plainToken: text(row, "plain_token"),
  };
}

export async function validateIntakeWindow(token: string): Promise<IntakeWindowValidation> {
  const { data, error } = await supabase.rpc("validate_intake_window", {
    p_plain_token: token,
  });
  if (error) throw new Error(error.message);
  const row = firstRow(data);
  return {
    isAvailable: row.is_available === true,
    resultCode: text(row, "result_code"),
    name: typeof row.window_name === "string" ? row.window_name : null,
    message: typeof row.window_message === "string" ? row.window_message : null,
    expiresAt: typeof row.expires_at === "string" ? row.expires_at : null,
  };
}

export async function submitIntakeRequest(
  token: string,
  input: IntakeRequestInput,
): Promise<string> {
  const { data, error } = await supabase.rpc("submit_intake_request", {
    p_plain_token: token,
    p_first_name: input.firstName,
    p_last_name: input.lastName,
    p_email: input.email,
    p_phone: input.phone?.trim() || null,
    p_requested_voice: input.requestedVoice || null,
    p_notes: input.notes?.trim() || null,
  });
  if (error) throw new Error(error.message);
  const row = firstRow(data);
  if (row.success !== true) return text(row, "result_code");
  return "submitted";
}

export async function listIntakeWindows(): Promise<IntakeWindowSummary[]> {
  const { data, error } = await supabase.rpc("list_intake_windows");
  if (error) throw new Error(error.message);
  return ((data ?? []) as RpcRow[]).map((row) => ({
    id: text(row, "id"), name: text(row, "name"),
    status: text(row, "status") as IntakeWindowSummary["status"],
    expiresAt: text(row, "expires_at"), createdAt: text(row, "created_at"),
    closedAt: typeof row.closed_at === "string" ? row.closed_at : null,
    message: typeof row.message === "string" ? row.message : null,
    pendingCount: number(row, "pending_count"),
  }));
}

export async function updateIntakeWindowStatus(
  windowId: string,
  action: "closed" | "revoked",
): Promise<void> {
  const { data, error } = await supabase.rpc("close_or_revoke_intake_window", {
    p_window_id: windowId, p_action: action,
  });
  if (error) throw new Error(error.message);
  if (firstRow(data).success !== true) throw new Error("La ventana ya no está abierta.");
}

export async function listIntakeRequests(
  status: IntakeRequestStatus | null = null,
): Promise<IntakeRequest[]> {
  const { data, error } = await supabase.rpc("list_intake_requests", {
    p_status: status,
  });
  if (error) throw new Error(error.message);
  return ((data ?? []) as RpcRow[]).map((row) => ({
    id: number(row, "id"), windowId: text(row, "window_id"),
    windowName: text(row, "window_name"), firstName: text(row, "first_name"),
    lastName: text(row, "last_name"), email: text(row, "email"),
    phone: typeof row.phone === "string" ? row.phone : null,
    requestedVoice: typeof row.requested_voice === "string" ? row.requested_voice : null,
    requestedRole: text(row, "requested_role") as IntakeRequestedRole,
    notes: typeof row.notes === "string" ? row.notes : null,
    status: text(row, "status") as IntakeRequestStatus,
    rejectionReason: typeof row.rejection_reason === "string" ? row.rejection_reason : null,
    memberId: row.member_id == null ? null : number(row, "member_id"),
    invitationId: typeof row.invitation_id === "string" ? row.invitation_id : null,
    invitationDeliveryStatus: typeof row.invitation_delivery_status === "string"
      ? row.invitation_delivery_status as IntakeRequest["invitationDeliveryStatus"] : null,
    createdAt: text(row, "created_at"),
    reviewedAt: typeof row.reviewed_at === "string" ? row.reviewed_at : null,
  }));
}

export async function approveIntakeRequest(
  id: number,
  approvedRole: IntakeRequestedRole,
): Promise<ApprovedIntakeRequest> {
  const { data, error } = await supabase.rpc("approve_intake_request", {
    p_request_id: id,
    p_approved_role: approvedRole,
  });
  if (error) throw new Error(error.message);
  const row = firstRow(data);
  return {
    requestId: number(row, "request_id"), memberId: number(row, "member_id"),
    memberResolution: text(row, "member_resolution") as "created" | "existing",
    invitationId: text(row, "invitation_id"),
    invitationExpiresAt: text(row, "invitation_expires_at"),
    plainInvitationToken: text(row, "plain_invitation_token"),
    deliveryStatus: "manual_pending",
  };
}

export async function rejectIntakeRequest(id: number, reason: string): Promise<void> {
  const { data, error } = await supabase.rpc("reject_intake_request", {
    p_request_id: id, p_reason: reason,
  });
  if (error) throw new Error(error.message);
  if (firstRow(data).success !== true) throw new Error("La solicitud ya fue revisada.");
}
