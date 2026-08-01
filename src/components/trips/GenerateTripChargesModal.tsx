"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  CircleDollarSign,
  LoaderCircle,
  TriangleAlert,
  X,
} from "lucide-react";

import type {
  FeeType,
} from "@/services/feeService";

export interface GenerateTripChargesFormData {
  feeTypeId: string;
  amount: number;
  billingPeriod: string | null;
  dueDate: string | null;
  notes: string | null;
}

interface GenerateTripChargesModalProps {
  tripName: string;
  confirmedParticipantsCount: number;
  feeTypes: FeeType[];
  loadingFeeTypes: boolean;
  feeTypesError: string | null;
  submitting: boolean;
  onClose: () => void;
  onRetryFeeTypes?: () => void;
  onSubmit: (
    formData: GenerateTripChargesFormData,
  ) => Promise<void>;
}

function formatCurrency(
  value: number,
): string {
  return new Intl.NumberFormat(
    "es-MX",
    {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    },
  ).format(value);
}

function getErrorMessage(
  error: unknown,
): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "No fue posible generar los cargos.";
}

export default function GenerateTripChargesModal({
  tripName,
  confirmedParticipantsCount,
  feeTypes,
  loadingFeeTypes,
  feeTypesError,
  submitting,
  onClose,
  onRetryFeeTypes,
  onSubmit,
}: GenerateTripChargesModalProps) {
  const tripFeeTypes = useMemo(
    () =>
      feeTypes.filter(
        (feeType) =>
          feeType.category === "Viaje",
      ),
    [feeTypes],
  );

  const [feeTypeId, setFeeTypeId] =
    useState("");
  const [amount, setAmount] =
    useState("");
  const [
    billingPeriod,
    setBillingPeriod,
  ] = useState("");
  const [dueDate, setDueDate] =
    useState("");
  const [notes, setNotes] =
    useState("");
  const [formError, setFormError] =
    useState<string | null>(null);

  const numericAmount =
    Number(amount);

  const totalAmount =
    Number.isFinite(numericAmount) &&
    numericAmount > 0
      ? numericAmount *
        confirmedParticipantsCount
      : 0;

  function handleFeeTypeChange(
    value: string,
  ) {
    setFeeTypeId(value);
    setFormError(null);

    const selectedFeeType =
      tripFeeTypes.find(
        (feeType) =>
          feeType.id === value,
      );

    if (
      selectedFeeType?.default_amount !==
      null &&
      selectedFeeType?.default_amount !==
      undefined
    ) {
      setAmount(
        String(
          selectedFeeType.default_amount,
        ),
      );
    }
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setFormError(null);

    if (
      confirmedParticipantsCount === 0
    ) {
      setFormError(
        "El viaje no tiene participantes confirmados.",
      );
      return;
    }

    if (!feeTypeId) {
      setFormError(
        "Selecciona un tipo de cuota.",
      );
      return;
    }

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      setFormError(
        "Ingresa un monto válido mayor que cero.",
      );
      return;
    }

    try {
      await onSubmit({
        feeTypeId,
        amount: numericAmount,
        billingPeriod:
          billingPeriod.trim() || null,
        dueDate: dueDate || null,
        notes: notes.trim() || null,
      });
    } catch (error) {
      setFormError(
        getErrorMessage(error),
      );
    }
  }

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-slate-950/60 p-4
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="generate-trip-charges-title"
    >
      <div
        className="
          max-h-[calc(100dvh-var(--safe-top))] sm:max-h-[90vh] w-full
          max-w-2xl overflow-y-auto
          rounded-2xl bg-white
          shadow-2xl
        "
      >
        <div
          className="
            flex items-start
            justify-between gap-4
            border-b border-slate-200
            px-6 py-5
          "
        >
          <div>
            <div
              className="
                flex items-center gap-3
              "
            >
              <div
                className="
                  flex h-10 w-10
                  items-center justify-center
                  rounded-xl bg-emerald-100
                "
              >
                <CircleDollarSign
                  aria-hidden="true"
                  className="
                    h-5 w-5
                    text-emerald-700
                  "
                />
              </div>

              <div>
                <h2
                  id="generate-trip-charges-title"
                  className="
                    text-xl font-bold
                    text-slate-950
                  "
                >
                  Generar cargos del viaje
                </h2>

                <p
                  className="
                    mt-1 text-sm
                    text-slate-600
                  "
                >
                  {tripName}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Cerrar"
            className="
              rounded-lg p-2
              text-slate-500
              transition-colors
              hover:bg-slate-100
              hover:text-slate-800
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <X
              aria-hidden="true"
              className="h-5 w-5"
            />
          </button>
        </div>

        {loadingFeeTypes ? (
          <div
            className="
              flex min-h-72
              flex-col items-center
              justify-center gap-3
              px-6 py-10
            "
          >
            <LoaderCircle
              aria-hidden="true"
              className="
                h-7 w-7 animate-spin
                text-emerald-700
              "
            />

            <p
              className="
                text-sm font-medium
                text-slate-600
              "
            >
              Cargando tipos de cuota...
            </p>
          </div>
        ) : feeTypesError ? (
          <div
            className="
              flex min-h-72
              flex-col items-center
              justify-center gap-4
              px-6 py-10 text-center
            "
          >
            <TriangleAlert
              aria-hidden="true"
              className="
                h-8 w-8 text-red-700
              "
            />

            <div>
              <p
                className="
                  font-semibold
                  text-slate-900
                "
              >
                No fue posible cargar
                los tipos de cuota
              </p>

              <p
                className="
                  mt-1 text-sm
                  text-red-700
                "
              >
                {feeTypesError}
              </p>
            </div>

            {onRetryFeeTypes ? (
              <button
                type="button"
                onClick={onRetryFeeTypes}
                className="
                  rounded-lg
                  bg-slate-900 px-4 py-2
                  text-sm font-semibold
                  text-white
                  hover:bg-slate-800
                "
              >
                Intentar nuevamente
              </button>
            ) : null}
          </div>
        ) : tripFeeTypes.length === 0 ? (
          <div
            className="
              flex min-h-72
              flex-col items-center
              justify-center gap-3
              px-6 py-10 text-center
            "
          >
            <TriangleAlert
              aria-hidden="true"
              className="
                h-8 w-8 text-amber-600
              "
            />

            <p
              className="
                font-semibold
                text-slate-900
              "
            >
              No hay tipos de cuota
              de viaje activos
            </p>

            <p
              className="
                max-w-md text-sm
                leading-6 text-slate-600
              "
            >
              Crea o activa un tipo de cuota
              con categoría “Viaje” antes de
              generar los cargos.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="px-6 py-6"
          >
            <div
              className="
                rounded-xl border
                border-emerald-200
                bg-emerald-50 p-4
              "
            >
              <p
                className="
                  text-sm font-semibold
                  text-emerald-900
                "
              >
                Participantes confirmados
              </p>

              <p
                className="
                  mt-1 text-3xl font-bold
                  text-emerald-950
                "
              >
                {confirmedParticipantsCount}
              </p>

              <p
                className="
                  mt-2 text-xs
                  leading-5 text-emerald-800
                "
              >
                Solo se crearán cargos para
                participantes con estado
                confirmado. Los cargos
                existentes del mismo concepto
                serán omitidos automáticamente.
              </p>
            </div>

            <div
              className="
                mt-6 grid gap-5
                sm:grid-cols-2
              "
            >
              <label
                className="
                  sm:col-span-2
                "
              >
                <span
                  className="
                    text-sm font-semibold
                    text-slate-800
                  "
                >
                  Tipo de cuota *
                </span>

                <select
                  value={feeTypeId}
                  disabled={submitting}
                  onChange={(event) => {
                    handleFeeTypeChange(
                      event.target.value,
                    );
                  }}
                  className="
                    mt-2 w-full
                    rounded-lg border
                    border-slate-300
                    bg-white px-3 py-2.5
                    text-sm text-slate-900
                    outline-none
                    focus:border-emerald-500
                    focus:ring-2
                    focus:ring-emerald-200
                    disabled:bg-slate-100
                  "
                >
                  <option value="">
                    Selecciona un concepto
                  </option>

                  {tripFeeTypes.map(
                    (feeType) => (
                      <option
                        key={feeType.id}
                        value={feeType.id}
                      >
                        {feeType.name}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label>
                <span
                  className="
                    text-sm font-semibold
                    text-slate-800
                  "
                >
                  Monto por participante *
                </span>

                <div className="relative mt-2">
                  <span
                    className="
                      pointer-events-none
                      absolute inset-y-0
                      left-3 flex
                      items-center
                      text-slate-500
                    "
                  >
                    $
                  </span>

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amount}
                    disabled={submitting}
                    onChange={(event) => {
                      setAmount(
                        event.target.value,
                      );
                      setFormError(null);
                    }}
                    placeholder="0.00"
                    className="
                      w-full rounded-lg
                      border border-slate-300
                      py-2.5 pl-8 pr-3
                      text-sm text-slate-900
                      outline-none
                      focus:border-emerald-500
                      focus:ring-2
                      focus:ring-emerald-200
                      disabled:bg-slate-100
                    "
                  />
                </div>
              </label>

              <label>
                <span
                  className="
                    text-sm font-semibold
                    text-slate-800
                  "
                >
                  Periodo de cobro
                </span>

                <input
                  type="text"
                  value={billingPeriod}
                  disabled={submitting}
                  onChange={(event) => {
                    setBillingPeriod(
                      event.target.value,
                    );
                  }}
                  placeholder="Ej. Septiembre 2026"
                  className="
                    mt-2 w-full
                    rounded-lg border
                    border-slate-300
                    px-3 py-2.5
                    text-sm text-slate-900
                    outline-none
                    focus:border-emerald-500
                    focus:ring-2
                    focus:ring-emerald-200
                    disabled:bg-slate-100
                  "
                />
              </label>

              <label>
                <span
                  className="
                    text-sm font-semibold
                    text-slate-800
                  "
                >
                  Fecha límite
                </span>

                <div className="relative mt-2">
                  <CalendarDays
                    aria-hidden="true"
                    className="
                      pointer-events-none
                      absolute left-3 top-1/2
                      h-4 w-4
                      -translate-y-1/2
                      text-slate-500
                    "
                  />

                  <input
                    type="date"
                    value={dueDate}
                    disabled={submitting}
                    onChange={(event) => {
                      setDueDate(
                        event.target.value,
                      );
                    }}
                    className="
                      w-full rounded-lg
                      border border-slate-300
                      py-2.5 pl-10 pr-3
                      text-sm text-slate-900
                      outline-none
                      focus:border-emerald-500
                      focus:ring-2
                      focus:ring-emerald-200
                      disabled:bg-slate-100
                    "
                  />
                </div>
              </label>

              <label
                className="
                  sm:col-span-2
                "
              >
                <span
                  className="
                    text-sm font-semibold
                    text-slate-800
                  "
                >
                  Notas
                </span>

                <textarea
                  rows={3}
                  value={notes}
                  disabled={submitting}
                  onChange={(event) => {
                    setNotes(
                      event.target.value,
                    );
                  }}
                  placeholder="Información adicional del cargo..."
                  className="
                    mt-2 w-full resize-none
                    rounded-lg border
                    border-slate-300
                    px-3 py-2.5
                    text-sm text-slate-900
                    outline-none
                    focus:border-emerald-500
                    focus:ring-2
                    focus:ring-emerald-200
                    disabled:bg-slate-100
                  "
                />
              </label>
            </div>

            <div
              className="
                mt-6 rounded-xl
                border border-slate-200
                bg-slate-50 p-4
              "
            >
              <div
                className="
                  flex items-center
                  justify-between gap-4
                "
              >
                <span
                  className="
                    text-sm font-medium
                    text-slate-600
                  "
                >
                  Cargos a procesar
                </span>

                <span
                  className="
                    font-bold
                    text-slate-950
                  "
                >
                  {confirmedParticipantsCount}
                </span>
              </div>

              <div
                className="
                  mt-3 flex items-center
                  justify-between gap-4
                  border-t border-slate-200
                  pt-3
                "
              >
                <span
                  className="
                    text-sm font-semibold
                    text-slate-800
                  "
                >
                  Total estimado
                </span>

                <span
                  className="
                    text-xl font-bold
                    text-emerald-800
                  "
                >
                  {formatCurrency(
                    totalAmount,
                  )}
                </span>
              </div>
            </div>

            {formError ? (
              <div
                className="
                  mt-5 flex gap-3
                  rounded-lg border
                  border-red-200
                  bg-red-50 p-3
                  text-sm text-red-800
                "
              >
                <TriangleAlert
                  aria-hidden="true"
                  className="
                    mt-0.5 h-4 w-4
                    shrink-0
                  "
                />

                <p>{formError}</p>
              </div>
            ) : null}

            <div
              className="
                mt-6 flex flex-col-reverse
                gap-3 border-t
                border-slate-200 pt-5
                sm:flex-row
                sm:justify-end
              "
            >
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="
                  rounded-lg border
                  border-slate-300
                  px-4 py-2.5
                  text-sm font-semibold
                  text-slate-700
                  transition-colors
                  hover:bg-slate-50
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={
                  submitting ||
                  confirmedParticipantsCount ===
                    0
                }
                className="
                  inline-flex items-center
                  justify-center gap-2
                  rounded-lg
                  bg-emerald-700
                  px-4 py-2.5
                  text-sm font-semibold
                  text-white
                  transition-colors
                  hover:bg-emerald-800
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {submitting ? (
                  <LoaderCircle
                    aria-hidden="true"
                    className="
                      h-4 w-4
                      animate-spin
                    "
                  />
                ) : (
                  <CircleDollarSign
                    aria-hidden="true"
                    className="h-4 w-4"
                  />
                )}

                {submitting
                  ? "Generando cargos..."
                  : "Generar cargos"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}