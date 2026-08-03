"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  LoaderCircle,
  LockKeyhole,
  MailCheck,
  TriangleAlert,
} from "lucide-react";

import { validateStudentInvitation } from "@/services/studentInvitationService";
import {
  registerStudentInvitationAccount,
  type StudentInvitationRegistrationCode,
} from "@/services/studentInvitationRegistrationService";

type ValidationState =
  | { status: "checking" }
  | { status: "valid"; maskedEmail: string }
  | { status: "invalid" }
  | { status: "error" };

export default function StudentInvitationRegistrationPage() {
  const params = useParams<{ token: string | string[] }>();
  const token = typeof params.token === "string" ? params.token : "";
  const lastValidationToken = useRef("");
  const [validation, setValidation] = useState<ValidationState>({
    status: "checking",
  });
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (lastValidationToken.current === token) {
      return;
    }

    lastValidationToken.current = token;
    let isCurrent = true;

    async function validateInvitation() {
      setValidation({ status: "checking" });
      setPassword("");
      setPasswordConfirmation("");
      setSubmitError("");

      try {
        const result = await validateStudentInvitation(token);

        if (!isCurrent) {
          return;
        }

        if (result.isValid && result.expectedEmailMasked) {
          setValidation({
            status: "valid",
            maskedEmail: result.expectedEmailMasked,
          });
        } else {
          setValidation({ status: "invalid" });
        }
      } catch {
        if (isCurrent) {
          setValidation({ status: "error" });
        }
      }
    }

    void validateInvitation();

    return () => {
      isCurrent = false;
    };
  }, [token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");

    if (validation.status !== "valid") {
      setSubmitError("La invitación ya no está disponible.");
      return;
    }

    if (password.length < 8 || password.length > 128) {
      setSubmitError("La contraseña debe tener entre 8 y 128 caracteres.");
      return;
    }

    if (password !== passwordConfirmation) {
      setSubmitError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setIsSubmitting(true);

      const latestValidation = await validateStudentInvitation(token);

      if (!latestValidation.isValid) {
        setValidation({ status: "invalid" });
        setPassword("");
        setPasswordConfirmation("");
        return;
      }

      const result = await registerStudentInvitationAccount({
        plainToken: token,
        password,
        passwordConfirmation,
        redirectOrigin: window.location.origin,
      });

      setPassword("");
      setPasswordConfirmation("");

      if (result.ok && result.resultCode === "confirmation_pending") {
        window.history.replaceState({}, "", "/registro");
        setIsComplete(true);
        return;
      }

      if (result.resultCode === "invalid_invitation") {
        setValidation({ status: "invalid" });
        return;
      }

      setSubmitError(getRegistrationError(result.resultCode));
    } catch (error: unknown) {
      const responseContext = getResponseContext(error);

      console.error(
        "[RC-3.3.3] Error al iniciar registro por invitación",
        {
          name: error instanceof Error ? error.name : undefined,
          type:
            error instanceof Error
              ? error.constructor.name
              : typeof error,
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          responseContext,
          error: sanitizeRegistrationError(error),
        },
      );

      setPassword("");
      setPasswordConfirmation("");
      setSubmitError("No fue posible iniciar el registro. Inténtalo nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isComplete) {
    return (
      <PublicCard>
        <MailCheck className="mx-auto h-14 w-14 text-emerald-600" />
        <h1 className="mt-5 text-2xl font-bold text-slate-950">Revisa tu correo</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Si la solicitud puede procesarse, recibirás un enlace para confirmar tu correo y completar la activación de tu cuenta.
        </p>
        <LoginLink />
      </PublicCard>
    );
  }

  if (validation.status === "checking") {
    return (
      <PublicCard>
        <LoaderCircle className="mx-auto h-12 w-12 animate-spin text-indigo-600" />
        <h1 className="mt-5 text-2xl font-bold text-slate-950">Verificando invitación</h1>
        <p className="mt-3 text-sm text-slate-600">Espera un momento.</p>
      </PublicCard>
    );
  }

  if (validation.status === "invalid") {
    return (
      <PublicCard>
        <TriangleAlert className="mx-auto h-12 w-12 text-amber-600" />
        <h1 className="mt-5 text-2xl font-bold text-slate-950">Invitación inválida</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Esta invitación no está disponible. Solicita una nueva al administrador de Vivace Suite.
        </p>
        <LoginLink />
      </PublicCard>
    );
  }

  if (validation.status === "error") {
    return (
      <PublicCard>
        <TriangleAlert className="mx-auto h-12 w-12 text-red-600" />
        <h1 className="mt-5 text-2xl font-bold text-slate-950">Error temporal</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          No fue posible verificar la invitación. Inténtalo nuevamente más tarde.
        </p>
        <LoginLink />
      </PublicCard>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <section className="mx-auto w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Vivace Suite</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Invitación válida</h1>
          <p className="mt-3 text-sm text-slate-600">Configura una contraseña para iniciar tu registro.</p>
        </div>

        <div className="mt-6 rounded-2xl bg-indigo-50 p-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Correo esperado</p>
          <p className="mt-1 font-semibold text-indigo-950">{validation.maskedEmail}</p>
        </div>

        {submitError ? (
          <div role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {submitError}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Contraseña</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} maxLength={128} autoComplete="new-password" disabled={isSubmitting} required className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100" />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Confirmar contraseña</span>
            <input type="password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} minLength={8} maxLength={128} autoComplete="new-password" disabled={isSubmitting} required className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100" />
          </label>

          <button type="submit" disabled={isSubmitting} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
            {isSubmitting ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <LockKeyhole className="h-5 w-5" />}
            {isSubmitting ? "Preparando cuenta..." : "Crear mi cuenta"}
          </button>
        </form>

        <LoginLink />
      </section>
    </main>
  );
}

function PublicCard({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Vivace Suite</p>
        {children}
      </section>
    </main>
  );
}

function LoginLink() {
  return (
    <p className="mt-7 text-center text-sm text-slate-600">
      ¿Ya tienes una cuenta?{" "}
      <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">Inicia sesión</Link>
    </p>
  );
}

function getRegistrationError(code: StudentInvitationRegistrationCode): string {
  switch (code) {
    case "invalid_password":
    case "password_rejected":
      return "La contraseña no cumple los requisitos de seguridad.";
    case "password_mismatch":
      return "Las contraseñas no coinciden.";
    case "rate_limited":
      return "Se realizaron demasiados intentos. Espera unos minutos.";
    case "email_confirmation_not_configured":
      return "La confirmación de correo no está disponible. Contacta al administrador.";
    default:
      return "No fue posible iniciar el registro. Inténtalo nuevamente.";
  }
}

function getResponseContext(error: unknown) {
  if (
    !error ||
    typeof error !== "object" ||
    !("context" in error) ||
    !(error.context instanceof Response)
  ) {
    return undefined;
  }

  return {
    status: error.context.status,
    statusText: error.context.statusText,
    url: error.context.url,
  };
}

function sanitizeRegistrationError(error: unknown): unknown {
  if (!error || typeof error !== "object") {
    return error;
  }

  const sanitized = Object.fromEntries(
    Object.entries(error).map(([key, value]) => {
      if (/token|password|email|key|secret|body|authorization|apikey/i.test(key)) {
        return [key, "[REDACTED]"];
      }

      if (value instanceof Response) {
        return [
          key,
          {
            status: value.status,
            statusText: value.statusText,
            url: value.url,
          },
        ];
      }

      return [key, value];
    }),
  );

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...sanitized,
    };
  }

  return sanitized;
}
