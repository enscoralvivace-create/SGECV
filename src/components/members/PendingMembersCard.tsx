"use client";

import { useState } from "react";
import {
  CheckCircle2,
  LoaderCircle,
  Mail,
  TriangleAlert,
  UserCheck,
  UserX,
} from "lucide-react";

import { updateMemberApprovalStatus } from "@/services/memberApprovalService";
import type { Member } from "@/types/member";

interface PendingMembersCardProps {
  members: Member[];
  onStatusChanged: (
    memberId: number,
    status: "Activo" | "Inactivo",
  ) => void;
}

function getFullName(member: Member): string {
  return [member.name, member.last_name]
    .filter(Boolean)
    .join(" ");
}

export default function PendingMembersCard({
  members,
  onStatusChanged,
}: PendingMembersCardProps) {
  const [processingId, setProcessingId] =
    useState<number | null>(null);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  async function handleStatusChange(
    memberId: number,
    status: "Activo" | "Inactivo",
  ) {
    setProcessingId(memberId);
    setErrorMessage(null);

    try {
      await updateMemberApprovalStatus(
        memberId,
        status,
      );

      onStatusChanged(memberId, status);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible actualizar el integrante.",
      );
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Solicitudes
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-950">
            Integrantes pendientes
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            Aprueba o rechaza las cuentas nuevas.
          </p>
        </div>

        <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
          {members.length}{" "}
          {members.length === 1
            ? "pendiente"
            : "pendientes"}
        </span>
      </div>

      {errorMessage && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

            <p className="text-sm text-red-700">
              {errorMessage}
            </p>
          </div>
        </div>
      )}

      {members.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-emerald-50 p-6 text-center">
          <CheckCircle2 className="mx-auto h-9 w-9 text-emerald-600" />

          <p className="mt-3 font-semibold text-emerald-900">
            No hay solicitudes pendientes
          </p>

          <p className="mt-1 text-sm text-emerald-700">
            Las nuevas cuentas aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {members.map((member) => {
            const isProcessing =
              processingId === member.id;

            return (
              <article
                key={member.id}
                className="rounded-2xl border border-slate-200 p-5"
              >
                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                  <div>
                    <h3 className="text-lg font-bold text-slate-950">
                      {getFullName(member)}
                    </h3>

                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="h-4 w-4" />

                      <span>
                        {member.email ||
                          "Correo no registrado"}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {member.voice && (
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          {member.voice}
                        </span>
                      )}

                      {member.phone && (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {member.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() =>
                        void handleStatusChange(
                          member.id,
                          "Activo",
                        )
                      }
                      className="flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isProcessing ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <UserCheck className="h-4 w-4" />
                      )}

                      Aprobar
                    </button>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() =>
                        void handleStatusChange(
                          member.id,
                          "Inactivo",
                        )
                      }
                      className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isProcessing ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <UserX className="h-4 w-4" />
                      )}

                      Rechazar
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}