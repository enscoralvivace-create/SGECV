"use client";

import { Copy, ExternalLink, QrCode, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

import VivaceButton from "@/components/ui/VivaceButton";
import VivaceModal from "@/components/ui/VivaceModal";
import {
  createIntakeWindow,
  listIntakeWindows,
  updateIntakeWindowStatus,
} from "@/services/intakeService";
import type { CreatedIntakeWindow, IntakeWindowSummary } from "@/types/intake";
import {
  buildIntakeWindowMessage,
  buildIntakeWindowUrl,
} from "@/utils/invitationOnboarding";

interface IntakeWindowModalProps {
  onClose: () => void;
  onChanged: () => void;
}

export default function IntakeWindowModal({ onClose, onChanged }: IntakeWindowModalProps) {
  const [name, setName] = useState("Piloto ECV agosto 2026");
  const [hours, setHours] = useState(4);
  const [message, setMessage] = useState("");
  const [created, setCreated] = useState<CreatedIntakeWindow | null>(null);
  const [windows, setWindows] = useState<IntakeWindowSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  const intakeUrl = created ? buildIntakeWindowUrl(created.plainToken) : "";
  const shareMessage = useMemo(
    () => created ? buildIntakeWindowMessage(intakeUrl, created.name) : "",
    [created, intakeUrl],
  );

  async function load(): Promise<void> {
    try {
      setIsLoading(true);
      setWindows(await listIntakeWindows());
    } catch (loadError: unknown) {
      setError(loadError instanceof Error ? loadError.message : "No fue posible consultar las ventanas.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function handleCreate(): Promise<void> {
    if (name.trim().length < 3) {
      setError("Escribe un nombre descriptivo de al menos 3 caracteres.");
      return;
    }
    try {
      setIsSaving(true);
      setError("");
      const result = await createIntakeWindow({ name, validForHours: hours, message });
      setCreated(result);
      await load();
      onChanged();
    } catch (createError: unknown) {
      setError(createError instanceof Error ? createError.message : "No fue posible abrir el registro.");
    } finally {
      setIsSaving(false);
    }
  }

  async function copy(value: string, label: string): Promise<void> {
    try { await navigator.clipboard.writeText(value); setCopyStatus(label); }
    catch { setCopyStatus("No fue posible copiar automáticamente."); }
  }

  async function closeWindow(id: string, action: "closed" | "revoked"): Promise<void> {
    const label = action === "closed" ? "cerrar" : "revocar";
    if (!window.confirm(`¿Deseas ${label} esta ventana?`)) return;
    try {
      setError("");
      await updateIntakeWindowStatus(id, action);
      if (created?.id === id) setCreated(null);
      await load();
      onChanged();
    } catch (updateError: unknown) {
      setError(updateError instanceof Error ? updateError.message : "No fue posible actualizar la ventana.");
    }
  }

  return (
    <VivaceModal isOpen onClose={onClose} title="Abrir registro temporal" description="Crea una ventana para recibir varias solicitudes mediante un mismo QR." size="xl" closeOnBackdrop={!isSaving} closeOnEscape={!isSaving}>
      <div className="space-y-6">
        {error ? <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</div> : null}

        {created ? (
          <section className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-emerald-800" /><h3 className="font-bold text-emerald-950">Registro temporal abierto</h3></div>
            <p className="mt-2 text-sm leading-6 text-emerald-900">Este QR sólo permite enviar una solicitud. Nadie obtiene acceso hasta que sea aprobado.</p>
            <div className="mt-5 grid gap-5 md:grid-cols-[1fr_auto]">
              <div className="min-w-0 space-y-3">
                <input readOnly aria-label="Enlace del registro temporal" value={intakeUrl} onFocus={(event) => event.currentTarget.select()} className="w-full rounded-xl border border-emerald-300 bg-white px-3 py-3 text-sm" />
                <div className="flex flex-wrap gap-2">
                  <VivaceButton size="sm" leftIcon={<Copy className="h-4 w-4" />} onClick={() => void copy(intakeUrl, "Enlace copiado.")}>Copiar enlace</VivaceButton>
                  <VivaceButton size="sm" variant="outline" leftIcon={<ExternalLink className="h-4 w-4" />} onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, "_blank", "noopener,noreferrer")}>WhatsApp</VivaceButton>
                  <VivaceButton size="sm" variant="secondary" leftIcon={<Copy className="h-4 w-4" />} onClick={() => void copy(shareMessage, "Mensaje copiado.")}>Copiar mensaje</VivaceButton>
                </div>
                {copyStatus ? <p role="status" className="text-sm text-slate-700">{copyStatus}</p> : null}
                <p className="text-sm text-slate-600">El token sólo permanece en memoria. Si se pierde, cierra esta ventana y genera otra.</p>
              </div>
              <div role="img" aria-label="Código QR del registro temporal" className="flex flex-col items-center rounded-2xl bg-white p-4 shadow-sm">
                <QrCode className="mb-2 h-5 w-5 text-emerald-800" />
                <QRCodeSVG value={intakeUrl} size={240} level="M" marginSize={2} title="QR del registro temporal" />
                <p className="mt-2 text-xs text-slate-500">Expira {formatDate(created.expiresAt)}</p>
              </div>
            </div>
          </section>
        ) : (
          <section className="grid gap-4 rounded-2xl border border-slate-200 p-4 sm:p-5">
            <label className="text-sm font-semibold text-slate-700">Nombre de la jornada<input autoFocus value={name} maxLength={120} onChange={(event) => setName(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3.5 font-normal" /></label>
            <label className="text-sm font-semibold text-slate-700">Vigencia<select value={hours} onChange={(event) => setHours(Number(event.target.value))} className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 font-normal">{[2,4,8,24,48].map((value) => <option key={value} value={value}>{value} horas</option>)}</select></label>
            <label className="text-sm font-semibold text-slate-700">Mensaje opcional<textarea value={message} maxLength={500} rows={3} onChange={(event) => setMessage(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-3.5 py-3 font-normal" /></label>
            <VivaceButton onClick={() => void handleCreate()} loading={isSaving} leftIcon={<QrCode className="h-4 w-4" />}>Generar QR</VivaceButton>
          </section>
        )}

        <section><h3 className="font-bold text-slate-950">Ventanas recientes</h3>
          {isLoading ? <p className="mt-3 text-sm text-slate-500">Consultando...</p> : windows.length === 0 ? <p className="mt-3 text-sm text-slate-500">No hay ventanas registradas.</p> : <div className="mt-3 space-y-2">{windows.map((item) => <article key={item.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-slate-900">{item.name}</p><p className="mt-1 text-xs text-slate-500">{statusLabel(item.status)} · {item.pendingCount} pendientes · expira {formatDate(item.expiresAt)}</p></div>{item.status === "open" ? <div className="flex gap-2"><VivaceButton size="sm" variant="outline" onClick={() => void closeWindow(item.id, "closed")}>Cerrar</VivaceButton><VivaceButton size="sm" variant="danger" onClick={() => void closeWindow(item.id, "revoked")}>Revocar</VivaceButton></div> : null}</article>)}</div>}
        </section>
      </div>
    </VivaceModal>
  );
}

function formatDate(value: string): string { return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
function statusLabel(status: IntakeWindowSummary["status"]): string { return ({ open: "Abierta", closed: "Cerrada", expired: "Vencida", revoked: "Revocada" })[status]; }
