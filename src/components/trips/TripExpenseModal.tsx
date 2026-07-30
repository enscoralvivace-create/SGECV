"use client";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  X,
} from "lucide-react";

import type {
  TripExpenseCategory,
  TripExpenseFormData,
} from "@/types/tripExpense";

interface TripExpenseModalProps {
  isOpen: boolean;

  expense?: {
    description: string;
    category: TripExpenseCategory;
    amount: number;
    expenseDate: string;
    supplier: string | null;
    notes: string | null;
  } | null;

  isSaving: boolean;

  error: string | null;

  onClose: () => void;

  onSubmit: (
    form: TripExpenseFormData,
  ) => Promise<void>;
}

const EXPENSE_CATEGORIES:
  TripExpenseCategory[] = [
    "Hospedaje",
    "Transporte",
    "Alimentos",
    "Material",
    "Inscripción",
    "Logística",
    "Otro",
  ];

function getToday(): string {
  return new Date()
    .toISOString()
    .slice(0, 10);
}

function getInitialForm(
  expense:
    | TripExpenseModalProps["expense"]
    | undefined,
): TripExpenseFormData {
  return {
    description:
      expense?.description ?? "",

    category:
      expense?.category ??
      "Transporte",

    amount:
      expense
        ? String(expense.amount)
        : "",

    expenseDate:
      expense?.expenseDate ??
      getToday(),

    supplier:
      expense?.supplier ?? "",

    notes:
      expense?.notes ?? "",
  };
}

export default function TripExpenseModal({
  isOpen,
  expense,
  isSaving,
  error,
  onClose,
  onSubmit,
}: TripExpenseModalProps) {
  const [
    form,
    setForm,
  ] = useState<TripExpenseFormData>(
    getInitialForm(expense),
  );

  const [
    validationError,
    setValidationError,
  ] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setForm(getInitialForm(expense));
    setValidationError(null);
  }, [expense, isOpen]);

  if (!isOpen) {
    return null;
  }

  function updateField<
    Key extends keyof TripExpenseFormData,
  >(
    field: Key,
    value: TripExpenseFormData[Key],
  ): void {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setValidationError(null);

    if (!form.description.trim()) {
      setValidationError(
        "Escribe el concepto del gasto.",
      );
      return;
    }

    const amount = Number(form.amount);

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setValidationError(
        "El importe debe ser mayor que cero.",
      );
      return;
    }

    if (!form.expenseDate) {
      setValidationError(
        "Selecciona la fecha del gasto.",
      );
      return;
    }

    await onSubmit(form);
  }

  const modalTitle = expense
    ? "Editar gasto"
    : "Nuevo gasto";

  return (
    <div
      aria-labelledby="trip-expense-modal-title"
      aria-modal="true"
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-slate-950/50
        p-4
      "
      role="dialog"
    >
      <div
        className="
          max-h-[90vh]
          w-full
          max-w-2xl
          overflow-y-auto
          rounded-2xl
          bg-white
          shadow-xl
        "
      >
        <header
          className="
            flex
            items-start
            justify-between
            gap-4
            border-b
            border-slate-200
            px-6
            py-5
          "
        >
          <div>
            <h2
              id="trip-expense-modal-title"
              className="
                text-xl
                font-semibold
                text-slate-900
              "
            >
              {modalTitle}
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              Registra un egreso real asociado
              al viaje.
            </p>
          </div>

          <button
            aria-label="Cerrar"
            className="
              rounded-lg
              p-2
              text-slate-500
              transition-colors
              hover:bg-slate-100
              hover:text-slate-700
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
            disabled={isSaving}
            onClick={onClose}
            type="button"
          >
            <X
              aria-hidden="true"
              className="h-5 w-5"
            />
          </button>
        </header>

        <form
          className="space-y-5 px-6 py-5"
          onSubmit={(event) => {
            void handleSubmit(event);
          }}
        >
          <div>
            <label
              className="
                mb-1.5
                block
                text-sm
                font-medium
                text-slate-700
              "
              htmlFor="trip-expense-description"
            >
              Concepto
            </label>

            <input
              className="
                w-full
                rounded-lg
                border
                border-slate-300
                px-3
                py-2.5
                text-sm
                text-slate-900
                outline-none
                transition
                focus:border-slate-500
                focus:ring-2
                focus:ring-slate-200
              "
              id="trip-expense-description"
              maxLength={150}
              onChange={(event) => {
                updateField(
                  "description",
                  event.target.value,
                );
              }}
              placeholder="Ej. Anticipo de hospedaje"
              type="text"
              value={form.description}
            />
          </div>

          <div
            className="
              grid
              gap-5
              sm:grid-cols-2
            "
          >
            <div>
              <label
                className="
                  mb-1.5
                  block
                  text-sm
                  font-medium
                  text-slate-700
                "
                htmlFor="trip-expense-category"
              >
                Categoría
              </label>

              <select
                className="
                  w-full
                  rounded-lg
                  border
                  border-slate-300
                  bg-white
                  px-3
                  py-2.5
                  text-sm
                  text-slate-900
                  outline-none
                  transition
                  focus:border-slate-500
                  focus:ring-2
                  focus:ring-slate-200
                "
                id="trip-expense-category"
                onChange={(event) => {
                  updateField(
                    "category",
                    event.target
                      .value as TripExpenseCategory,
                  );
                }}
                value={form.category}
              >
                {EXPENSE_CATEGORIES.map(
                  (category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label
                className="
                  mb-1.5
                  block
                  text-sm
                  font-medium
                  text-slate-700
                "
                htmlFor="trip-expense-amount"
              >
                Importe
              </label>

              <input
                className="
                  w-full
                  rounded-lg
                  border
                  border-slate-300
                  px-3
                  py-2.5
                  text-sm
                  text-slate-900
                  outline-none
                  transition
                  focus:border-slate-500
                  focus:ring-2
                  focus:ring-slate-200
                "
                id="trip-expense-amount"
                min="0.01"
                onChange={(event) => {
                  updateField(
                    "amount",
                    event.target.value,
                  );
                }}
                placeholder="0.00"
                step="0.01"
                type="number"
                value={form.amount}
              />
            </div>
          </div>

          <div
            className="
              grid
              gap-5
              sm:grid-cols-2
            "
          >
            <div>
              <label
                className="
                  mb-1.5
                  block
                  text-sm
                  font-medium
                  text-slate-700
                "
                htmlFor="trip-expense-date"
              >
                Fecha
              </label>

              <input
                className="
                  w-full
                  rounded-lg
                  border
                  border-slate-300
                  px-3
                  py-2.5
                  text-sm
                  text-slate-900
                  outline-none
                  transition
                  focus:border-slate-500
                  focus:ring-2
                  focus:ring-slate-200
                "
                id="trip-expense-date"
                onChange={(event) => {
                  updateField(
                    "expenseDate",
                    event.target.value,
                  );
                }}
                type="date"
                value={form.expenseDate}
              />
            </div>

            <div>
              <label
                className="
                  mb-1.5
                  block
                  text-sm
                  font-medium
                  text-slate-700
                "
                htmlFor="trip-expense-supplier"
              >
                Proveedor
                <span className="font-normal text-slate-400">
                  {" "}
                  (opcional)
                </span>
              </label>

              <input
                className="
                  w-full
                  rounded-lg
                  border
                  border-slate-300
                  px-3
                  py-2.5
                  text-sm
                  text-slate-900
                  outline-none
                  transition
                  focus:border-slate-500
                  focus:ring-2
                  focus:ring-slate-200
                "
                id="trip-expense-supplier"
                maxLength={150}
                onChange={(event) => {
                  updateField(
                    "supplier",
                    event.target.value,
                  );
                }}
                placeholder="Nombre del proveedor"
                type="text"
                value={form.supplier}
              />
            </div>
          </div>

          <div>
            <label
              className="
                mb-1.5
                block
                text-sm
                font-medium
                text-slate-700
              "
              htmlFor="trip-expense-notes"
            >
              Notas
              <span className="font-normal text-slate-400">
                {" "}
                (opcional)
              </span>
            </label>

            <textarea
              className="
                min-h-24
                w-full
                resize-y
                rounded-lg
                border
                border-slate-300
                px-3
                py-2.5
                text-sm
                text-slate-900
                outline-none
                transition
                focus:border-slate-500
                focus:ring-2
                focus:ring-slate-200
              "
              id="trip-expense-notes"
              maxLength={500}
              onChange={(event) => {
                updateField(
                  "notes",
                  event.target.value,
                );
              }}
              placeholder="Información adicional"
              value={form.notes}
            />
          </div>

          {(validationError || error) && (
            <div
              className="
                rounded-lg
                border
                border-rose-200
                bg-rose-50
                px-4
                py-3
                text-sm
                text-rose-700
              "
              role="alert"
            >
              {validationError ?? error}
            </div>
          )}

          <footer
            className="
              flex
              flex-col-reverse
              gap-3
              border-t
              border-slate-200
              pt-5
              sm:flex-row
              sm:justify-end
            "
          >
            <button
              className="
                rounded-lg
                border
                border-slate-300
                bg-white
                px-4
                py-2.5
                text-sm
                font-medium
                text-slate-700
                transition-colors
                hover:bg-slate-50
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
              disabled={isSaving}
              onClick={onClose}
              type="button"
            >
              Cancelar
            </button>

            <button
              className="
                rounded-lg
                bg-slate-900
                px-4
                py-2.5
                text-sm
                font-medium
                text-white
                transition-colors
                hover:bg-slate-700
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
              disabled={isSaving}
              type="submit"
            >
              {isSaving
                ? "Guardando..."
                : expense
                  ? "Guardar cambios"
                  : "Registrar gasto"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}