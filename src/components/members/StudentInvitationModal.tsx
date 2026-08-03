"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Copy, ExternalLink, QrCode, RefreshCw, ShieldX } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import AccessDenied from "@/components/auth/AccessDenied";
import VivaceLoading from "@/components/ui/VivaceLoading";

import {
  createStudentInvitation,
  listStudentInvitations,
  revokeStudentInvitation,
} from "@/services/studentInvitationService";

import type { Member } from "@/types/member";
import type {
  StudentInvitationStatus,
  StudentInvitationSummary,
} from "@/types/studentInvitation";

import { getStudentInvitationEligibility } from "@/utils/studentInvitation";

interface StudentInvitationModalProps {
  member: Member;
  isLoadingAccess: boolean;
  accessError: string;
  canManageInvitations: boolean;
  onClose: () => void;
}

const STATUS_LABELS: Record<StudentInvitationStatus, string> = {
  active: "Activa",
  expired: "Expirada",
  used: "Utilizada",
  revoked: "Revocada",
};

const STATUS_CLASSES: Record<StudentInvitationStatus, string> = {
  active: "bg-emerald-100 text-emerald-800",
  expired: "bg-amber-100 text-amber-800",
  used: "bg-sky-100 text-sky-800",
  revoked: "bg-slate-200 text-slate-700",
};

const DEFAULT_VALID_FOR_DAYS = 7;

export default function StudentInvitationModal({
  member,
  isLoadingAccess,
  accessError,
  canManageInvitations,
  onClose,
}: StudentInvitationModalProps) {
  const eligibility = useMemo(
    () => getStudentInvitationEligibility(member),
    [member],
  );
  const fullName = [member.name, member.last_name].filter(Boolean).join(" ");
  const [invitations, setInvitations] = useState<StudentInvitationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [invitationUrl, setInvitationUrl] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const canUseInvitationActions =
    !isLoadingAccess && canManageInvitations && eligibility.isEligible;
  const canUseInvitationActionsRef = useRef(canUseInvitationActions);

  useEffect(() => {
    canUseInvitationActionsRef.current = canUseInvitationActions;
  }, [canUseInvitationActions]);

  const loadInvitations = useCallback(async () => {
    if (!canUseInvitationActions) {
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const result = await listStudentInvitations(member.id);

      if (canUseInvitationActionsRef.current) {
        setInvitations(result);
      }
    } catch (loadError) {
      setError(getErrorMessage(loadError, "No fue posible consultar las invitaciones."));
    } finally {
      setIsLoading(false);
    }
  }, [canUseInvitationActions, member.id]);

  useEffect(() => {
    void loadInvitations();
  }, [loadInvitations]);

  useEffect(() => {
    if (isLoadingAccess || !canManageInvitations || !eligibility.isEligible) {
      setInvitationUrl("");
      setShareMessage("");
      setCopyMessage("");
    }
  }, [canManageInvitations, eligibility.isEligible, isLoadingAccess]);

  useEffect(() => {
    setInvitationUrl("");
    setShareMessage("");
    setCopyMessage("");
    setError("");
  }, [member.id]);

  const activeInvitation = invitations.find(
    (invitation) => invitation.status === "active",
  );

  function closeModal() {
    if (isCreating || revokingId) {
      return;
    }

    setInvitationUrl("");
    setShareMessage("");
    setCopyMessage("");
    onClose();
  }

  function assertCanManage(): boolean {
    if (isLoadingAccess || !canManageInvitations) {
      setError("No cuentas con permisos para administrar invitaciones.");
      return false;
    }

    if (!eligibility.isEligible) {
      setError(eligibility.reason);
      return false;
    }

    return true;
  }

  async function handleCreate() {
    if (!assertCanManage()) {
      return;
    }

    if (
      activeInvitation &&
      !window.confirm(
        "Al regenerar se revocará la invitación activa anterior. ¿Deseas continuar?",
      )
    ) {
      return;
    }

    try {
      setIsCreating(true);
      setError("");
      setInvitationUrl("");
      setShareMessage("");
      setCopyMessage("");

      const created = await createStudentInvitation(
        member.id,
        DEFAULT_VALID_FOR_DAYS,
      );

      if (!canUseInvitationActionsRef.current) {
        return;
      }

      const url = new URL(
        `/registro/invitacion/${encodeURIComponent(created.plainToken)}`,
        window.location.origin,
      ).toString();

      setInvitationUrl(url);
      setShareMessage(
        `Hola ${fullName}, te compartimos tu invitación para activar tu cuenta de Vivace Suite. El enlace es válido por ${DEFAULT_VALID_FOR_DAYS} días: ${url}`,
      );

      try {
        const result = await listStudentInvitations(member.id);

        if (canUseInvitationActionsRef.current) {
          setInvitations(result);
        }
      } catch (refreshError) {
        setError(
          `La invitación fue creada, pero no fue posible actualizar el historial: ${getErrorMessage(
            refreshError,
            "error desconocido",
          )}`,
        );
      }
    } catch (createError) {
      setInvitationUrl("");
      setShareMessage("");
      setError(getErrorMessage(createError, "No fue posible crear la invitación."));
    } finally {
      setIsCreating(false);
    }
  }

  async function handleRevoke(invitationId: string) {
    if (!assertCanManage()) {
      return;
    }

    if (!window.confirm("¿Deseas revocar esta invitación activa?")) {
      return;
    }

    try {
      setRevokingId(invitationId);
      setError("");
      setInvitationUrl("");
      setShareMessage("");
      setCopyMessage("");
      await revokeStudentInvitation(invitationId);

      try {
        const result = await listStudentInvitations(member.id);

        if (canUseInvitationActionsRef.current) {
          setInvitations(result);
        }
      } catch (refreshError) {
        setError(
          `La invitación fue revocada, pero no fue posible actualizar el historial: ${getErrorMessage(
            refreshError,
            "error desconocido",
          )}`,
        );
      }
    } catch (revokeError) {
      setError(getErrorMessage(revokeError, "No fue posible revocar la invitación."));
    } finally {
      setRevokingId(null);
    }
  }

  async function handleCopy() {
    if (!invitationUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(invitationUrl);
      setCopyMessage("Enlace copiado.");
    } catch {
      setCopyMessage("No fue posible copiar automáticamente. Selecciona el enlace y cópialo.");
    }
  }

  function handleWhatsApp() {
    if (!invitationUrl || !shareMessage.trim()) {
      return;
    }

    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareMessage)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  if (isLoadingAccess) {
    return <ModalShell><VivaceLoading message="Verificando permisos..." className="min-h-72 border-0 shadow-none" /></ModalShell>;
  }

  if (!canManageInvitations) {
    return (
      <ModalShell>
        <AccessDenied
          title="Acceso denegado"
          description={accessError || "No cuentas con permisos para administrar invitaciones."}
          showBackButton={false}
          className="min-h-64"
        />
        <ModalCloseFooter onClose={closeModal} />
      </ModalShell>
    );
  }

  if (!eligibility.isEligible) {
    return (
      <ModalShell>
        <div className="px-6 py-10 text-center">
          <ShieldX className="mx-auto h-12 w-12 text-amber-600" />
          <h2 className="mt-4 text-xl font-bold text-slate-900">No se puede invitar a este integrante</h2>
          <p className="mt-2 text-sm text-slate-600">{eligibility.reason}</p>
        </div>
        <ModalCloseFooter onClose={closeModal} />
      </ModalShell>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="student-invitation-title">
      <div className="max-h-[calc(100dvh-var(--safe-top))] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-h-[92vh] sm:rounded-3xl">
        <header className="sticky top-0 z-20 flex items-start justify-between border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur sm:px-6">
          <div>
            <p className="text-sm font-medium text-slate-500">Cuenta de alumno</p>
            <h2 id="student-invitation-title" className="mt-1 text-xl font-bold text-slate-900">Invitar alumno</h2>
            <p className="mt-1 text-sm text-slate-600">{fullName}</p>
          </div>
          <button type="button" onClick={closeModal} disabled={isCreating || Boolean(revokingId)} aria-label="Cerrar modal" className="flex h-11 w-11 items-center justify-center rounded-xl text-xl text-slate-500 transition hover:bg-slate-100 disabled:opacity-50">×</button>
        </header>

        <div className="space-y-6 px-5 py-6 sm:px-6">
          {error ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div> : null}

          {invitationUrl ? (
            <section className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-5">
              <h3 className="font-bold text-emerald-950">Invitación creada</h3>
              <p className="mt-2 text-sm font-semibold text-amber-800">Este enlace solo se mostrará ahora. Si lo pierdes, deberás generar uno nuevo.</p>
              <div className="mt-5 grid gap-5 md:grid-cols-[1fr_auto] md:items-start">
                <div className="min-w-0 space-y-4">
                  <input aria-label="Enlace de invitación" readOnly value={invitationUrl} onFocus={(event) => event.currentTarget.select()} className="w-full rounded-xl border border-emerald-300 bg-white px-3 py-3 text-sm text-slate-800" />
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button type="button" onClick={() => void handleCopy()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-950"><Copy className="h-4 w-4" />Copiar enlace</button>
                    <button type="button" onClick={handleWhatsApp} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700"><ExternalLink className="h-4 w-4" />Compartir por WhatsApp</button>
                  </div>
                  {copyMessage ? <p className="text-sm text-slate-700" role="status">{copyMessage}</p> : null}
                  <div>
                    <label htmlFor="student-invitation-message" className="text-sm font-semibold text-slate-700">Mensaje para WhatsApp</label>
                    <textarea id="student-invitation-message" rows={4} value={shareMessage} onChange={(event) => setShareMessage(event.target.value)} className="mt-2 w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-800 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100" />
                  </div>
                </div>
                <div className="flex flex-col items-center rounded-2xl bg-white p-4 shadow-sm">
                  <QrCode className="mb-2 h-5 w-5 text-emerald-800" />
                  <QRCodeSVG value={invitationUrl} size={196} level="M" marginSize={2} title="Código QR de la invitación" />
                  <p className="mt-3 max-w-52 text-center text-xs text-slate-600">Válido por {DEFAULT_VALID_FOR_DAYS} días.</p>
                </div>
              </div>
            </section>
          ) : null}

          <section>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Historial de invitaciones</h3>
                <p className="mt-1 text-sm text-slate-600">El token nunca puede recuperarse desde este historial.</p>
              </div>
              <button type="button" onClick={() => void handleCreate()} disabled={isCreating || isLoading || Boolean(revokingId)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-950 disabled:cursor-not-allowed disabled:bg-slate-400">
                <RefreshCw className={`h-4 w-4 ${isCreating ? "animate-spin" : ""}`} />
                {isCreating ? "Generando..." : activeInvitation ? "Regenerar invitación" : "Generar invitación"}
              </button>
            </div>

            {activeInvitation ? <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Al regenerar, la invitación activa anterior será revocada.</p> : null}

            {isLoading ? (
              <p className="py-10 text-center text-sm text-slate-500">Consultando invitaciones...</p>
            ) : invitations.length === 0 ? (
              <p className="mt-5 rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">Este integrante todavía no tiene invitaciones.</p>
            ) : (
              <div className="mt-5 space-y-3">
                {invitations.map((invitation) => (
                  <article key={invitation.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_CLASSES[invitation.status]}`}>{STATUS_LABELS[invitation.status]}</span>
                      <p className="mt-2 text-sm text-slate-700">Creada: {formatDateTime(invitation.createdAt)}</p>
                      <p className="mt-1 text-sm text-slate-700">Expira: {formatDateTime(invitation.expiresAt)}</p>
                    </div>
                    {invitation.status === "active" ? (
                      <button type="button" onClick={() => void handleRevoke(invitation.id)} disabled={revokingId === invitation.id || isCreating} className="min-h-11 rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50">{revokingId === invitation.id ? "Revocando..." : "Revocar"}</button>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function ModalShell({ children }: { children: React.ReactNode }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"><div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl">{children}</div></div>;
}

function ModalCloseFooter({ onClose }: { onClose: () => void }) {
  return <div className="flex justify-end border-t border-slate-200 p-4"><button type="button" onClick={onClose} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cerrar</button></div>;
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
