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

function getFullName(
  member: Member,
): string {
  return [
    member.name,
    member.last_name,
  ]
    .filter(Boolean)
    .join(" ");
}

export default function PendingMembersCard({
  members,
  onStatusChanged,
}: PendingMembersCardProps) {
  const [
    processingId,
    setProcessingId,
  ] = useState<number | null>(
    null,
  );

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(
    null,
  );

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

      onStatusChanged(
        memberId,
        status,
      );
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
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700 sm:text-sm sm:tracking-wide">
            Solicitudes
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-950 sm:text-2xl">
            Integrantes pendientes
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            Aprueba o rechaza las cuentas nuevas.
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 sm:text-sm">
          {members.length}
        </span>
      </div>

      {errorMessage ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <div className="flex items-start gap-3">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />

            <p className="text-sm leading-6 text-rose-700">
              {errorMessage}
            </p>
          </div>
        </div>
      ) : null}

      {members.length === 0 ? (
        <div className="mt-4 rounded-2xl bg-emerald-50 p-5 text-center sm:mt-6 sm:p-6">
          <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600 sm:h-9 sm:w-9" />

          <p className="mt-3 font-semibold text-emerald-900">
            No hay solicitudes pendientes
          </p>

          <p className="mt-1 text-sm text-emerald-700">
            Las nuevas cuentas aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:mt-6 lg:grid-cols-2">
          {members.map((member) => {
            const isProcessing =
              processingId === member.id;

            return (
              <article
                key={member.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
              >
                <h3 className="truncate text-base font-bold text-slate-950 sm:text-lg">
                  {getFullName(member)}
                </h3>

                <div className="mt-2 flex min-w-0 items-center gap-2 text-sm text-slate-600">
                  <Mail className="h-4 w-4 shrink-0" />

                  <span
                    className="truncate"
                    title={
                      member.email ??
                      undefined
                    }
                  >
                    {member.email ||
                      "Correo no registrado"}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {member.voice ? (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {member.voice}
                    </span>
                  ) : null}

                  {member.phone ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {member.phone}
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() =>
                      void handleStatusChange(
                        member.id,
                        "Activo",
                      )
                    }
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-3 py-2.5 text-sm font-semibold text-white transition active:scale-[0.98] hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
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
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 py-2.5 text-sm font-semibold text-slate-700 transition active:scale-[0.98] hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isProcessing ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <UserX className="h-4 w-4" />
                    )}

                    Rechazar
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
