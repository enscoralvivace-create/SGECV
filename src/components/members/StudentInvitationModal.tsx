"use client";

import { RefreshCw, ShieldX } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import AccessDenied from "@/components/auth/AccessDenied";
import InvitationOnboardingPanel from "@/components/members/InvitationOnboardingPanel";
import VivaceButton from "@/components/ui/VivaceButton";
import VivaceLoading from "@/components/ui/VivaceLoading";
import VivaceModal from "@/components/ui/VivaceModal";
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
import {
  buildStudentInvitationMessage,
  buildStudentInvitationUrl,
} from "@/utils/invitationOnboarding";
import { getStudentInvitationEligibility } from "@/utils/studentInvitation";

interface StudentInvitationModalProps {
  member: Member;
  isLoadingAccess: boolean;
  accessError: string;
  canManageInvitations: boolean;
  initialInvitationUrl?: string;
  onInvitationUrlChange: (
    memberId: number,
    invitationUrl: string,
  ) => void;
  onClose: () => void;
}

const STATUS_LABELS: Record<StudentInvitationStatus, string> = {
  active: "Disponible",
  expired: "Vencida",
  used: "Usada",
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
  initialInvitationUrl = "",
  onInvitationUrlChange,
  onClose,
}: StudentInvitationModalProps) {
  const eligibility = useMemo(
    () => getStudentInvitationEligibility(member),
    [member],
  );
  const fullName = [member.name, member.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  const [invitations, setInvitations] =
    useState<StudentInvitationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [invitationUrl, setInvitationUrl] = useState(initialInvitationUrl);
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
    } catch (loadError: unknown) {
      setError(
        getErrorMessage(loadError, "No fue posible consultar las invitaciones."),
      );
    } finally {
      setIsLoading(false);
    }
  }, [canUseInvitationActions, member.id]);

  useEffect(() => {
    void loadInvitations();
  }, [loadInvitations]);

  useEffect(() => {
    setInvitationUrl(initialInvitationUrl);
    setError("");
  }, [initialInvitationUrl, member.id]);

  useEffect(() => {
    if (!canUseInvitationActions) {
      setInvitationUrl("");
      onInvitationUrlChange(member.id, "");
    }
  }, [canUseInvitationActions, member.id, onInvitationUrlChange]);

  const activeInvitation = invitations.find(
    (invitation) => invitation.status === "active",
  );
  const shareMessage = useMemo(
    () =>
      invitationUrl
        ? buildStudentInvitationMessage(invitationUrl, fullName)
        : "",
    [fullName, invitationUrl],
  );

  function closeModal(): void {
    if (isCreating || revokingId) {
      return;
    }

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

  async function handleCreate(): Promise<void> {
    if (!assertCanManage()) {
      return;
    }

    if (
      activeInvitation &&
      !window.confirm(
        "El enlace de la invitación disponible ya no puede recuperarse. Para preparar un nuevo QR se revocará esa invitación y se creará otra. ¿Deseas continuar?",
      )
    ) {
      return;
    }

    try {
      setIsCreating(true);
      setError("");
      setInvitationUrl("");

      const created = await createStudentInvitation(
        member.id,
        DEFAULT_VALID_FOR_DAYS,
      );

      if (!canUseInvitationActionsRef.current) {
        return;
      }

      const createdInvitationUrl = buildStudentInvitationUrl(
        created.plainToken,
      );

      setInvitationUrl(createdInvitationUrl);
      onInvitationUrlChange(member.id, createdInvitationUrl);

      try {
        const result = await listStudentInvitations(member.id);

        if (canUseInvitationActionsRef.current) {
          setInvitations(result);
        }
      } catch (refreshError: unknown) {
        setError(
          `La invitación fue creada, pero no fue posible actualizar el historial: ${getErrorMessage(
            refreshError,
            "error desconocido",
          )}`,
        );
      }
    } catch (createError: unknown) {
      setInvitationUrl("");
      onInvitationUrlChange(member.id, "");
      setError(
        getErrorMessage(createError, "No fue posible crear la invitación."),
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function handleRevoke(invitationId: string): Promise<void> {
    if (!assertCanManage()) {
      return;
    }

    if (!window.confirm("¿Deseas revocar esta invitación disponible?")) {
      return;
    }

    try {
      setRevokingId(invitationId);
      setError("");
      setInvitationUrl("");
      onInvitationUrlChange(member.id, "");
      await revokeStudentInvitation(invitationId);
      await loadInvitations();
    } catch (revokeError: unknown) {
      setError(
        getErrorMessage(revokeError, "No fue posible revocar la invitación."),
      );
    } finally {
      setRevokingId(null);
    }
  }

  const modalTitle = `Invitar a ${fullName || "la persona seleccionada"}`;

  if (isLoadingAccess) {
    return (
      <VivaceModal isOpen onClose={closeModal} title={modalTitle} size="lg">
        <VivaceLoading
          message="Verificando permisos..."
          className="min-h-72 border-0 shadow-none"
        />
      </VivaceModal>
    );
  }

  if (!canManageInvitations) {
    return (
      <VivaceModal isOpen onClose={closeModal} title={modalTitle} size="lg">
        <AccessDenied
          title="Acceso denegado"
          description={
            accessError ||
            "No cuentas con permisos para administrar invitaciones."
          }
          showBackButton={false}
          className="min-h-64"
        />
        <div className="mt-4 flex justify-end">
          <VivaceButton variant="outline" onClick={closeModal}>
            Cerrar
          </VivaceButton>
        </div>
      </VivaceModal>
    );
  }

  if (!eligibility.isEligible) {
    return (
      <VivaceModal isOpen onClose={closeModal} title={modalTitle} size="lg">
        <div className="px-2 py-8 text-center">
          <ShieldX className="mx-auto h-12 w-12 text-amber-600" />
          <h3 className="mt-4 text-xl font-bold text-slate-900">
            No se puede preparar esta incorporación
          </h3>
          <p className="mt-2 text-sm text-slate-600">{eligibility.reason}</p>
        </div>
      </VivaceModal>
    );
  }

  return (
    <VivaceModal
      isOpen
      onClose={closeModal}
      title={modalTitle}
      description="Genera y comparte una invitación individual para crear la cuenta e instalar Vivace Suite."
      size="xl"
      closeOnBackdrop={!isCreating && !revokingId}
      closeOnEscape={!isCreating && !revokingId}
    >
      <div className="space-y-6">
        {error ? (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
          >
            {error}
          </div>
        ) : null}

        {invitationUrl ? (
          <InvitationOnboardingPanel
            invitationUrl={invitationUrl}
            shareMessage={shareMessage}
            validForDays={DEFAULT_VALID_FOR_DAYS}
          />
        ) : null}

        <section aria-labelledby="invitation-history-title">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 id="invitation-history-title" className="font-bold text-slate-900">
                Invitaciones de esta persona
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Por seguridad, el enlace personal no puede recuperarse desde el historial.
              </p>
            </div>
            <VivaceButton
              autoFocus
              onClick={() => void handleCreate()}
              disabled={isLoading || Boolean(revokingId)}
              loading={isCreating}
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              {activeInvitation
                ? "Preparar nueva incorporación"
                : "Preparar incorporación"}
            </VivaceButton>
          </div>

          {activeInvitation && !invitationUrl ? (
            <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-800">
              Existe una invitación disponible, pero su token ya no puede recuperarse. Preparar una nueva revocará la anterior.
            </p>
          ) : null}

          {isLoading ? (
            <p className="py-10 text-center text-sm text-slate-500">
              Consultando invitaciones...
            </p>
          ) : invitations.length === 0 ? (
            <p className="mt-5 rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
              Esta persona todavía no tiene invitaciones.
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {invitations.map((invitation) => (
                <article
                  key={invitation.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_CLASSES[invitation.status]}`}
                    >
                      {STATUS_LABELS[invitation.status]}
                    </span>
                    <p className="mt-2 text-sm text-slate-700">
                      Creada: {formatDateTime(invitation.createdAt)}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      Expira: {formatDateTime(invitation.expiresAt)}
                    </p>
                  </div>

                  {invitation.status === "active" ? (
                    <div className="flex flex-col gap-2 sm:flex-row">
                      {!invitationUrl ? (
                        <VivaceButton
                          size="sm"
                          variant="outline"
                          onClick={() => void handleCreate()}
                          disabled={isCreating || Boolean(revokingId)}
                        >
                          Preparar incorporación
                        </VivaceButton>
                      ) : null}
                      <VivaceButton
                        size="sm"
                        variant="danger"
                        onClick={() => void handleRevoke(invitation.id)}
                        disabled={isCreating || Boolean(revokingId)}
                        loading={revokingId === invitation.id}
                      >
                        Revocar
                      </VivaceButton>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </VivaceModal>
  );
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
