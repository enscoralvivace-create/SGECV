"use client";

import { Download, Share2, Smartphone } from "lucide-react";

interface PwaInstallationGuideProps {
  compact?: boolean;
}

export default function PwaInstallationGuide({
  compact = false,
}: PwaInstallationGuideProps) {
  return (
    <section
      aria-labelledby="pwa-installation-guide-title"
      className={[
        "rounded-2xl border border-slate-200 bg-slate-50",
        compact ? "p-4" : "p-5",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-950 text-white">
          <Smartphone aria-hidden="true" className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h2
            id="pwa-installation-guide-title"
            className="font-bold text-slate-950"
          >
            Instala Vivace Suite
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            La instalación es opcional: también puedes completar el registro desde el navegador.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-white p-3.5">
          <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Download aria-hidden="true" className="h-4 w-4 text-emerald-800" />
            Android
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-600">
            Usa “Instalar aplicación” cuando aparezca. Si no aparece, abre el menú de Chrome y selecciona “Instalar aplicación”.
          </p>
        </div>

        <div className="rounded-xl bg-white p-3.5">
          <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Share2 aria-hidden="true" className="h-4 w-4 text-emerald-800" />
            iPhone o iPad
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-600">
            Abre el enlace en Safari, toca Compartir y elige “Agregar a pantalla de inicio”.
          </p>
        </div>
      </div>
    </section>
  );
}
