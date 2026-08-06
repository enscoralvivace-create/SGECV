"use client";

import {
  Copy,
  ExternalLink,
  Maximize2,
  Minimize2,
  QrCode,
} from "lucide-react";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

import PwaInstallationGuide from "@/components/pwa/PwaInstallationGuide";
import VivaceButton from "@/components/ui/VivaceButton";

interface InvitationOnboardingPanelProps {
  invitationUrl: string;
  shareMessage: string;
  validForDays: number;
}

export default function InvitationOnboardingPanel({
  invitationUrl,
  shareMessage,
  validForDays,
}: InvitationOnboardingPanelProps) {
  const [copyStatus, setCopyStatus] = useState("");
  const [isQrExpanded, setIsQrExpanded] = useState(false);

  async function copyText(
    value: string,
    successMessage: string,
  ): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
      setCopyStatus(successMessage);
    } catch {
      setCopyStatus(
        "No fue posible copiar automáticamente. Selecciona el texto y cópialo manualmente.",
      );
    }
  }

  function shareOnWhatsApp(): void {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareMessage)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <section className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-bold text-emerald-950">Incorporación preparada</h3>
        <span className="rounded-full bg-emerald-700 px-2.5 py-1 text-xs font-bold text-white">
          Disponible
        </span>
      </div>
      <p className="mt-2 text-sm font-semibold text-amber-800">
        Este enlace sólo se muestra ahora. Si lo pierdes, deberás generar uno nuevo.
      </p>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div className="min-w-0 space-y-4">
          <section aria-labelledby="invitation-share-title">
            <h4 id="invitation-share-title" className="font-bold text-slate-900">
              Compartir invitación
            </h4>
            <input
              aria-label="Enlace personal de invitación"
              readOnly
              value={invitationUrl}
              onFocus={(event) => event.currentTarget.select()}
              className="mt-3 w-full rounded-xl border border-emerald-300 bg-white px-3 py-3 text-sm text-slate-800"
            />
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <VivaceButton
                size="sm"
                onClick={() => void copyText(invitationUrl, "Enlace copiado.")}
                leftIcon={<Copy className="h-4 w-4" />}
              >
                Copiar enlace
              </VivaceButton>
              <VivaceButton
                size="sm"
                variant="outline"
                onClick={shareOnWhatsApp}
                leftIcon={<ExternalLink className="h-4 w-4" />}
              >
                WhatsApp
              </VivaceButton>
              <VivaceButton
                size="sm"
                variant="secondary"
                onClick={() => void copyText(shareMessage, "Mensaje copiado.")}
                leftIcon={<Copy className="h-4 w-4" />}
              >
                Copiar mensaje
              </VivaceButton>
            </div>
            {copyStatus ? (
              <p className="mt-2 text-sm text-slate-700" role="status" aria-live="polite">
                {copyStatus}
              </p>
            ) : null}
            <label htmlFor="student-invitation-message" className="mt-4 block text-sm font-semibold text-slate-700">
              Mensaje de invitación
            </label>
            <textarea
              id="student-invitation-message"
              rows={8}
              readOnly
              value={shareMessage}
              onFocus={(event) => event.currentTarget.select()}
              className="mt-2 w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm leading-6 text-slate-800"
            />
          </section>
        </div>

        <section
          aria-labelledby="invitation-qr-title"
          className="flex flex-col items-center rounded-2xl bg-white p-4 shadow-sm"
        >
          <h4 id="invitation-qr-title" className="flex items-center gap-2 font-bold text-slate-900">
            <QrCode aria-hidden="true" className="h-5 w-5 text-emerald-800" />
            Código QR
          </h4>
          <div
            role="img"
            aria-label="Código QR con el enlace personal de la invitación"
            className="mt-3 max-w-full overflow-auto rounded-xl bg-white p-2"
          >
            <QRCodeSVG
              value={invitationUrl}
              size={isQrExpanded ? 320 : 220}
              level="M"
              marginSize={2}
              title="Código QR personal de la invitación"
            />
          </div>
          <p className="mt-3 max-w-72 text-center text-sm leading-5 text-slate-600">
            Escanea este código desde el teléfono de la persona invitada.
          </p>
          <p className="mt-1 text-center text-xs text-slate-500">
            Válido por {validForDays} días.
          </p>
          <VivaceButton
            className="mt-3"
            size="sm"
            variant="ghost"
            onClick={() => setIsQrExpanded((current) => !current)}
            leftIcon={
              isQrExpanded ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )
            }
          >
            {isQrExpanded ? "Reducir QR" : "Ampliar QR"}
          </VivaceButton>
        </section>
      </div>

      <div className="mt-5 space-y-4">
        <PwaInstallationGuide compact />
        <section aria-labelledby="invitation-steps-title" className="rounded-2xl bg-white p-4">
          <h4 id="invitation-steps-title" className="font-bold text-slate-900">
            Qué debe hacer la persona invitada
          </h4>
          <ol className="mt-3 grid gap-3 text-sm leading-5 text-slate-700 sm:grid-cols-2">
            {[
              "Abre el enlace o escanea el QR.",
              "Instala Vivace Suite si lo desea.",
              "Completa el registro con el correo de la invitación.",
              "Confirma su correo, abre Vivace Suite e inicia sesión.",
              "Sigue el recorrido “Conoce Vivace Suite”.",
            ].map((step, index) => (
              <li key={step} className="flex gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-900">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </section>
  );
}
