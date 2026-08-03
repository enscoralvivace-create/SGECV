import { createClient } from "npm:@supabase/supabase-js@2.110.8";

const MAX_BODY_BYTES = 8 * 1024;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;
const RATE_LIMIT_REQUESTS = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

interface RegistrationRequest {
  plain_token: string;
  password: string;
  password_confirmation: string;
  redirect_origin: string;
}

interface InvitationResolutionRow {
  email_normalized?: unknown;
  account_state?: unknown;
}

type InvitationAccountState = "absent" | "unconfirmed" | "confirmed";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitEntries = new Map<string, RateLimitEntry>();

Deno.serve(async (request: Request): Promise<Response> => {
  const requestOrigin = request.headers.get("origin") ?? "";
  const allowedOrigins = getAllowedOrigins();
  const isAllowedOrigin = allowedOrigins.has(requestOrigin);

  if (request.method === "OPTIONS") {
    if (!isAllowedOrigin) {
      return jsonResponse(403, { ok: false, result_code: "origin_not_allowed" });
    }

    return new Response(null, {
      status: 204,
      headers: corsHeaders(requestOrigin),
    });
  }

  if (request.method !== "POST") {
    return jsonResponse(
      405,
      { ok: false, result_code: "method_not_allowed" },
      isAllowedOrigin ? requestOrigin : undefined,
    );
  }

  if (!isAllowedOrigin) {
    return jsonResponse(403, { ok: false, result_code: "origin_not_allowed" });
  }

  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return jsonResponse(
      415,
      { ok: false, result_code: "invalid_request" },
      requestOrigin,
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");

  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return jsonResponse(
      413,
      { ok: false, result_code: "request_too_large" },
      requestOrigin,
    );
  }

  const clientAddress = getClientAddress(request);

  if (!consumeRateLimit(clientAddress)) {
    return jsonResponse(
      429,
      { ok: false, result_code: "rate_limited" },
      requestOrigin,
    );
  }

  let rawBody: string;

  try {
    rawBody = await request.text();
  } catch {
    return jsonResponse(
      400,
      { ok: false, result_code: "invalid_request" },
      requestOrigin,
    );
  }

  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
    return jsonResponse(
      413,
      { ok: false, result_code: "request_too_large" },
      requestOrigin,
    );
  }

  let body: unknown;

  try {
    body = JSON.parse(rawBody) as RegistrationRequest;
  } catch {
    return jsonResponse(
      400,
      { ok: false, result_code: "invalid_request" },
      requestOrigin,
    );
  }

  const validationResult = validateRequest(body, requestOrigin);

  if (!validationResult.ok) {
    return jsonResponse(
      400,
      { ok: false, result_code: validationResult.resultCode },
      requestOrigin,
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const secretKey = Deno.env.get("VIVACE_SUPABASE_SECRET_KEY");
  const publishableKey = Deno.env.get("VIVACE_SUPABASE_PUBLISHABLE_KEY");

  if (!supabaseUrl || !secretKey || !publishableKey) {
    return jsonResponse(
      503,
      { ok: false, result_code: "temporarily_unavailable" },
      requestOrigin,
    );
  }

  let resolutionData: unknown;

  try {
    const resolutionResponse = await fetch(
      `${supabaseUrl}/rest/v1/rpc/resolve_student_invitation_account_state`,
      {
        method: "POST",
        headers: {
          apikey: secretKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          plain_token: validationResult.token,
        }),
      },
    );

    if (!resolutionResponse.ok) {
      return jsonResponse(
        503,
        { ok: false, result_code: "temporarily_unavailable" },
        requestOrigin,
      );
    }

    resolutionData = await resolutionResponse.json();
  } catch {
    return jsonResponse(
      503,
      { ok: false, result_code: "temporarily_unavailable" },
      requestOrigin,
    );
  }

  const resolution = getInvitationAccountResolution(resolutionData);

  if (!resolution) {
    return jsonResponse(
      400,
      { ok: false, result_code: "invalid_invitation" },
      requestOrigin,
    );
  }

  const confirmationUrl = new URL("/activar-cuenta", requestOrigin);
  confirmationUrl.searchParams.set("invitation", validationResult.token);

  const authClient = createClient(supabaseUrl, publishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
      flowType: "implicit",
    },
  });

  try {
    if (resolution.accountState === "absent") {
      const { data: signUpData, error: signUpError } =
        await authClient.auth.signUp({
          email: resolution.email,
          password: validationResult.password,
          options: {
            emailRedirectTo: confirmationUrl.toString(),
          },
        });

      if (signUpError) {
        return jsonResponse(
          503,
          { ok: false, result_code: "temporarily_unavailable" },
          requestOrigin,
        );
      }

      if (signUpData.session) {
        return jsonResponse(
          503,
          { ok: false, result_code: "email_confirmation_not_configured" },
          requestOrigin,
        );
      }
    } else if (resolution.accountState === "unconfirmed") {
      const { error: resendError } = await authClient.auth.resend({
        type: "signup",
        email: resolution.email,
        options: {
          emailRedirectTo: confirmationUrl.toString(),
        },
      });

      if (resendError) {
        return jsonResponse(
          503,
          { ok: false, result_code: "temporarily_unavailable" },
          requestOrigin,
        );
      }
    } else {
      const { error: resetError } = await authClient.auth.resetPasswordForEmail(
        resolution.email,
        {
          redirectTo: confirmationUrl.toString(),
        },
      );

      if (resetError) {
        return jsonResponse(
          503,
          { ok: false, result_code: "temporarily_unavailable" },
          requestOrigin,
        );
      }
    }
  } catch {
    return jsonResponse(
      503,
      { ok: false, result_code: "temporarily_unavailable" },
      requestOrigin,
    );
  }

  return jsonResponse(
    202,
    { ok: true, result_code: "confirmation_pending" },
    requestOrigin,
  );
});

function validateRequest(
  value: unknown,
  requestOrigin: string,
):
  | { ok: true; token: string; password: string }
  | { ok: false; resultCode: string } {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, resultCode: "invalid_request" };
  }

  const body = value as Record<string, unknown>;
  const allowedFields = new Set([
    "plain_token",
    "password",
    "password_confirmation",
    "redirect_origin",
  ]);

  if (Object.keys(body).some((field) => !allowedFields.has(field))) {
    return { ok: false, resultCode: "invalid_request" };
  }

  if (
    typeof body.plain_token !== "string" ||
    !/^[A-Za-z0-9_-]{40,512}$/.test(body.plain_token)
  ) {
    return { ok: false, resultCode: "invalid_invitation" };
  }

  if (
    typeof body.password !== "string" ||
    body.password.length < MIN_PASSWORD_LENGTH ||
    body.password.length > MAX_PASSWORD_LENGTH
  ) {
    return { ok: false, resultCode: "invalid_password" };
  }

  if (
    typeof body.password_confirmation !== "string" ||
    body.password_confirmation !== body.password
  ) {
    return { ok: false, resultCode: "password_mismatch" };
  }

  if (
    typeof body.redirect_origin !== "string" ||
    body.redirect_origin !== requestOrigin
  ) {
    return { ok: false, resultCode: "origin_not_allowed" };
  }

  return {
    ok: true,
    token: body.plain_token,
    password: body.password,
  };
}

function getAllowedOrigins(): Set<string> {
  return new Set(
    (Deno.env.get("ALLOWED_ORIGINS") ?? "")
      .split(",")
      .map((origin) => origin.trim().replace(/\/$/, ""))
      .filter((origin) => {
        try {
          return new URL(origin).origin === origin;
        } catch {
          return false;
        }
      }),
  );
}

function getInvitationAccountResolution(
  data: unknown,
): { email: string; accountState: InvitationAccountState } | null {
  if (!Array.isArray(data) || data.length !== 1) {
    return null;
  }

  const row = data[0] as InvitationResolutionRow | undefined;
  const email = row?.email_normalized;
  const accountState = row?.account_state;

  if (
    typeof email !== "string" ||
    email !== email.trim().toLowerCase() ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !isInvitationAccountState(accountState)
  ) {
    return null;
  }

  return { email, accountState };
}

function isInvitationAccountState(
  value: unknown,
): value is InvitationAccountState {
  return value === "absent" || value === "unconfirmed" || value === "confirmed";
}

function getClientAddress(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

function consumeRateLimit(key: string): boolean {
  const now = Date.now();

  if (rateLimitEntries.size > 10_000) {
    for (const [storedKey, entry] of rateLimitEntries) {
      if (entry.resetAt <= now) {
        rateLimitEntries.delete(storedKey);
      }
    }
  }

  const current = rateLimitEntries.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitEntries.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }

  if (current.count >= RATE_LIMIT_REQUESTS) {
    return false;
  }

  current.count += 1;
  return true;
}

function corsHeaders(origin: string): HeadersInit {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function jsonResponse(
  status: number,
  payload: { ok: boolean; result_code: string },
  origin?: string,
): Response {
  return Response.json(payload, {
    status,
    headers: {
      ...(origin ? corsHeaders(origin) : {}),
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
