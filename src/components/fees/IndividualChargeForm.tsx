"use client";

import {
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  TriangleAlert,
} from "lucide-react";

import {
  createCharge,
  type FeeType,
} from "@/services/feeService";
import AccessDenied from "@/components/auth/AccessDenied";
import VivaceLoading from "@/components/ui/VivaceLoading";
import type { Member } from "@/types/member";

import {
  INITIAL_CHARGE_FORM_DATA,
  type ChargeAccessProps,
  type ChargeFormData,
} from "./chargeForm.types";

interface IndividualChargeFormProps extends ChargeAccessProps {
  activeMembers: Member[];
  isLoadingMembers: boolean;
  membersError: string | null;
  feeTypes: FeeType[];
  isLoadingFeeTypes: boolean;
  feeTypesError: string | null;
  onBack: () => void;
  onClose: () => void;
  onChargeCreated: () => void;
}

export default function IndividualChargeForm({
  activeMembers,
  isLoadingMembers,
  membersError,
  feeTypes,
  isLoadingFeeTypes,
  feeTypesError,
  onBack,
  onClose,
  onChargeCreated,
  canManageFees,
  isLoadingAccess,
  accessError,
}: IndividualChargeFormProps) {
  const [formData, setFormData] =
    useState<ChargeFormData>(
      INITIAL_CHARGE_FORM_DATA,
    );

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [submitError, setSubmitError] =
    useState<string | null>(null);

  const [isSuccess, setIsSuccess] =
    useState(false);

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

    if (submitError) {
      setSubmitError(null);
    }

    if (isSuccess) {
      setIsSuccess(false);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isLoadingAccess || !canManageFees) {
      setSubmitError(
        "No cuentas con permisos para crear cargos.",
      );
      return;
    }

    if (isSubmitting) {
      return;
    }

    const memberId = Number(formData.memberId);
    const amount = Number(formData.amount);

    if (
      !formData.memberId ||
      !Number.isFinite(memberId)
    ) {
      setSubmitError(
        "Selecciona un integrante válido.",
      );
      return;
    }

    if (!formData.feeTypeId) {
      setSubmitError(
        "Selecciona un tipo de cuota.",
      );
      return;
    }

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setSubmitError(
        "El monto debe ser mayor que cero.",
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      setIsSuccess(false);

      await createCharge({
  member_id: memberId,
  fee_type_id: formData.feeTypeId,
  amount,
  billing_period: formData.billingPeriod
    ? `${formData.billingPeriod}-01`
    : null,
  due_date: formData.dueDate || null,
  notes: formData.notes.trim() || null,
});

      setFormData(INITIAL_CHARGE_FORM_DATA);
setIsSuccess(true);

onChargeCreated();
onClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "No fue posible crear el cargo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const membersUnavailable =
    isLoadingMembers ||
    Boolean(membersError) ||
    activeMembers.length === 0;

  const feeTypesUnavailable =
    isLoadingFeeTypes ||
    Boolean(feeTypesError) ||
    feeTypes.length === 0;

  const formUnavailable =
    isLoadingAccess ||
    !canManageFees ||
    membersUnavailable ||
    feeTypesUnavailable ||
    isSubmitting;

  if (isLoadingAccess) {
    return (
      <VivaceLoading
        message="Verificando permisos..."
        className="min-h-64 rounded-none border-0 shadow-none"
      />
    );
  }

  if (!canManageFees) {
    return (
      <AccessDenied
        title="Acceso denegado"
        description={
          accessError ||
          "No cuentas con permisos para crear cargos."
        }
        showBackButton={false}
        className="min-h-64"
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 p-6"
    >
      <button
        type="button"
        onClick={onBack}
        disabled={isSubmitting}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ArrowLeft className="h-4 w-4" />
        Cambiar tipo de cargo
      </button>

      {isSuccess && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4"
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

          <div>
            <p className="text-sm font-semibold text-emerald-900">
              Cargo creado correctamente
            </p>

            <p className="mt-1 text-sm text-emerald-700">
              El cargo fue registrado en la cuenta del integrante.
            </p>
          </div>
        </div>
      )}

      {submitError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4"
        >
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

          <div>
            <p className="text-sm font-semibold text-red-900">
              No fue posible crear el cargo
            </p>

            <p className="mt-1 text-sm text-red-700">
              {submitError}
            </p>
          </div>
        </div>
      )}

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-700">
          Integrante
        </span>

        <div className="relative">
          <select
            name="memberId"
            value={formData.memberId}
            onChange={handleChange}
            disabled={
              membersUnavailable ||
              isSubmitting
            }
            required
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
          >
            <option value="">
              {isLoadingMembers
                ? "Cargando integrantes..."
                : activeMembers.length === 0
                  ? "No hay integrantes activos"
                  : "Selecciona un integrante"}
            </option>

            {activeMembers.map((member) => (
              <option
                key={member.id}
                value={member.id}
              >
                {member.name} {member.last_name}
              </option>
            ))}
          </select>

          {isLoadingMembers && (
            <LoaderCircle className="pointer-events-none absolute right-4 top-3.5 h-5 w-5 animate-spin text-slate-400" />
          )}
        </div>

        {membersError && (
          <p className="text-sm text-red-600">
            {membersError}
          </p>
        )}
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-700">
          Tipo de cuota
        </span>

        <div className="relative">
          <select
            name="feeTypeId"
            value={formData.feeTypeId}
            onChange={handleChange}
            disabled={
              feeTypesUnavailable ||
              isSubmitting
            }
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
            Monto
          </span>

          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            disabled={isSubmitting}
            min="0.01"
            step="0.01"
            placeholder="0.00"
            required
            className="min-h-11 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-base sm:text-sm text-slate-900 outline-none transition focus:border-slate-500 disabled:cursor-not-allowed disabled:bg-slate-100"
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
            disabled={isSubmitting}
            className="min-h-11 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-base sm:text-sm text-slate-900 outline-none transition focus:border-slate-500 disabled:cursor-not-allowed disabled:bg-slate-100"
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
          disabled={isSubmitting}
          className="min-h-11 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-base sm:text-sm text-slate-900 outline-none transition focus:border-slate-500 disabled:cursor-not-allowed disabled:bg-slate-100"
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
          disabled={isSubmitting}
          rows={4}
          placeholder="Agrega observaciones opcionales..."
          className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 disabled:cursor-not-allowed disabled:bg-slate-100"
        />
      </label>

      <footer className="flex justify-end gap-3 border-t border-slate-200 pt-5">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSuccess ? "Cerrar" : "Cancelar"}
        </button>

        <button
          type="submit"
          disabled={formUnavailable}
          className="inline-flex min-w-32 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSubmitting && (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          )}

          {isSubmitting
            ? "Creando..."
            : "Crear cargo"}
        </button>
      </footer>
    </form>
  );
}
