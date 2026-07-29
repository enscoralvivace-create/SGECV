"use client";

import {
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  ArrowLeft,
  LoaderCircle,
  UsersRound,
} from "lucide-react";

import type { FeeType } from "@/services/feeService";

import {
  INITIAL_CHARGE_FORM_DATA,
  type ChargeFormData,
} from "./chargeForm.types";

interface GroupChargeFormProps {
  activeMembersCount: number;
  isLoadingMembers: boolean;
  membersError: string | null;
  feeTypes: FeeType[];
  isLoadingFeeTypes: boolean;
  feeTypesError: string | null;
  onBack: () => void;
  onClose: () => void;
}

export default function GroupChargeForm({
  activeMembersCount,
  isLoadingMembers,
  membersError,
  feeTypes,
  isLoadingFeeTypes,
  feeTypesError,
  onBack,
  onClose,
}: GroupChargeFormProps) {
  const [formData, setFormData] =
    useState<ChargeFormData>(
      INITIAL_CHARGE_FORM_DATA,
    );

  function handleChange(
    event: ChangeEvent<
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement
    >,
  ) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    /*
     * Más adelante conectaremos aquí la creación
     * de un cargo para cada integrante activo.
     */
  }

  const membersUnavailable =
    isLoadingMembers ||
    Boolean(membersError) ||
    activeMembersCount === 0;

  const feeTypesUnavailable =
    isLoadingFeeTypes ||
    Boolean(feeTypesError) ||
    feeTypes.length === 0;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 p-6"
    >
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Cambiar tipo de cargo
      </button>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center gap-3">
          <UsersRound className="h-5 w-5 text-slate-500" />

          <div>
            <p className="text-sm font-semibold text-slate-900">
              Integrantes activos
            </p>

            <p className="text-sm text-slate-600">
              {isLoadingMembers
                ? "Contando integrantes..."
                : `Se crearán ${activeMembersCount} cargos individuales.`}
            </p>
          </div>
        </div>

        {membersError && (
          <p className="mt-3 text-sm text-red-600">
            {membersError}
          </p>
        )}
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-700">
          Tipo de cuota
        </span>

        <div className="relative">
          <select
            name="feeTypeId"
            value={formData.feeTypeId}
            onChange={handleChange}
            disabled={feeTypesUnavailable}
            required
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
          >
            <option value="">
              {isLoadingFeeTypes
                ? "Cargando conceptos..."
                : feeTypes.length === 0
                  ? "No hay conceptos disponibles"
                  : "Selecciona un concepto"}
            </option>

            {feeTypes.map((feeType) => (
              <option
                key={feeType.id}
                value={feeType.id}
              >
                {feeType.name}
              </option>
            ))}
          </select>

          {isLoadingFeeTypes && (
            <LoaderCircle className="pointer-events-none absolute right-4 top-3.5 h-5 w-5 animate-spin text-slate-400" />
          )}
        </div>

        {feeTypesError && (
          <p className="text-sm text-red-600">
            {feeTypesError}
          </p>
        )}
      </label>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">
            Monto por integrante
          </span>

          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            min="0.01"
            step="0.01"
            placeholder="0.00"
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">
            Fecha límite
          </span>

          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
          />
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-700">
          Periodo de cobro
        </span>

        <input
          type="month"
          name="billingPeriod"
          value={formData.billingPeriod}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-700">
          Notas
        </span>

        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={4}
          placeholder="Agrega observaciones opcionales..."
          className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
        />
      </label>

      <footer className="flex justify-end gap-3 border-t border-slate-200 pt-5">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={
            membersUnavailable ||
            feeTypesUnavailable
          }
          className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          Crear cargos grupales
        </button>
      </footer>
    </form>
  );
}