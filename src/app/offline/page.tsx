import Link from "next/link";
import {
  RefreshCw,
  WifiOff,
} from "lucide-react";

export const metadata = {
  title: "Sin conexión",
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-xl sm:p-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
          <WifiOff
            aria-hidden="true"
            className="h-8 w-8"
          />
        </div>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
          Vivace Suite
        </p>

        <h1 className="mt-2 text-2xl font-bold text-slate-950">
          No hay conexión a internet
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          Algunas funciones necesitan conexión para consultar o guardar información.
          Puedes volver a intentarlo cuando tu dispositivo recupere la red.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            href="/"
          >
            <RefreshCw
              aria-hidden="true"
              className="h-4 w-4"
            />

            Reintentar
          </Link>

          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            href="/mi-cuenta"
          >
            Ir a Mi cuenta
          </Link>
        </div>

        <p className="mt-6 text-xs leading-5 text-slate-500">
          La aplicación se actualizará automáticamente cuando regreses y vuelva la conexión.
        </p>
      </section>
    </main>
  );
}