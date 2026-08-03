"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  CircleUserRound,
  LoaderCircle,
  LockKeyhole,
  TriangleAlert,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { consumeStudentInvitation } from "@/services/studentInvitationService";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;
const SESSION_TIMEOUT_MS = 15_000;

type ActivationState =
  | "checking_email"
  | "password_recovery"
  | "activating"
  | "activation_retry"
  | "activated"
  | "invalid"
  | "already_linked"
  | "error";

interface AuthFlow {
  session: Session;
  isPasswordRecovery: boolean;
}

type AuthUrlClassification =
  | "recovery"
  | "confirmation"
  | "ambiguous"
  | "none"
  | "error";

interface AuthUrlEvidence {
  classification: AuthUrlClassification;
}

export default function ActivateAccountPage() {
  const isMounted = useRef(false);
  const invitationToken = useRef("");
  const authUrlEvidence = useRef<AuthUrlEvidence | null>(null);
  const activationStarted = useRef(false);
  const passwordSubmissionStarted = useRef(false);
  const [state, setState] = useState<ActivationState>("checking_email");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  useEffect(() => {
    isMounted.current = true;
    const abortController = new AbortController();

    async function initializeActivation() {
      if (!authUrlEvidence.current) {
        const currentUrl = new URL(window.location.href);
        invitationToken.current =
          currentUrl.searchParams.get("invitation") ?? "";
        authUrlEvidence.current = getAuthUrlEvidence(currentUrl);
        removeInvitationFromUrl(currentUrl);
      }

      if (!isValidInvitationToken(invitationToken.current)) {
        clearActivationUrl();
        setCurrentState("invalid");
        return;
      }

      try {
        const authFlow = await waitForAuthFlow(
          authUrlEvidence.current,
          abortController.signal,
        );

        if (!isMounted.current || abortController.signal.aborted) {
          return;
        }

        if (!authFlow.session.user.email_confirmed_at) {
          throw new Error("Email confirmation is required.");
        }

        clearActivationUrl();

        if (authFlow.isPasswordRecovery) {
          setCurrentState("password_recovery");
          return;
        }

        await activateInvitation();
      } catch {
        clearActivationUrl();
        if (!abortController.signal.aborted) {
          setCurrentState("error");
        }
      }
    }

    async function activateInvitation() {
      if (!isMounted.current || activationStarted.current) {
        return;
      }

      activationStarted.current = true;
      setCurrentState("activating");

      try {
        const result = await consumeStudentInvitation(
          invitationToken.current,
        );

        if (!isMounted.current) {
          return;
        }

        setState(getConsumptionState(result));
      } catch {
        setCurrentState("error");
      }
    }

    function setCurrentState(nextState: ActivationState) {
      if (isMounted.current) {
        setState(nextState);
      }
    }

    void initializeActivation();

    return () => {
      isMounted.current = false;
      abortController.abort();
    };
  }, []);

  async function handlePasswordRecovery(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      state !== "password_recovery" ||
      passwordSubmissionStarted.current ||
      isSubmittingPassword
    ) {
      return;
    }

    setPasswordError("");

    if (
      password.length < MIN_PASSWORD_LENGTH ||
      password.length > MAX_PASSWORD_LENGTH
    ) {
      setPasswordError("La contraseña debe tener entre 8 y 128 caracteres.");
      return;
    }

    if (password !== passwordConfirmation) {
      setPasswordError("Las contraseñas no coinciden.");
      return;
    }

    passwordSubmissionStarted.current = true;
    setIsSubmittingPassword(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        throw updateError;
      }

      if (!isMounted.current) {
        return;
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw sessionError ?? new Error("Authenticated session is required.");
      }

      if (!isMounted.current) {
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (
        userError ||
        !user ||
        user.id !== session.user.id ||
        !user.email_confirmed_at
      ) {
        throw userError ?? new Error("Confirmed user is required.");
      }

      setPassword("");
      setPasswordConfirmation("");

      if (!isMounted.current || activationStarted.current) {
        return;
      }

      activationStarted.current = true;
      setState("activating");

      try {
        const result = await consumeStudentInvitation(invitationToken.current);

        if (isMounted.current) {
          setState(getConsumptionState(result));
        }
      } catch {
        activationStarted.current = false;
        if (isMounted.current) {
          setState("activation_retry");
        }
      }
    } catch {
      setPassword("");
      setPasswordConfirmation("");
      passwordSubmissionStarted.current = false;
      setIsSubmittingPassword(false);
      if (isMounted.current) {
        setState("password_recovery");
        setPasswordError(
          "No fue posible actualizar la contraseña. Solicita un nuevo enlace o inicia sesión.",
        );
      }
    }
  }

  async function handleActivationRetry() {
    if (
      state !== "activation_retry" ||
      activationStarted.current ||
      !isMounted.current
    ) {
      return;
    }

    activationStarted.current = true;
    setState("activating");

    try {
      const result = await consumeStudentInvitation(invitationToken.current);

      if (isMounted.current) {
        setState(getConsumptionState(result));
      }
    } catch {
      activationStarted.current = false;
      if (isMounted.current) {
        setState("activation_retry");
      }
    }
  }

  if (state === "checking_email" || state === "activating") {
    return (
      <ActivationCard>
        <LoaderCircle className="mx-auto h-12 w-12 animate-spin text-indigo-600" />
        <h1 className="mt-5 text-2xl font-bold text-slate-950">
          {state === "checking_email" ? "Verificando correo" : "Activando cuenta"}
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          Espera un momento mientras completamos el proceso.
        </p>
      </ActivationCard>
    );
  }

  if (state === "password_recovery") {
    return (
      <ActivationCard>
        <LockKeyhole className="mx-auto h-14 w-14 text-indigo-600" />
        <h1 className="mt-5 text-2xl font-bold text-slate-950">
          Actualiza tu contraseña
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Define una contraseña nueva para recuperar el acceso y completar la
          activación.
        </p>

        {passwordError ? (
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-left text-sm text-red-700"
          >
            {passwordError}
          </div>
        ) : null}

        <form onSubmit={handlePasswordRecovery} className="mt-7 space-y-5 text-left">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Nueva contraseña
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={MIN_PASSWORD_LENGTH}
              maxLength={MAX_PASSWORD_LENGTH}
              autoComplete="new-password"
              disabled={isSubmittingPassword}
              required
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Confirmar contraseña
            </span>
            <input
              type="password"
              value={passwordConfirmation}
              onChange={(event) => setPasswordConfirmation(event.target.value)}
              minLength={MIN_PASSWORD_LENGTH}
              maxLength={MAX_PASSWORD_LENGTH}
              autoComplete="new-password"
              disabled={isSubmittingPassword}
              required
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmittingPassword}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmittingPassword ? (
              <LoaderCircle className="h-5 w-5 animate-spin" />
            ) : (
              <LockKeyhole className="h-5 w-5" />
            )}
            {isSubmittingPassword
              ? "Actualizando contraseña..."
              : "Actualizar y activar"}
          </button>
        </form>
      </ActivationCard>
    );
  }

  if (state === "activation_retry") {
    return (
      <ActivationCard>
        <TriangleAlert className="mx-auto h-12 w-12 text-amber-600" />
        <h1 className="mt-5 text-2xl font-bold text-slate-950">
          No fue posible completar la activación
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Tu contraseña fue actualizada, pero falta completar la vinculación.
          Puedes intentarlo nuevamente de forma segura.
        </p>
        <button
          type="button"
          onClick={() => void handleActivationRetry()}
          className="mt-7 inline-flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
        >
          Reintentar activación
        </button>
        <LoginLink />
      </ActivationCard>
    );
  }

  if (state === "activated") {
    return (
      <ActivationCard>
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
        <h1 className="mt-5 text-2xl font-bold text-slate-950">
          Cuenta activada
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Tu cuenta quedó vinculada correctamente. Ya puedes continuar a Vivace
          Suite.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
        >
          Continuar
        </Link>
      </ActivationCard>
    );
  }

  if (state === "already_linked") {
    return (
      <ActivationCard>
        <CircleUserRound className="mx-auto h-14 w-14 text-sky-600" />
        <h1 className="mt-5 text-2xl font-bold text-slate-950">
          Cuenta ya vinculada
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Esta cuenta ya fue activada o está vinculada. Intenta iniciar sesión.
        </p>
        <LoginLink />
      </ActivationCard>
    );
  }

  if (state === "invalid") {
    return (
      <ActivationCard>
        <TriangleAlert className="mx-auto h-12 w-12 text-amber-600" />
        <h1 className="mt-5 text-2xl font-bold text-slate-950">
          Invitación inválida
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          La invitación ya no está disponible. Solicita asistencia al
          administrador.
        </p>
        <LoginLink />
      </ActivationCard>
    );
  }

  return (
    <ActivationCard>
      <TriangleAlert className="mx-auto h-12 w-12 text-red-600" />
      <h1 className="mt-5 text-2xl font-bold text-slate-950">
        No fue posible activar la cuenta
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        El enlace no es válido, expiró o no fue posible verificar la sesión.
        Solicita un nuevo enlace o inicia sesión.
      </p>
      <LoginLink />
    </ActivationCard>
  );
}

function ActivationCard({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
          Vivace Suite
        </p>
        {children}
      </section>
    </main>
  );
}

function LoginLink() {
  return (
    <Link
      href="/login"
      className="mt-7 inline-flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
    >
      Ir a iniciar sesión
    </Link>
  );
}

async function waitForAuthFlow(
  urlEvidence: AuthUrlEvidence,
  abortSignal: AbortSignal,
): Promise<AuthFlow> {
  return await new Promise<AuthFlow>((resolve, reject) => {
    let isSettled = false;
    let authSubscription: { unsubscribe: () => void } | null = null;

    const cleanup = () => {
      window.clearTimeout(sessionTimeout);
      abortSignal.removeEventListener("abort", handleAbort);
      authSubscription?.unsubscribe();
    };

    const finish = (authFlow: AuthFlow) => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      cleanup();
      resolve(authFlow);
    };

    const fail = (error: unknown) => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      cleanup();
      reject(error);
    };

    const classifySession = (
      session: Session,
      event?: AuthChangeEvent,
    ) => {
      if (
        event === "PASSWORD_RECOVERY" ||
        urlEvidence.classification === "recovery" ||
        urlEvidence.classification === "ambiguous"
      ) {
        finish({
          session,
          isPasswordRecovery: true,
        });
        return;
      }

      if (urlEvidence.classification === "error") {
        fail(new Error("The authentication callback is invalid."));
        return;
      }

      finish({
        session,
        isPasswordRecovery: false,
      });
    };

    const handleAbort = () => {
      fail(new DOMException("Activation was cancelled.", "AbortError"));
    };

    const sessionTimeout = window.setTimeout(() => {
      fail(new Error("The authenticated session was not established."));
    }, SESSION_TIMEOUT_MS);

    abortSignal.addEventListener("abort", handleAbort, { once: true });

    if (abortSignal.aborted) {
      handleAbort();
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, nextSession: Session | null) => {
        if (!nextSession) {
          return;
        }

        classifySession(nextSession, event);
      },
    );

    authSubscription = subscription;

    if (isSettled) {
      authSubscription.unsubscribe();
    }

    void supabase.auth.getSession().then(
      ({ data: { session }, error }) => {
        if (error) {
          fail(error);
          return;
        }

        if (!session) {
          return;
        }

        classifySession(session);
      },
      fail,
    );
  });
}

function getAuthUrlEvidence(url: URL): AuthUrlEvidence {
  const hashParameters = new URLSearchParams(url.hash.replace(/^#/, ""));
  const flowType = (
    hashParameters.get("type") ??
    url.searchParams.get("type") ??
    ""
  ).toLowerCase();
  const authParameterNames = [
    "access_token",
    "refresh_token",
    "expires_in",
    "expires_at",
    "token_type",
    "code",
    "error",
    "error_code",
    "error_description",
  ];
  const hasAuthParameters = authParameterNames.some(
    (parameter) =>
      hashParameters.has(parameter) || url.searchParams.has(parameter),
  );
  const hasAuthError =
    hashParameters.has("error") ||
    hashParameters.has("error_code") ||
    url.searchParams.has("error") ||
    url.searchParams.has("error_code");

  if (hasAuthError) {
    return { classification: "error" };
  }

  if (flowType === "recovery") {
    return { classification: "recovery" };
  }

  if (flowType === "signup") {
    return { classification: "confirmation" };
  }

  if (hasAuthParameters || flowType !== "") {
    return { classification: "ambiguous" };
  }

  return { classification: "none" };
}

function getConsumptionState(result: {
  success: boolean;
  resultCode: string;
}): ActivationState {
  if (result.success && result.resultCode === "activated") {
    return "activated";
  }

  if (
    result.resultCode === "already_activated" ||
    result.resultCode === "already_linked"
  ) {
    return "already_linked";
  }

  if (
    [
      "invalid",
      "used",
      "revoked",
      "expired",
      "unavailable",
      "member_inactive",
      "role_not_eligible",
    ].includes(result.resultCode)
  ) {
    return "invalid";
  }

  return "error";
}

function isValidInvitationToken(value: string): boolean {
  return /^[A-Za-z0-9_-]{40,512}$/.test(value);
}

function removeInvitationFromUrl(url: URL): void {
  url.searchParams.delete("invitation");
  window.history.replaceState(
    {},
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );
}

function clearActivationUrl(): void {
  window.history.replaceState({}, "", window.location.pathname);
}
