import { supabase } from "@/lib/supabase";

interface RegisterStudentInvitationInput {
  plainToken: string;
  password: string;
  passwordConfirmation: string;
  redirectOrigin: string;
}

export type StudentInvitationRegistrationCode =
  | "confirmation_pending"
  | "invalid_invitation"
  | "invalid_password"
  | "password_mismatch"
  | "password_rejected"
  | "rate_limited"
  | "temporarily_unavailable"
  | "email_confirmation_not_configured";

export interface StudentInvitationRegistrationResult {
  ok: boolean;
  resultCode: StudentInvitationRegistrationCode;
}

interface FunctionResponse {
  ok?: unknown;
  result_code?: unknown;
}

const RESULT_CODES = new Set<StudentInvitationRegistrationCode>([
  "confirmation_pending",
  "invalid_invitation",
  "invalid_password",
  "password_mismatch",
  "password_rejected",
  "rate_limited",
  "temporarily_unavailable",
  "email_confirmation_not_configured",
]);

export async function registerStudentInvitationAccount(
  input: RegisterStudentInvitationInput,
): Promise<StudentInvitationRegistrationResult> {
  const { data, error } = await supabase.functions.invoke(
    "register-student-invitation",
    {
      body: {
        plain_token: input.plainToken,
        password: input.password,
        password_confirmation: input.passwordConfirmation,
        redirect_origin: input.redirectOrigin,
      },
    },
  );

  let response = normalizeResponse(data);

  if (!response && error) {
    response = await readErrorResponse(error);
  }

  if (response) {
    return response;
  }

  return {
    ok: false,
    resultCode: "temporarily_unavailable",
  };
}

function normalizeResponse(
  value: unknown,
): StudentInvitationRegistrationResult | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const response = value as FunctionResponse;

  if (
    typeof response.ok !== "boolean" ||
    typeof response.result_code !== "string" ||
    !RESULT_CODES.has(
      response.result_code as StudentInvitationRegistrationCode,
    )
  ) {
    return null;
  }

  return {
    ok: response.ok,
    resultCode:
      response.result_code as StudentInvitationRegistrationCode,
  };
}

async function readErrorResponse(
  error: unknown,
): Promise<StudentInvitationRegistrationResult | null> {
  if (
    !error ||
    typeof error !== "object" ||
    !("context" in error) ||
    !(error.context instanceof Response)
  ) {
    return null;
  }

  try {
    return normalizeResponse(
      await error.context.clone().json(),
    );
  } catch {
    return null;
  }
}
