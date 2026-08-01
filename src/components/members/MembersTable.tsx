"use client";

import {
  BarChart3,
} from "lucide-react";

import StatusBadge from "@/components/common/StatusBadge";

import type {
  Member,
} from "@/types/member";

interface MembersTableProps {
  members: Member[];
  search: string;
  isLoading: boolean;
  processingId: number | null;
  onEdit: (member: Member) => void;
  onStatistics: (member: Member) => void;
  onAccountStatement: (member: Member) => void;
  onToggleStatus: (member: Member) => void;
}

function formatDate(
  date: string | null,
): string {
  if (!date) {
    return "Sin registrar";
  }

  const [
    year,
    month,
    day,
  ] = date.split("-");

  if (
    !year ||
    !month ||
    !day
  ) {
    return date;
  }

  return `${day}/${month}/${year}`;
}

export default function MembersTable({
  members,
  search,
  isLoading,
  processingId,
  onEdit,
  onStatistics,
  onAccountStatement,
  onToggleStatus,
}: MembersTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {isLoading ? (
        <div className="px-6 py-16 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-emerald-800" />

          <p className="mt-4 font-medium text-slate-600">
            Cargando integrantes...
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1260px] text-left">
            <thead className="bg-slate-50 text-sm uppercase text-slate-600">
              <tr>
                <th className="px-6 py-4">
                  Nombre
                </th>

                <th className="px-6 py-4">
                  Voz o función
                </th>

                <th className="px-6 py-4">
                  Teléfono
                </th>

                <th className="px-6 py-4">
                  Correo
                </th>

                <th className="px-6 py-4">
                  Ingreso
                </th>

                <th className="px-6 py-4">
                  Estado
                </th>

                <th className="px-6 py-4">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {members.map(
                (member) => {
                  const isProcessing =
                    processingId ===
                    member.id;

                  const isDeactivated =
                    member.status.toLowerCase() ===
                    "baja definitiva";

                  const fullName = [
                    member.name,
                    member.last_name,
                  ]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <tr
                      key={member.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {fullName}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {member.voice ||
                          "Sin registrar"}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {member.phone ||
                          "Sin registrar"}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {member.email ||
                          "Sin registrar"}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {formatDate(
                          member.join_date,
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge
                          status={
                            member.status
                          }
                          className="text-sm"
                        />
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                          <button
                            type="button"
                            onClick={() =>
                              onStatistics(
                                member,
                              )
                            }
                            disabled={
                              isProcessing
                            }
                            className="inline-flex items-center gap-1.5 font-semibold text-violet-700 transition hover:text-violet-900 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <BarChart3 className="h-4 w-4" />

                            Estadísticas
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              onEdit(
                                member,
                              )
                            }
                            disabled={
                              isProcessing
                            }
                            className="font-semibold text-emerald-700 transition hover:text-emerald-900 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              onAccountStatement(
                                member,
                              )
                            }
                            disabled={
                              isProcessing
                            }
                            className="font-semibold text-sky-700 transition hover:text-sky-900 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Estado de cuenta
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              onToggleStatus(
                                member,
                              )
                            }
                            disabled={
                              isProcessing
                            }
                            className="font-semibold text-amber-700 transition hover:text-amber-900 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isProcessing
                              ? "Procesando..."
                              : isDeactivated
                                ? "Reactivar"
                                : "Dar de baja"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                },
              )}

              {members.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-14 text-center text-slate-500"
                  >
                    {search.trim()
                      ? "No se encontraron integrantes con esa búsqueda."
                      : "Todavía no hay integrantes registrados."}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}