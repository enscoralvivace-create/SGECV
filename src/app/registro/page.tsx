"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  CheckCircle2,
  LoaderCircle,
  TriangleAlert,
  UserPlus,
} from "lucide-react";

import { registerMemberAccount } from "@/services/registrationService";

const VOICE_OPTIONS = [
  "Soprano",
  "Mezzosoprano",
  "Contralto",
  "Tenor",
  "Barítono",
  "Bajo",
  "Sin asignar",
];

export default function RegistrationPage() {
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [voice, setVoice] = useState("Sin asignar");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [registeredEmail, setRegisteredEmail] =
    useState<string | null>(null);

  const [requiresEmailConfirmation, setRequiresEmailConfirmation] =
    useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("Escribe tu nombre.");
      return;
    }

    if (!lastName.trim()) {
      setErrorMessage("Escribe tus apellidos.");
      return;
    }

    if (!email.trim()) {
      setErrorMessage("Escribe tu correo electrónico.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage(
        "La contraseña debe tener al menos 8 caracteres.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      const result = await registerMemberAccount({
        name,
        lastName,
        email,
        phone,
        voice,
        password,
      });

      setRegisteredEmail(result.email);
      setRequiresEmailConfirmation(
        result.requiresEmailConfirmation,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible crear la cuenta.";

      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }

  if (registeredEmail) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
        <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Vivace Suite
          </p>

          <h1 className="mt-2 text-2xl font-bold text-slate-950">
            Cuenta creada
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Tu registro fue agregado a la plataforma con el correo:
          </p>

          <p className="mt-2 break-all font-semibold text-slate-900">
            {registeredEmail}
          </p>

          {requiresEmailConfirmation ? (
            <div className="mt-6 rounded-2xl bg-indigo-50 p-4 text-sm text-indigo-700">
              Revisa tu correo y confirma tu cuenta antes de iniciar
              sesión.
            </div>
          ) : (
            <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-700">
              Tu cuenta ya puede iniciar sesión, pero deberá ser
              aprobada por la administración antes de registrar
              asistencias.
            </div>
          )}

          <Link
            href="/login"
            className="mt-7 inline-flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
          >
            Ir a iniciar sesión
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <section className="mx-auto w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
            <UserPlus className="h-8 w-8" />
          </div>

          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Vivace Suite
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Crear cuenta
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Regístrate como integrante del Ensamble Coral Vivace.
          </p>
        </div>

        {errorMessage && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

              <p className="text-sm text-red-700">
                {errorMessage}
              </p>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-7 space-y-5"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Nombre
              </span>

              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="given-name"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Apellidos
              </span>

              <input
                type="text"
                value={lastName}
                onChange={(event) =>
                  setLastName(event.target.value)
                }
                autoComplete="family-name"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Correo electrónico
            </span>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Teléfono
              </span>

              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                autoComplete="tel"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Voz
              </span>

              <select
                value={voice}
                onChange={(event) => setVoice(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                {VOICE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Contraseña
              </span>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="new-password"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Confirmar contraseña
              </span>

              <input
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                autoComplete="new-password"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <LoaderCircle className="h-5 w-5 animate-spin" />
                Creando cuenta...
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                Crear mi cuenta
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          ¿Ya tienes una cuenta?{" "}
          <Link
            href="/login"
            className="font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Inicia sesión
          </Link>
        </p>
      </section>
    </main>
  );
}