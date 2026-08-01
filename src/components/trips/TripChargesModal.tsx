"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  LoaderCircle,
  X,
} from "lucide-react";

import {
  getActiveFeeTypes,
  type FeeType,
} from "@/services/feeService";
import { createTripCharges } from "@/services/tripChargeService";
import { getTripMembers } from "@/services/tripMemberService";

import {
  emptyTripChargeForm,
  type TripChargeFormData,
} from "@/types/tripCharge";
import type { TripMemberListItem } from "@/types/tripMember";

interface TripChargesModalProps {
  tripId: string;
  tripName: string;
  onClose: () => void;
  onChargesCreated?: () => void;
}

export default function TripChargesModal({
  tripId,
  tripName,
  onClose,
  onChargesCreated,
}: TripChargesModalProps) {
  const [tripMembers, setTripMembers] =
    useState<TripMemberListItem[]>([]);
  const [feeTypes, setFeeTypes] =
    useState<FeeType[]>([]);

  const [selectedMemberIds, setSelectedMemberIds] =
    useState<number[]>([]);

  const [form, setForm] =
    useState<TripChargeFormData>(
      emptyTripChargeForm,
    );

  const [isLoading, setIsLoading] =
    useState(true);
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [loadError, setLoadError] =
    useState<string | null>(null);
  const [submitError, setSubmitError] =
    useState<string | null>(null);
  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setIsLoading(true);
        setLoadError(null);

        const [
          membersData,
          feeTypesData,
        ] = await Promise.all([
          getTripMembers(tripId),
          getActiveFeeTypes(),
        ]);

        if (!isMounted) {
          return;
        }

        setTripMembers(membersData);
        setFeeTypes(feeTypesData);

        const confirmedMemberIds =
          membersData
            .filter(
              (member) =>
                member.participationStatus ===
                "confirmed",
            )
            .map(
              (member) => member.memberId,
            );

        setSelectedMemberIds(
          confirmedMemberIds,
        );
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setLoadError(
          error instanceof Error
            ? error.message
            : "No fue posible cargar la información del viaje.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [tripId]);

  const confirmedMembers = useMemo(
    () =>
      tripMembers.filter(
        (member) =>
          member.participationStatus ===
          "confirmed",
      ),
    [tripMembers],
  );

  const areAllMembersSelected =
    confirmedMembers.length > 0 &&
    confirmedMembers.every((member) =>
      selectedMemberIds.includes(
        member.memberId,
      ),
    );

  function handleFormChange(
    field: keyof TripChargeFormData,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setSubmitError(null);
    setSuccessMessage(null);
  }

  function handleFeeTypeChange(
    feeTypeId: string,
  ) {
    const selectedFeeType =
      feeTypes.find(
        (feeType) =>
          feeType.id === feeTypeId,
      );

    setForm((current) => ({
      ...current,
      feeTypeId,
      amount:
        selectedFeeType?.default_amount != null
          ? String(
              selectedFeeType.default_amount,
            )
          : current.amount,
    }));

    setSubmitError(null);
    setSuccessMessage(null);
  }

  function handleMemberToggle(
    memberId: number,
  ) {
    setSelectedMemberIds((current) =>
      current.includes(memberId)
        ? current.filter(
            (id) => id !== memberId,
          )
        : [...current, memberId],
    );

    setSubmitError(null);
    setSuccessMessage(null);
  }

  function handleToggleAll() {
    if (areAllMembersSelected) {
      setSelectedMemberIds([]);
      return;
    }

    setSelectedMemberIds(
      confirmedMembers.map(
        (member) => member.memberId,
      ),
    );
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSubmitError(null);
    setSuccessMessage(null);

    const amount = Number(form.amount);

    if (!form.feeTypeId) {
      setSubmitError(
        "Selecciona un concepto de cuota.",
      );
      return;
    }

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setSubmitError(
        "Ingresa un monto válido mayor que cero.",
      );
      return;
    }

    if (selectedMemberIds.length === 0) {
      setSubmitError(
        "Selecciona al menos un participante.",
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const result =
        await createTripCharges({
          tripId,
          memberIds: selectedMemberIds,
          feeTypeId: form.feeTypeId,
          amount,
          dueDate:
            form.dueDate || null,
          notes:
            form.notes.trim() || null,
        });

      if (
  result.createdCount === 0 &&
  result.skippedCount > 0
) {
  setSuccessMessage(
    result.skippedCount === 1
      ? "El participante seleccionado ya tenía registrado este cargo."
      : `Los ${result.skippedCount} participantes seleccionados ya tenían registrado este cargo.`,
  );

  onChargesCreated?.();
  return;
}

if (result.createdCount === 0) {
  setSubmitError(
    "No fue posible crear ninguno de los cargos.",
  );
  return;
}

const createdText =
  result.createdCount === 1
    ? "1 cargo creado correctamente."
    : `${result.createdCount} cargos creados correctamente.`;

const skippedText =
  result.skippedCount === 1
    ? " 1 cargo duplicado fue omitido."
    : result.skippedCount > 1
      ? ` ${result.skippedCount} cargos duplicados fueron omitidos.`
      : "";

setSuccessMessage(
  `${createdText}${skippedText}`,
);

      onChargesCreated?.();
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "No fue posible crear los cargos del viaje.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 sm:items-center sm:p-4">
      <div className="max-h-[calc(100dvh-var(--safe-top))] w-full max-w-2xl overflow-y-auto rounded-t-3xl sm:max-h-[calc(100dvh-var(--safe-top))] sm:max-h-[90vh] sm:rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        <header className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Administración de viajes
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              Generar cargos
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              {tripName}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            disabled={isSubmitting}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center px-6 py-10">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <LoaderCircle className="h-5 w-5 animate-spin" />
              Cargando información...
            </div>
          </div>
        ) : loadError ? (
          <div className="px-6 py-8">
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {loadError}
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-6 px-6 py-6"
          >
            <section className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900">
                  Información del cargo
                </h3>

                <p className="mt-1 text-sm text-slate-600">
                  Selecciona el concepto, monto y fecha de vencimiento.
                </p>
              </div>

              <div>
                <label
                  htmlFor="trip-charge-fee-type"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Concepto de cuota
                </label>

                <select
                  id="trip-charge-fee-type"
                  value={form.feeTypeId}
                  onChange={(event) =>
                    handleFeeTypeChange(
                      event.target.value,
                    )
                  }
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 disabled:bg-slate-100"
                >
                  <option value="">
                    Selecciona un concepto
                  </option>

                  {feeTypes.map(
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

                {feeTypes.length === 0 && (
                  <p className="mt-2 text-sm text-amber-700">
                    No hay conceptos de cuota activos.
                  </p>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                <div>
                  <label
                    htmlFor="trip-charge-amount"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Monto por integrante
                  </label>

                  <input
                    id="trip-charge-amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.amount}
                    onChange={(event) =>
                      handleFormChange(
                        "amount",
                        event.target.value,
                      )
                    }
                    disabled={isSubmitting}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="trip-charge-due-date"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Fecha de vencimiento
                  </label>

                  <input
                    id="trip-charge-due-date"
                    type="date"
                    value={form.dueDate}
                    onChange={(event) =>
                      handleFormChange(
                        "dueDate",
                        event.target.value,
                      )
                    }
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 disabled:bg-slate-100"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="trip-charge-notes"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Notas
                </label>

                <textarea
                  id="trip-charge-notes"
                  rows={3}
                  value={form.notes}
                  onChange={(event) =>
                    handleFormChange(
                      "notes",
                      event.target.value,
                    )
                  }
                  disabled={isSubmitting}
                  placeholder="Información adicional del cargo..."
                  className="w-full resize-none rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 disabled:bg-slate-100"
                />
              </div>
            </section>

            <section className="space-y-4 border-t border-slate-200 pt-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-900">
                    Participantes confirmados
                  </h3>

                  <p className="mt-1 text-sm text-slate-600">
                    {selectedMemberIds.length} de{" "}
                    {confirmedMembers.length} seleccionados
                  </p>
                </div>

                {confirmedMembers.length > 0 && (
                  <button
                    type="button"
                    onClick={handleToggleAll}
                    disabled={isSubmitting}
                    className="text-sm font-semibold text-slate-700 transition hover:text-slate-950 disabled:opacity-50"
                  >
                    {areAllMembersSelected
                      ? "Deseleccionar todos"
                      : "Seleccionar todos"}
                  </button>
                )}
              </div>

              {confirmedMembers.length === 0 ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Este viaje todavía no tiene participantes confirmados.
                </div>
              ) : (
                <div className="max-h-64 space-y-2 overflow-y-auto rounded-2xl border border-slate-200 p-3">
                  {confirmedMembers.map(
                    (member) => {
                      const isSelected =
                        selectedMemberIds.includes(
                          member.memberId,
                        );

                      return (
                        <label
                          key={member.id}
                          className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-slate-50"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() =>
                              handleMemberToggle(
                                member.memberId,
                              )
                            }
                            disabled={isSubmitting}
                            className="h-4 w-4 rounded border-slate-300"
                          />

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-900">
                              {member.memberName}
                            </p>

                            <p className="text-xs text-slate-500">
                              {member.memberVoice ??
                                "Voz no registrada"}
                            </p>
                          </div>
                        </label>
                      );
                    },
                  )}
                </div>
              )}
            </section>

            {submitError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {submitError}
              </div>
            )}

            {successMessage && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {successMessage}
              </div>
            )}

            <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {successMessage
                  ? "Cerrar"
                  : "Cancelar"}
              </button>

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  confirmedMembers.length === 0 ||
                  feeTypes.length === 0
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting && (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                )}

                {isSubmitting
                  ? "Generando cargos..."
                  : `Generar ${selectedMemberIds.length} cargo(s)`}
              </button>
            </footer>
          </form>
        )}
      </div>
    </div>
  );
}