"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  createPayment,
  getPaymentsByCharge,
} from "@/services/paymentService";

type PaymentMethod =
  | "cash"
  | "transfer"
  | "card"
  | "other";

interface PaymentCharge {
  id: string;
  memberName: string;
  feeTypeName: string;
  amount: number;
}

interface RegisterPaymentModalProps {
  charge: PaymentCharge;
  onClose: () => void;
  onPaymentCreated: () => void;
}

interface PaymentFormState {
  amount: string;
  paymentMethod: PaymentMethod;
  reference: string;
  notes: string;
}

interface PaymentMethodOption {
  value: PaymentMethod;
  label: string;
}

const INITIAL_FORM_STATE: PaymentFormState = {
  amount: "",
  paymentMethod: "transfer",
  reference: "",
  notes: "",
};

const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    value: "cash",
    label: "Efectivo",
  },
  {
    value: "transfer",
    label: "Transferencia",
  },
  {
    value: "card",
    label: "Tarjeta",
  },
  {
    value: "other",
    label: "Otro",
  },
];

const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
});

export default function RegisterPaymentModal({
  charge,
  onClose,
  onPaymentCreated,
}: RegisterPaymentModalProps) {
  const [formData, setFormData] =
    useState<PaymentFormState>(INITIAL_FORM_STATE);

  const [paidAmount, setPaidAmount] = useState(0);

  const [isLoadingPayments, setIsLoadingPayments] =
    useState(true);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [loadError, setLoadError] =
    useState<string | null>(null);

  const [submitError, setSubmitError] =
    useState<string | null>(null);

  const balance = useMemo(
    () => Math.max(charge.amount - paidAmount, 0),
    [charge.amount, paidAmount],
  );

  useEffect(() => {
    async function loadPayments() {
      try {
        setIsLoadingPayments(true);
        setLoadError(null);

        const payments = await getPaymentsByCharge(
          charge.id,
        );

        const totalPaid = payments.reduce(
          (total, payment) =>
            total + Number(payment.amount),
          0,
        );

        const currentBalance = Math.max(
          charge.amount - totalPaid,
          0,
        );

        setPaidAmount(totalPaid);

        setFormData((current) => ({
          ...current,
          amount:
            currentBalance > 0
              ? currentBalance.toFixed(2)
              : "",
        }));
      } catch (error) {
        setLoadError(
          getErrorMessage(
            error,
            "No fue posible consultar los pagos del cargo.",
          ),
        );
      } finally {
        setIsLoadingPayments(false);
      }
    }

    void loadPayments();
  }, [charge.id, charge.amount]);

  function handleTextFieldChange(
    field: "amount" | "reference" | "notes",
    value: string,
  ) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    if (submitError) {
      setSubmitError(null);
    }
  }

  function handlePaymentMethodChange(
    value: PaymentMethod,
  ) {
    setFormData((current) => ({
      ...current,
      paymentMethod: value,
    }));

    if (submitError) {
      setSubmitError(null);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const paymentAmount = Number(formData.amount);

    if (
      !Number.isFinite(paymentAmount) ||
      paymentAmount <= 0
    ) {
      setSubmitError(
        "Ingresa un monto de pago válido.",
      );
      return;
    }

    if (paymentAmount > balance) {
      setSubmitError(
        `El pago no puede superar el saldo pendiente de ${currencyFormatter.format(
          balance,
        )}.`,
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      await createPayment({
        memberChargeId: charge.id,
        amount: paymentAmount,
        paymentMethod: formData.paymentMethod,
        reference: formData.reference,
        notes: formData.notes,
      });

      onPaymentCreated();
      onClose();
    } catch (error) {
      setSubmitError(
        getErrorMessage(
          error,
          "No fue posible registrar el pago.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="register-payment-title"
    >
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Registro financiero
            </p>

            <h2
              id="register-payment-title"
              className="mt-1 text-xl font-bold text-slate-900"
            >
              Registrar pago
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Cerrar modal"
            className="rounded-lg px-3 py-2 text-xl leading-none text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ×
          </button>
        </header>

        <div className="px-6 pt-6">
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="font-semibold text-slate-900">
              {charge.memberName}
            </p>

            <p className="mt-1 text-sm text-slate-600">
              {charge.feeTypeName}
            </p>

            {isLoadingPayments ? (
              <p className="mt-5 text-sm text-slate-500">
                Consultando saldo...
              </p>
            ) : loadError ? (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4"
              >
                <p className="text-sm font-medium text-red-700">
                  {loadError}
                </p>
              </div>
            ) : (
              <dl className="mt-5 grid gap-4 sm:grid-cols-3">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Cargo
                  </dt>

                  <dd className="mt-1 font-semibold text-slate-900">
                    {currencyFormatter.format(
                      charge.amount,
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Pagado
                  </dt>

                  <dd className="mt-1 font-semibold text-slate-900">
                    {currencyFormatter.format(
                      paidAmount,
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Saldo
                  </dt>

                  <dd className="mt-1 font-bold text-slate-900">
                    {currencyFormatter.format(balance)}
                  </dd>
                </div>
              </dl>
            )}
          </section>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 px-6 py-6"
        >
          <div>
            <label
              htmlFor="payment-amount"
              className="block text-sm font-semibold text-slate-700"
            >
              Monto del pago
            </label>

            <div className="relative mt-2">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-500">
                $
              </span>

              <input
                id="payment-amount"
                type="number"
                min="0.01"
                max={balance}
                step="0.01"
                value={formData.amount}
                onChange={(event) =>
                  handleTextFieldChange(
                    "amount",
                    event.target.value,
                  )
                }
                disabled={
                  isLoadingPayments ||
                  isSubmitting ||
                  Boolean(loadError) ||
                  balance <= 0
                }
                required
                className="w-full rounded-xl border border-slate-300 py-3 pl-8 pr-4 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="payment-method"
              className="block text-sm font-semibold text-slate-700"
            >
              Método de pago
            </label>

            <select
              id="payment-method"
              value={formData.paymentMethod}
              onChange={(event) =>
                handlePaymentMethodChange(
                  event.target.value as PaymentMethod,
                )
              }
              disabled={
                isLoadingPayments ||
                isSubmitting ||
                Boolean(loadError) ||
                balance <= 0
              }
              required
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              {PAYMENT_METHODS.map((method) => (
                <option
                  key={method.value}
                  value={method.value}
                >
                  {method.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="payment-reference"
              className="block text-sm font-semibold text-slate-700"
            >
              Referencia
            </label>

            <input
              id="payment-reference"
              type="text"
              value={formData.reference}
              onChange={(event) =>
                handleTextFieldChange(
                  "reference",
                  event.target.value,
                )
              }
              disabled={
                isSubmitting ||
                isLoadingPayments ||
                Boolean(loadError) ||
                balance <= 0
              }
              placeholder="Folio, número de operación, etc."
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </div>

          <div>
            <label
              htmlFor="payment-notes"
              className="block text-sm font-semibold text-slate-700"
            >
              Notas
            </label>

            <textarea
              id="payment-notes"
              rows={3}
              value={formData.notes}
              onChange={(event) =>
                handleTextFieldChange(
                  "notes",
                  event.target.value,
                )
              }
              disabled={
                isSubmitting ||
                isLoadingPayments ||
                Boolean(loadError) ||
                balance <= 0
              }
              placeholder="Información adicional del pago."
              className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </div>

          {submitError && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-4"
            >
              <p className="text-sm font-medium text-red-700">
                {submitError}
              </p>
            </div>
          )}

          {!isLoadingPayments &&
            !loadError &&
            balance <= 0 && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm font-medium text-emerald-700">
                  Este cargo ya se encuentra pagado en su
                  totalidad.
                </p>
              </div>
            )}

          <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={
                isLoadingPayments ||
                isSubmitting ||
                Boolean(loadError) ||
                balance <= 0
              }
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSubmitting
                ? "Registrando..."
                : "Registrar pago"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

function getErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return fallbackMessage;
}