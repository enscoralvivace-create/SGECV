"use client";

import {
  BarChart3,
  CreditCard,
  Pencil,
  Power,
  UserRound,
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
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white px-4 py-14 text-center shadow-sm sm:rounded-3xl sm:px-6 sm:py-16">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-emerald-800" />

        <p className="mt-4 font-medium text-slate-600">
          Cargando integrantes...
        </p>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center shadow-sm sm:rounded-3xl">
        <UserRound className="mx-auto h-10 w-10 text-slate-400" />

        <p className="mt-4 font-semibold text-slate-800">
          {search.trim()
            ? "No se encontraron integrantes"
            : "Todavía no hay integrantes registrados"}
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {search.trim()
            ? "Prueba con otro nombre, voz, correo o teléfono."
            : "Los integrantes registrados aparecerán en esta sección."}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">
      <div className="space-y-3 p-3 md:hidden">
        {members.map((member) => {
          const isProcessing =
            processingId === member.id;

          const isDeactivated =
            member.status.toLowerCase() ===
            "baja definitiva";

          return (
            <article
              key={member.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-base font-bold text-slate-950">
                    {getFullName(member)}
                  </h3>

                  <p className="mt-1 truncate text-sm font-medium text-emerald-800">
                    {member.voice ||
                      "Sin voz o función"}
                  </p>
                </div>

                <StatusBadge
                  status={member.status}
                  className="shrink-0 text-xs"
                />
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="min-w-0 rounded-xl bg-slate-50 p-3">
                  <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Teléfono
                  </dt>

                  <dd className="mt-1 truncate font-medium text-slate-800">
                    {member.phone ||
                      "Sin registrar"}
                  </dd>
                </div>

                <div className="min-w-0 rounded-xl bg-slate-50 p-3">
                  <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Ingreso
                  </dt>

                  <dd className="mt-1 truncate font-medium text-slate-800">
                    {formatDate(
                      member.join_date,
                    )}
                  </dd>
                </div>
              </dl>

              <p
                className="mt-3 truncate text-sm text-slate-600"
                title={
                  member.email ??
                  undefined
                }
              >
                {member.email ||
                  "Correo sin registrar"}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <ActionButton
                  label="Estadísticas"
                  icon={BarChart3}
                  onClick={() =>
                    onStatistics(member)
                  }
                  disabled={isProcessing}
                  tone="violet"
                />

                <ActionButton
                  label="Editar"
                  icon={Pencil}
                  onClick={() =>
                    onEdit(member)
                  }
                  disabled={isProcessing}
                  tone="emerald"
                />

                <ActionButton
                  label="Estado de cuenta"
                  icon={CreditCard}
                  onClick={() =>
                    onAccountStatement(
                      member,
                    )
                  }
                  disabled={isProcessing}
                  tone="sky"
                />

                <ActionButton
                  label={
                    isProcessing
                      ? "Procesando..."
                      : isDeactivated
                        ? "Reactivar"
                        : "Dar de baja"
                  }
                  icon={Power}
                  onClick={() =>
                    onToggleStatus(member)
                  }
                  disabled={isProcessing}
                  tone="amber"
                />
              </div>
            </article>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[1160px] text-left">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-5 py-4">
                Nombre
              </th>
              <th className="px-5 py-4">
                Voz o función
              </th>
              <th className="px-5 py-4">
                Teléfono
              </th>
              <th className="px-5 py-4">
                Correo
              </th>
              <th className="px-5 py-4">
                Ingreso
              </th>
              <th className="px-5 py-4">
                Estado
              </th>
              <th className="px-5 py-4">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {members.map((member) => {
              const isProcessing =
                processingId === member.id;

              const isDeactivated =
                member.status.toLowerCase() ===
                "baja definitiva";

              return (
                <tr
                  key={member.id}
                  className="transition hover:bg-emerald-50/30"
                >
                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {getFullName(member)}
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {member.voice ||
                      "Sin registrar"}
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {member.phone ||
                      "Sin registrar"}
                  </td>

                  <td className="max-w-[240px] truncate px-5 py-4 text-slate-600">
                    {member.email ||
                      "Sin registrar"}
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {formatDate(
                      member.join_date,
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge
                      status={member.status}
                      className="text-sm"
                    />
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                      <button
                        type="button"
                        onClick={() =>
                          onStatistics(member)
                        }
                        disabled={isProcessing}
                        className="font-semibold text-violet-700 transition hover:text-violet-900 disabled:opacity-50"
                      >
                        Estadísticas
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onEdit(member)
                        }
                        disabled={isProcessing}
                        className="font-semibold text-emerald-700 transition hover:text-emerald-900 disabled:opacity-50"
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
                        disabled={isProcessing}
                        className="font-semibold text-sky-700 transition hover:text-sky-900 disabled:opacity-50"
                      >
                        Estado de cuenta
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onToggleStatus(member)
                        }
                        disabled={isProcessing}
                        className="font-semibold text-amber-700 transition hover:text-amber-900 disabled:opacity-50"
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
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface ActionButtonProps {
  label: string;
  icon: typeof BarChart3;
  onClick: () => void;
  disabled: boolean;
  tone:
    | "violet"
    | "emerald"
    | "sky"
    | "amber";
}

const ACTION_TONES:
Record<ActionButtonProps["tone"], string> = {
  violet:
    "border-violet-200 bg-violet-50 text-violet-800",
  emerald:
    "border-emerald-200 bg-emerald-50 text-emerald-800",
  sky:
    "border-sky-200 bg-sky-50 text-sky-800",
  amber:
    "border-amber-200 bg-amber-50 text-amber-800",
};

function ActionButton({
  label,
  icon: Icon,
  onClick,
  disabled,
  tone,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
        ACTION_TONES[tone],
      ].join(" ")}
    >
      <Icon className="h-4 w-4" />
      <span className="truncate">
        {label}
      </span>
    </button>
  );
}
