"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { KeyRound, LoaderCircle, TriangleAlert } from "lucide-react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;
const SESSION_TIMEOUT_MS = 15_000;

type RecoveryState = "checking" | "ready" | "invalid" | "saving";

export default function ResetPasswordPage() {
  const router = useRouter();
  const mountedRef = useRef(false);
  const recoverySessionRef = useRef<Session | null>(null);
  const [state, setState] = useState<RecoveryState>("checking");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    mountedRef.current = true;
    const abortController = new AbortController();
    const currentUrl = new URL(window.location.href);
    const callback = getAuthCallback(currentUrl);

    establishRecoverySession(
      callback,
      abortController.signal,
    )
      .then((session) => {
        if (!mountedRef.current || abortController.signal.aborted) {
          return;
        }

        recoverySessionRef.current = session;
        clearSensitiveUrl();
        setState("ready");
      })
      .catch(() => {
        if (mountedRef.current && !abortController.signal.aborted) {
          clearSensitiveUrl();
          setState("invalid");
        }
      });

    return () => {
      mountedRef.current = false;
      abortController.abort();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (state !== "ready" || !recoverySessionRef.current) {
      return;
    }

    if (
      password.length < MIN_PASSWORD_LENGTH ||
      password.length > MAX_PASSWORD_LENGTH
    ) {
      setErrorMessage("La contraseña debe tener entre 8 y 128 caracteres.");
      return;
    }

    if (password !== passwordConfirmation) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }

    setState("saving");

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      if (mountedRef.current) {
        setPassword("");
        setPasswordConfirmation("");
        setErrorMessage(getPasswordUpdateError(error.message));
        setState("ready");
      }
      return;
    }

    await supabase.auth.signOut({ scope: "local" });

    if (mountedRef.current) {
      recoverySessionRef.current = null;
      router.replace("/login?passwordUpdated=1");
      router.refresh();
    }
  }

  if (state === "checking") {
    return (
      <PublicShell>
        <LoaderCircle className="mx-auto h-12 w-12 animate-spin text-emerald-700" aria-hidden="true" />
        <h1 className="mt-5 text-2xl font-bold text-slate-950">Validando enlace</h1>
        <p className="mt-3 text-sm text-slate-600">Espera un momento.</p>
      </PublicShell>
    );
  }

  if (state === "invalid") {
    return (
      <PublicShell>
        <TriangleAlert className="mx-auto h-14 w-14 text-amber-600" aria-hidden="true" />
        <h1 className="mt-5 text-2xl font-bold text-slate-950">Enlace no disponible</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          El enlace es inválido, expiró o ya fue utilizado. Solicita uno nuevo para continuar.
        </p>
        <Link
          href="/recuperar-cuenta"
          className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-emerald-800 px-5 py-3 font-semibold text-white hover:bg-emerald-900"
        >
          Solicitar otro enlace
        </Link>
        <Link href="/login" className="mt-5 inline-block text-sm font-semibold text-emerald-800 hover:underline">
          Volver a iniciar sesión
        </Link>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
        <KeyRound className="h-8 w-8" aria-hidden="true" />
      </div>
      <h1 className="mt-5 text-2xl font-bold text-slate-950">Nueva contraseña</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Define una contraseña nueva para volver a ingresar a Vivace Suite.
      </p>

      {errorMessage ? (
        <div role="alert" className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-7 space-y-5 text-left">
        <PasswordField
          label="Nueva contraseña"
          value={password}
          autoComplete="new-password"
          disabled={state === "saving"}
          onChange={setPassword}
        />
        <PasswordField
          label="Confirmar contraseña"
          value={passwordConfirmation}
          autoComplete="new-password"
          disabled={state === "saving"}
          onChange={setPasswordConfirmation}
        />
        <p className="text-xs leading-5 text-slate-500">Debe tener entre 8 y 128 caracteres.</p>

        <button
          type="submit"
          disabled={state === "saving"}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state === "saving" ? <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" /> : null}
          {state === "saving" ? "Actualizando..." : "Actualizar contraseña"}
        </button>
      </form>
    </PublicShell>
  );
}

function PasswordField({
  label,
  value,
  autoComplete,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  autoComplete: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-semibold text-slate-700">{label}</span>
      <input
        type="password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        minLength={MIN_PASSWORD_LENGTH}
        maxLength={MAX_PASSWORD_LENGTH}
        autoComplete={autoComplete}
        disabled={disabled}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
      />
    </label>
  );
}

interface AuthCallback {
  code: string;
  accessToken: string;
  refreshToken: string;
  hasError: boolean;
}

function getAuthCallback(url: URL): AuthCallback {
  const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
  const hasError = Boolean(
    hash.get("error") ||
      hash.get("error_code") ||
      url.searchParams.get("error") ||
      url.searchParams.get("error_code"),
  );

  return {
    code: url.searchParams.get("code") ?? "",
    accessToken: hash.get("access_token") ?? "",
    refreshToken: hash.get("refresh_token") ?? "",
    hasError,
  };
}

async function establishRecoverySession(
  callback: AuthCallback,
  abortSignal: AbortSignal,
): Promise<Session> {
  return await new Promise<Session>((resolve, reject) => {
    let settled = false;
    let subscription: { unsubscribe: () => void } | null = null;

    const cleanup = () => {
      window.clearTimeout(timeout);
      abortSignal.removeEventListener("abort", handleAbort);
      subscription?.unsubscribe();
    };
    const finish = (session: Session) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(session);
    };
    const fail = () => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error("Recovery session unavailable."));
    };
    const handleAbort = () => fail();
    const timeout = window.setTimeout(fail, SESSION_TIMEOUT_MS);

    abortSignal.addEventListener("abort", handleAbort, { once: true });

    const { data } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (event === "PASSWORD_RECOVERY" && session) {
          finish(session);
        }
      },
    );
    subscription = data.subscription;

    if (callback.hasError) {
      fail();
      return;
    }

    if (callback.code) {
      void supabase.auth
        .exchangeCodeForSession(callback.code)
        .then(({ data: exchangeData, error }) => {
          const redirectType = (
            exchangeData as typeof exchangeData & {
              redirectType?: string | null;
            }
          ).redirectType;

          if (
            !error &&
            exchangeData.session &&
            redirectType === "recovery"
          ) {
            finish(exchangeData.session);
          }
          // Si la inicialización automática ya intercambió el código,
          // PASSWORD_RECOVERY acreditará el flujo antes del timeout.
        })
        .catch(() => undefined);
    }

    if (callback.accessToken && callback.refreshToken) {
      void supabase.auth.getSession().then(({ data: sessionData, error }) => {
        if (
          !error &&
          sessionData.session?.access_token === callback.accessToken
        ) {
          finish(sessionData.session);
        }
      }).catch(() => undefined);
    }
  });
}

function clearSensitiveUrl(): void {
  window.history.replaceState({}, "", window.location.pathname);
}

function getPasswordUpdateError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("password") && (normalized.includes("weak") || normalized.includes("characters"))) {
    return "La contraseña no cumple los requisitos de seguridad.";
  }

  if (normalized.includes("expired") || normalized.includes("session") || normalized.includes("jwt")) {
    return "La sesión de recuperación expiró. Solicita un enlace nuevo.";
  }

  return "No fue posible actualizar la contraseña. Solicita un enlace nuevo e inténtalo otra vez.";
}

function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
        {children}
      </section>
    </main>
  );
}
