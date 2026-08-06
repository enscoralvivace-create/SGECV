"use client";

import { CheckCircle2, LoaderCircle, Send, TriangleAlert } from "lucide-react";
import { useParams } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";

import { submitIntakeRequest, validateIntakeWindow } from "@/services/intakeService";
import type { IntakeWindowValidation } from "@/types/intake";

type PageState =
  | { status: "checking" }
  | { status: "ready"; window: IntakeWindowValidation }
  | { status: "unavailable"; resultCode: string; name: string | null }
  | { status: "error" }
  | { status: "sent" };

export default function IntakeRegistrationPage() {
  const params = useParams<{ token: string | string[] }>();
  const token = typeof params.token === "string" ? params.token : "";
  const [pageState, setPageState] = useState<PageState>({ status: "checking" });
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [voice, setVoice] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCurrent = true;
    void validateIntakeWindow(token).then((result) => {
      if (!isCurrent) return;
      setPageState(result.isAvailable
        ? { status: "ready", window: result }
        : { status: "unavailable", resultCode: result.resultCode, name: result.name });
    }).catch(() => { if (isCurrent) setPageState({ status: "error" }); });
    return () => { isCurrent = false; };
  }, [token]);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError("");
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError("Completa nombre, apellidos y correo."); return;
    }
    try {
      setIsSubmitting(true);
      const code = await submitIntakeRequest(token, { firstName, lastName, email, phone, requestedVoice: voice, notes });
      if (code === "submitted") setPageState({ status: "sent" });
      else if (code === "duplicate_pending") setError("Ya existe una solicitud pendiente con este correo en la jornada.");
      else if (code === "window_unavailable") setPageState({ status: "unavailable", resultCode: code, name: null });
      else setError("Revisa los datos e inténtalo nuevamente.");
    } catch { setError("No fue posible enviar la solicitud. Inténtalo nuevamente."); }
    finally { setIsSubmitting(false); }
  }

  if (pageState.status === "checking") return <PublicState icon={<LoaderCircle className="h-12 w-12 animate-spin text-emerald-700" />} title="Verificando jornada" text="Espera un momento." />;
  if (pageState.status === "error") return <PublicState icon={<TriangleAlert className="h-12 w-12 text-rose-600" />} title="Error temporal" text="No fue posible verificar el registro temporal." />;
  if (pageState.status === "unavailable") return <PublicState icon={<TriangleAlert className="h-12 w-12 text-amber-600" />} title={pageState.name ?? "Registro no disponible"} text={unavailableText(pageState.resultCode)} />;
  if (pageState.status === "sent") return <PublicState icon={<CheckCircle2 className="h-14 w-14 text-emerald-600" />} title="Tu solicitud fue enviada" text="El administrador revisará tus datos. Si la aprueba, recibirás una invitación personal para crear tu cuenta." />;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:py-10">
      <section className="mx-auto w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">Ensamble Coral Vivace</p>
        <h1 className="mt-2 text-center text-3xl font-bold text-slate-950">{pageState.window.name}</h1>
        {pageState.window.message ? <p className="mt-3 text-center text-sm leading-6 text-slate-600">{pageState.window.message}</p> : null}
        <div className="mt-5 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-900">Enviar esta solicitud no crea todavía una cuenta. Recibirás una invitación personal cuando sea aprobada.</div>
        {pageState.window.expiresAt ? <p className="mt-3 text-center text-xs text-slate-500">Disponible hasta {formatDate(pageState.window.expiresAt)}</p> : null}
        {error ? <div role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</div> : null}
        <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Nombre" value={firstName} onChange={setFirstName} autoComplete="given-name" required />
          <Field label="Apellidos" value={lastName} onChange={setLastName} autoComplete="family-name" required />
          <Field label="Correo" value={email} onChange={setEmail} type="email" autoComplete="email" required className="sm:col-span-2" />
          <Field label="Teléfono (opcional)" value={phone} onChange={setPhone} type="tel" autoComplete="tel" />
          <label className="text-sm font-semibold text-slate-700">Voz (opcional)<select value={voice} onChange={(event) => setVoice(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 font-normal"><option value="">Sin especificar</option>{["Soprano","Contralto","Tenor","Bajo","Otra"].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Notas (opcional)<textarea value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={1000} rows={3} className="mt-2 w-full rounded-xl border border-slate-300 px-3.5 py-3 font-normal" /></label>
          <button type="submit" disabled={isSubmitting} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-950 px-5 font-bold text-white disabled:opacity-60 sm:col-span-2">{isSubmitting ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}{isSubmitting ? "Enviando..." : "Enviar solicitud"}</button>
        </form>
      </section>
    </main>
  );
}

function Field({ label, value, onChange, className = "", type = "text", ...props }: { label: string; value: string; onChange: (value: string) => void; className?: string; type?: string; autoComplete?: string; required?: boolean }) {
  return <label className={`text-sm font-semibold text-slate-700 ${className}`}>{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} maxLength={type === "email" ? 320 : 150} className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3.5 font-normal" {...props} /></label>;
}
function PublicState({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) { return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4"><section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm"><div className="flex justify-center">{icon}</div><p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">Ensamble Coral Vivace</p><h1 className="mt-2 text-2xl font-bold text-slate-950">{title}</h1><p className="mt-3 text-sm leading-6 text-slate-600">{text}</p></section></main>; }
function unavailableText(code: string): string { if (code === "expired") return "La ventana de incorporación venció."; if (code === "revoked") return "Esta ventana fue revocada por la administración."; if (code === "closed") return "La recepción de solicitudes ya fue cerrada."; return "El enlace no es válido o ya no está disponible."; }
function formatDate(value: string): string { return new Intl.DateTimeFormat("es-MX", { dateStyle: "long", timeStyle: "short" }).format(new Date(value)); }
