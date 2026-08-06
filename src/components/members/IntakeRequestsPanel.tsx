"use client";

import { RefreshCw, UserCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import InvitationOnboardingPanel from "@/components/members/InvitationOnboardingPanel";
import VivaceButton from "@/components/ui/VivaceButton";
import VivaceCard from "@/components/ui/VivaceCard";
import VivaceModal from "@/components/ui/VivaceModal";
import {
  approveIntakeRequest,
  listIntakeRequests,
  rejectIntakeRequest,
} from "@/services/intakeService";
import type { ApprovedIntakeRequest, IntakeRequestedRole, IntakeRequest, IntakeRequestStatus } from "@/types/intake";
import { buildStudentInvitationMessage, buildStudentInvitationUrl } from "@/utils/invitationOnboarding";

interface IntakeRequestsPanelProps { refreshKey: number; }

export default function IntakeRequestsPanel({ refreshKey }: IntakeRequestsPanelProps) {
  const [requests, setRequests] = useState<IntakeRequest[]>([]);
  const [filter, setFilter] = useState<IntakeRequestStatus | "">("pending");
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [approvedRoles, setApprovedRoles] = useState<Record<number, IntakeRequestedRole>>({});
  const [error, setError] = useState("");
  const [approved, setApproved] = useState<{ request: IntakeRequest; result: ApprovedIntakeRequest } | null>(null);

  const load = useCallback(async () => {
    try { setIsLoading(true); setError(""); setRequests(await listIntakeRequests(filter || null)); }
    catch (loadError: unknown) { setError(loadError instanceof Error ? loadError.message : "No fue posible consultar las solicitudes."); }
    finally { setIsLoading(false); }
  }, [filter]);

  useEffect(() => { void load(); }, [load, refreshKey]);

  async function approve(request: IntakeRequest): Promise<void> {
    const approvedRole = approvedRoles[request.id] ?? request.requestedRole;
    const roleLabel = approvedRole === "student" ? "alumno" : "integrante";
    if (!window.confirm(`¿Aprobar a ${request.firstName} ${request.lastName} como ${roleLabel}?`)) return;
    try { setProcessingId(request.id); setError(""); const result = await approveIntakeRequest(request.id, approvedRole); setApproved({ request, result }); await load(); }
    catch (approveError: unknown) { setError(getApprovalError(approveError)); }
    finally { setProcessingId(null); }
  }

  async function reject(request: IntakeRequest): Promise<void> {
    const reason = window.prompt("Motivo del rechazo (mínimo 3 caracteres):");
    if (!reason) return;
    try { setProcessingId(request.id); setError(""); await rejectIntakeRequest(request.id, reason); await load(); }
    catch (rejectError: unknown) { setError(rejectError instanceof Error ? rejectError.message : "No fue posible rechazar la solicitud."); }
    finally { setProcessingId(null); }
  }

  const invitationUrl = approved ? buildStudentInvitationUrl(approved.result.plainInvitationToken) : "";
  const shareMessage = useMemo(() => approved ? buildStudentInvitationMessage(invitationUrl, `${approved.request.firstName} ${approved.request.lastName}`) : "", [approved, invitationUrl]);

  return (
    <VivaceCard className="mb-8">
      <VivaceCard.Header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-bold text-slate-950">Solicitudes de incorporación</h2><p className="mt-1 text-sm text-slate-600">Revisa las solicitudes antes de generar una invitación personal.</p></div><div className="flex gap-2"><select aria-label="Filtrar solicitudes" value={filter} onChange={(event) => setFilter(event.target.value as IntakeRequestStatus | "")} className="min-h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"><option value="">Todas</option><option value="pending">Pendientes</option><option value="approved">Aprobadas</option><option value="rejected">Rechazadas</option></select><VivaceButton size="sm" variant="outline" onClick={() => void load()} leftIcon={<RefreshCw className="h-4 w-4" />}>Actualizar</VivaceButton></div></VivaceCard.Header>
      <VivaceCard.Body>
        {error ? <div role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</div> : null}
        {isLoading ? <p className="py-8 text-center text-sm text-slate-500">Consultando solicitudes...</p> : requests.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">No hay solicitudes en este estado.</p> : <div className="space-y-3">{requests.map((request) => <article key={request.id} className="grid gap-3 rounded-xl border border-slate-200 p-4 lg:grid-cols-[1fr_auto] lg:items-center"><div><div className="flex flex-wrap items-center gap-2"><p className="font-bold text-slate-950">{request.firstName} {request.lastName}</p><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">{request.status}</span></div><p className="mt-1 text-sm text-slate-700">{request.email}{request.requestedVoice ? ` · ${request.requestedVoice}` : ""}</p><p className="mt-1 text-xs text-slate-500">{request.windowName} · {formatDate(request.createdAt)}</p>{request.notes ? <p className="mt-2 text-sm text-slate-600">{request.notes}</p> : null}{request.rejectionReason ? <p className="mt-2 text-sm text-rose-700">Motivo: {request.rejectionReason}</p> : null}</div>{request.status === "pending" ? <div className="flex flex-col gap-2 sm:flex-row sm:items-end"><label className="text-xs font-semibold text-slate-700">Tipo de incorporación<select value={approvedRoles[request.id] ?? request.requestedRole} onChange={(event) => setApprovedRoles((current) => ({ ...current, [request.id]: event.target.value as IntakeRequestedRole }))} disabled={processingId !== null} className="mt-1 block min-h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900"><option value="student">Alumno</option><option value="member">Integrante</option></select></label><div className="flex gap-2"><VivaceButton size="sm" onClick={() => void approve(request)} loading={processingId === request.id} leftIcon={<UserCheck className="h-4 w-4" />}>Aprobar</VivaceButton><VivaceButton size="sm" variant="danger" onClick={() => void reject(request)} disabled={processingId !== null}>Rechazar</VivaceButton></div></div> : null}</article>)}</div>}
      </VivaceCard.Body>

      <VivaceModal isOpen={approved !== null} onClose={() => setApproved(null)} title="Solicitud aprobada — compartir invitación" description={approved ? `Integrante ${approved.result.memberResolution === "created" ? "creado" : "vinculado"}. No se envió correo automáticamente.` : undefined} size="lg">
        {approved ? <InvitationOnboardingPanel invitationUrl={invitationUrl} shareMessage={shareMessage} validForDays={7} /> : null}
      </VivaceModal>
    </VivaceCard>
  );
}

function formatDate(value: string): string { return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
function getApprovalError(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("duplicate_members")) return "Hay más de un integrante con ese correo. Corrige el duplicado antes de aprobar.";
  if (message.includes("member_already_linked")) return "El integrante encontrado ya está vinculado a otra cuenta.";
  if (message.includes("auth_account_conflict")) return "Ya existe una cuenta Auth incompatible con esta solicitud.";
  if (message.includes("member_not_eligible")) return "El integrante existente no está activo o su rol no permite invitarlo.";
  if (message.includes("member_role_conflict")) return "El integrante existente tiene un tipo distinto. No se modificó su rol; selecciona el tipo correcto.";
  if (message.includes("request_not_pending")) return "La solicitud ya fue revisada.";
  return message || "No fue posible aprobar la solicitud.";
}
