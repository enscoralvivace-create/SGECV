"use client";

import { UserRound, UsersRound } from "lucide-react";

import type { ChargeScopeSelectorProps } from "./chargeForm.types";

export default function ChargeScopeSelector({
  onSelect,
  canManageFees,
  isLoadingAccess,
}: ChargeScopeSelectorProps) {
  if (isLoadingAccess) {
    return (
      <section className="space-y-5 p-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            ¿Qué deseas crear?
          </h3>

          <p className="mt-1 text-sm text-slate-600">
            Verificando permisos...
          </p>
        </div>
      </section>
    );
  }

  if (!canManageFees) {
    return (
      <section className="space-y-5 p-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Acceso denegado
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            No cuentas con permisos para crear cargos.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5 p-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          ¿Qué deseas crear?
        </h3>

        <p className="mt-1 text-sm text-slate-600">
          Selecciona una opción para continuar.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={() => onSelect("individual")}
          className="group rounded-2xl border border-slate-200 p-5 text-left transition hover:border-slate-400 hover:bg-slate-50 hover:shadow-sm"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-slate-900 group-hover:text-white">
            <UserRound className="h-5 w-5" />
          </div>

          <h4 className="mt-4 font-semibold text-slate-900">
            Cargo individual
          </h4>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Asigna una cuota o concepto de cobro a un solo integrante.
          </p>
        </button>

        <button
          type="button"
          onClick={() => onSelect("group")}
          className="group rounded-2xl border border-slate-200 p-5 text-left transition hover:border-slate-400 hover:bg-slate-50 hover:shadow-sm"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-slate-900 group-hover:text-white">
            <UsersRound className="h-5 w-5" />
          </div>

          <h4 className="mt-4 font-semibold text-slate-900">
            Cargo grupal
          </h4>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Genera el mismo cargo para todos los integrantes activos.
          </p>
        </button>
      </div>

      <div className="flex justify-end border-t border-slate-200 pt-5">
        <p className="text-sm text-slate-500">
          Podrás regresar a esta pantalla antes de guardar.
        </p>
      </div>
    </section>
  );
}
