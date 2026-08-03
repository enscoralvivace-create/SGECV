import Link from "next/link";
import { MailQuestion } from "lucide-react";

export default function RegistrationPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
          <MailQuestion className="h-8 w-8" />
        </div>

        <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
          Vivace Suite
        </p>

        <h1 className="mt-2 text-2xl font-bold text-slate-950">
          Registro mediante invitación
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          Para crear una cuenta necesitas el enlace de invitación enviado por la administración de Vivace Suite.
        </p>

        <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">
          Si perteneces al ensamble y todavía no recibes una invitación, contacta al administrador.
        </p>

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
