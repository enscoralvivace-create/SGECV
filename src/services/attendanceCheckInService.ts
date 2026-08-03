import { supabase } from "@/lib/supabase";

type AttendanceCheckInStatus =
  | "present"
  | "late";

type AttendanceCheckInSuccessCode =
  | "registered"
  | "already_registered";

type AttendanceCheckInFailureCode =
  | "authentication_required"
  | "permission_denied"
  | "member_unavailable"
  | "session_unavailable"
  | "not_started"
  | "registration_closed"
  | "temporarily_unavailable";

type AttendanceCheckInResultCode =
  | AttendanceCheckInSuccessCode
  | AttendanceCheckInFailureCode;

interface AttendanceCheckInRpcRow {
  success: boolean;
  result_code: AttendanceCheckInResultCode;
  attendance_status: AttendanceCheckInStatus | null;
  checked_in_at: string | null;
  session_title: string | null;
  member_display_name: string | null;
}

export interface AttendanceCheckInResult {
  session: {
    title: string;
  };
  record: {
    status: AttendanceCheckInStatus;
    checked_in_at: string;
  };
  member: {
    name: string;
  };
  alreadyRegistered: boolean;
}

const RESULT_CODES: AttendanceCheckInResultCode[] = [
  "registered",
  "already_registered",
  "authentication_required",
  "permission_denied",
  "member_unavailable",
  "session_unavailable",
  "not_started",
  "registration_closed",
  "temporarily_unavailable",
];

function isNullableString(
  value: unknown,
): value is string | null {
  return value === null || typeof value === "string";
}

function isRpcRow(
  value: unknown,
): value is AttendanceCheckInRpcRow {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return false;
  }

  const row = value as Record<string, unknown>;

  return (
    typeof row.success === "boolean" &&
    typeof row.result_code === "string" &&
    RESULT_CODES.includes(
      row.result_code as AttendanceCheckInResultCode,
    ) &&
    (
      row.attendance_status === null ||
      row.attendance_status === "present" ||
      row.attendance_status === "late"
    ) &&
    isNullableString(row.checked_in_at) &&
    isNullableString(row.session_title) &&
    isNullableString(row.member_display_name)
  );
}

function getFailureMessage(
  resultCode: AttendanceCheckInFailureCode,
): string {
  switch (resultCode) {
    case "authentication_required":
      return "Debes iniciar sesión para registrar tu asistencia.";

    case "permission_denied":
      return "Tu cuenta no tiene permiso para registrar asistencia.";

    case "member_unavailable":
      return "Tu cuenta no tiene un integrante activo vinculado.";

    case "session_unavailable":
      return "El código QR no corresponde a una sesión disponible.";

    case "not_started":
      return "El registro de asistencia todavía no está disponible.";

    case "registration_closed":
      return "El periodo para registrar asistencia ya terminó.";

    case "temporarily_unavailable":
      return "No fue posible registrar tu asistencia. Inténtalo nuevamente.";
  }
}

function isSuccessCode(
  resultCode: AttendanceCheckInResultCode,
): resultCode is AttendanceCheckInSuccessCode {
  return (
    resultCode === "registered" ||
    resultCode === "already_registered"
  );
}

function isFailureCode(
  resultCode: AttendanceCheckInResultCode,
): resultCode is AttendanceCheckInFailureCode {
  return !isSuccessCode(resultCode);
}

function hasRequiredSuccessData(
  row: AttendanceCheckInRpcRow,
): row is AttendanceCheckInRpcRow & {
  attendance_status: AttendanceCheckInStatus;
  checked_in_at: string;
  session_title: string;
  member_display_name: string;
} {
  return (
    row.success &&
    isSuccessCode(row.result_code) &&
    row.attendance_status !== null &&
    typeof row.checked_in_at === "string" &&
    row.checked_in_at.trim() !== "" &&
    typeof row.session_title === "string" &&
    row.session_title.trim() !== "" &&
    typeof row.member_display_name === "string" &&
    row.member_display_name.trim() !== ""
  );
}

const INVALID_RESPONSE_MESSAGE =
  "No fue posible registrar tu asistencia. Inténtalo nuevamente.";

export async function registerAttendanceByToken(
  token: string,
): Promise<AttendanceCheckInResult> {
  const { data, error } = await supabase.rpc(
    "register_attendance_by_qr",
    {
      qr_token: token,
    },
  );

  if (error) {
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }

  if (
    !Array.isArray(data) ||
    data.length !== 1 ||
    !isRpcRow(data[0])
  ) {
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }

  const row = data[0];

  if (!row.success) {
    if (!isFailureCode(row.result_code)) {
      throw new Error(INVALID_RESPONSE_MESSAGE);
    }

    throw new Error(
      getFailureMessage(row.result_code),
    );
  }

  if (!hasRequiredSuccessData(row)) {
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }

  return {
    session: {
      title: row.session_title,
    },
    record: {
      status: row.attendance_status,
      checked_in_at: row.checked_in_at,
    },
    member: {
      name: row.member_display_name,
    },
    alreadyRegistered:
      row.result_code === "already_registered",
  };
}
