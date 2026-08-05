"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { ArrowLeft, CheckCircle2, KeyRound, LoaderCircle } from "lucide-react";

import { supabase } from "@/lib/supabase";

type RequestState = "idle" | "submitting" | "sent" | "configuration_error";

export default function RecoverAccountPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<RequestState>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || state === "submitting") {
      return;
    }

    setState("submitting");

    const redirectUrl = new URL(
      "/restablecer-contrasena",
      window.location.origin,
    );

    const { error } = await supabase.auth.resetPasswordForEmail(
      normalizedEmail,
      { redirectTo: redirectUrl.toString() },
    );

    setEmail("");

    if (error && isConfigurationError(error.message)) {
      setState("configuration_error");
      return;
    }

    // La respuesta permanece neutral para no revelar si el correo existe.
    setState("sent");
  }

  return (
    <PublicShell>
      {state === "sent" ? (
        <>
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
          <h1 className="mt-5 text-2xl font-bold text-slate-950">Revisa tu correo</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Si existe una cuenta asociada, recibirás un enlace para establecer una contraseña nueva.
          </p>
          <LoginLink />
        </>
      ) : (
        <>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <KeyRound className="h-8 w-8" aria-hidden="true" />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-slate-950">Recuperar cuenta</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Ingresa el correo de tu cuenta y te enviaremos las instrucciones de recuperación.
          </p>

          {state === "configuration_error" ? (
            <div role="alert" className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              La recuperación no está configurada correctamente. Contacta al administrador de Vivace Suite.
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <label className="block text-left">
              <span className="mb-2 block font-semibold text-slate-700">Correo electrónico</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                autoFocus
                disabled={state === "submitting"}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
                placeholder="correo@ejemplo.com"
              />
            </label>

            <button
              type="submit"
              disabled={state === "submitting"}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {state === "submitting" ? (
                <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
              ) : null}
              {state === "submitting" ? "Enviando..." : "Enviar instrucciones"}
            </button>
          </form>

          <LoginLink />
        </>
      )}
    </PublicShell>
  );
}

function isConfigurationError(message: string): boolean {
  const normalized = message.toLowerCase();

  return [
    "redirect",
    "site url",
    "api key",
    "project",
    "configuration",
  ].some((fragment) => normalized.includes(fragment));
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

function LoginLink() {
  return (
    <Link
      href="/login"
      className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 text-sm font-semibold text-emerald-800 hover:text-emerald-950 hover:underline"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      Volver a iniciar sesión
    </Link>
  );
}
