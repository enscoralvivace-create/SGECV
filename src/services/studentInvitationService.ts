import { supabase } from "@/lib/supabase";

import type {
  CreatedStudentInvitation,
  StudentInvitationConsumption,
  StudentInvitationStatus,
  StudentInvitationSummary,
  StudentInvitationValidation,
} from "@/types/studentInvitation";

interface CreateInvitationRow {
  invitation_id: unknown;
  member_id: unknown;
  email_normalized: unknown;
  expires_at: unknown;
  plain_token: unknown;
}

interface InvitationSummaryRow {
  id: unknown;
  member_id: unknown;
  member_full_name: unknown;
  email_normalized: unknown;
  expires_at: unknown;
  used_at: unknown;
  revoked_at: unknown;
  created_at: unknown;
  invitation_status: unknown;
}

interface RevokeInvitationRow {
  success: unknown;
  result_code: unknown;
}

interface ValidateInvitationRow {
  is_valid: unknown;
  result_code: unknown;
  expected_email_masked: unknown;
}

interface ConsumeInvitationRow {
  success: unknown;
  result_code: unknown;
}

const INVITATION_STATUSES = new Set<StudentInvitationStatus>([
  "active",
  "expired",
  "used",
  "revoked",
]);

export async function createStudentInvitation(
  memberId: number,
  validForDays = 7,
): Promise<CreatedStudentInvitation> {
  assertPositiveInteger(memberId, "El integrante seleccionado no es válido.");
  assertValidDuration(validForDays);

  const { data, error } = await supabase.rpc(
    "create_student_invitation",
    {
      target_member_id: memberId,
      valid_for: `${validForDays} days`,
    },
  );

  if (error) {
    throw new Error(getRpcErrorMessage(error.message, "crear la invitación"));
  }

  const row = getSingleRow<CreateInvitationRow>(data);

  return {
    invitationId: requireUuid(row.invitation_id, "identificador"),
    memberId: requireNumber(row.member_id, "integrante"),
    emailNormalized: requireNormalizedEmail(row.email_normalized),
    expiresAt: requireDate(row.expires_at, "expiración"),
    plainToken: requirePlainToken(row.plain_token),
  };
}

export async function listStudentInvitations(
  memberId?: number,
): Promise<StudentInvitationSummary[]> {
  if (memberId !== undefined) {
    assertPositiveInteger(memberId, "El integrante seleccionado no es válido.");
  }

  const { data, error } = await supabase.rpc(
    "list_student_invitations",
    { target_member_id: memberId ?? null },
  );

  if (error) {
    throw new Error(getRpcErrorMessage(error.message, "consultar las invitaciones"));
  }

  if (!Array.isArray(data)) {
    throw new Error("La respuesta de invitaciones no tiene el formato esperado.");
  }

  return (data as InvitationSummaryRow[])
    .map(normalizeSummary)
    .sort(
      (left, right) =>
        Date.parse(right.createdAt) - Date.parse(left.createdAt),
    );
}

export async function revokeStudentInvitation(
  invitationId: string,
): Promise<void> {
  if (!invitationId.trim()) {
    throw new Error("La invitación seleccionada no es válida.");
  }

  const { data, error } = await supabase.rpc(
    "revoke_student_invitation",
    { invitation_id: invitationId },
  );

  if (error) {
    throw new Error(getRpcErrorMessage(error.message, "revocar la invitación"));
  }

  const row = getSingleRow<RevokeInvitationRow>(data);

  if (row.success !== true || row.result_code !== "revoked") {
    throw new Error("La invitación ya no puede revocarse.");
  }
}

export async function validateStudentInvitation(
  plainToken: string,
): Promise<StudentInvitationValidation> {
  if (!isValidPlainToken(plainToken)) {
    return {
      isValid: false,
      resultCode: "invalid",
      expectedEmailMasked: null,
    };
  }

  const { data, error } = await supabase.rpc(
    "validate_student_invitation",
    { plain_token: plainToken },
  );

  if (error) {
    throw new Error("No fue posible validar la invitación en este momento.");
  }

  const row = getSingleRow<ValidateInvitationRow>(data);

  if (typeof row.is_valid !== "boolean") {
    throw new Error("La respuesta de validación no tiene el formato esperado.");
  }

  const resultCode = requireString(row.result_code, "resultado");
  const expectedEmailMasked =
    row.expected_email_masked === null
      ? null
      : requireString(row.expected_email_masked, "correo enmascarado");

  if (
    row.is_valid &&
    (resultCode !== "valid" || !expectedEmailMasked)
  ) {
    throw new Error("La respuesta de validación no tiene el formato esperado.");
  }

  return {
    isValid: row.is_valid,
    resultCode,
    expectedEmailMasked,
  };
}

export async function consumeStudentInvitation(
  plainToken: string,
): Promise<StudentInvitationConsumption> {
  if (!isValidPlainToken(plainToken)) {
    return { success: false, resultCode: "invalid" };
  }

  const { data, error } = await supabase.rpc(
    "consume_student_invitation",
    { plain_token: plainToken },
  );

  if (error) {
    throw new Error("No fue posible activar la cuenta en este momento.");
  }

  const row = getSingleRow<ConsumeInvitationRow>(data);

  if (typeof row.success !== "boolean") {
    throw new Error("La respuesta de activación no tiene el formato esperado.");
  }

  return {
    success: row.success,
    resultCode: requireString(row.result_code, "resultado"),
  };
}

function normalizeSummary(row: InvitationSummaryRow): StudentInvitationSummary {
  const status = requireString(row.invitation_status, "estado");

  if (!INVITATION_STATUSES.has(status as StudentInvitationStatus)) {
    throw new Error("La invitación tiene un estado desconocido.");
  }

  return {
    id: requireUuid(row.id, "identificador"),
    memberId: requireNumber(row.member_id, "integrante"),
    memberFullName: requireString(row.member_full_name, "nombre"),
    emailNormalized: requireNormalizedEmail(row.email_normalized),
    expiresAt: requireDate(row.expires_at, "expiración"),
    usedAt: optionalDate(row.used_at, "uso"),
    revokedAt: optionalDate(row.revoked_at, "revocación"),
    createdAt: requireDate(row.created_at, "creación"),
    status: status as StudentInvitationStatus,
  };
}

function getSingleRow<T>(data: unknown): T {
  if (!Array.isArray(data) || data.length !== 1 || !data[0]) {
    throw new Error("La respuesta del servidor no tiene el formato esperado.");
  }

  return data[0] as T;
}

function assertPositiveInteger(value: number, message: string): void {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(message);
  }
}

function assertValidDuration(days: number): void {
  if (!Number.isInteger(days) || days < 1 || days > 30) {
    throw new Error("La vigencia debe ser de entre 1 y 30 días.");
  }
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`La respuesta no incluye un ${field} válido.`);
  }

  return value;
}

function requireNumber(value: unknown, field: string): number {
  const number = typeof value === "number" ? value : Number(value);

  if (!Number.isSafeInteger(number) || number <= 0) {
    throw new Error(`La respuesta no incluye un ${field} válido.`);
  }

  return number;
}

function requireDate(value: unknown, field: string): string {
  const date = requireString(value, field);

  if (Number.isNaN(Date.parse(date))) {
    throw new Error(`La respuesta no incluye una fecha de ${field} válida.`);
  }

  return date;
}

function optionalDate(value: unknown, field: string): string | null {
  return value === null ? null : requireDate(value, field);
}

function requireUuid(value: unknown, field: string): string {
  const uuid = requireString(value, field);

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid)) {
    throw new Error(`La respuesta no incluye un ${field} válido.`);
  }

  return uuid;
}

function requireNormalizedEmail(value: unknown): string {
  const email = requireString(value, "correo");

  if (
    email !== email.trim().toLowerCase() ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    throw new Error("La respuesta no incluye un correo normalizado válido.");
  }

  return email;
}

function requirePlainToken(value: unknown): string {
  const token = requireString(value, "token");

  if (!/^[A-Za-z0-9_-]{40,}$/.test(token)) {
    throw new Error("La respuesta no incluye un token válido.");
  }

  return token;
}

function isValidPlainToken(value: string): boolean {
  return /^[A-Za-z0-9_-]{40,512}$/.test(value);
}

function getRpcErrorMessage(message: string, action: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("no tienes permiso")) {
    return "No cuentas con permisos para administrar invitaciones.";
  }

  if (normalized.includes("sesión autenticada")) {
    return "Tu sesión ya no es válida. Inicia sesión nuevamente.";
  }

  if (normalized.includes("no está activo")) {
    return "El integrante no está activo.";
  }

  if (normalized.includes("no tiene un correo")) {
    return "El integrante no tiene un correo utilizable.";
  }

  if (normalized.includes("ya tiene una cuenta vinculada")) {
    return "El integrante ya tiene una cuenta vinculada.";
  }

  if (
    normalized.includes("rol privilegiado") ||
    normalized.includes("no identifica a un único integrante")
  ) {
    return "El integrante no cumple los requisitos para recibir una invitación.";
  }

  if (normalized.includes("no puede superar 30 días")) {
    return "La vigencia de la invitación no puede superar 30 días.";
  }

  return `No fue posible ${action}. Inténtalo nuevamente.`;
}
