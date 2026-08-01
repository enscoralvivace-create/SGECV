"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getPaymentsByCharge,
  type PaymentListItem,
  type PaymentMethod,
} from "@/services/paymentService";

interface PaymentHistoryCharge {
  id: string;
  memberName: string;
  feeTypeName: string;
  amount: number;
  paidAmount: number;
  balance: number;
}

interface PaymentHistoryModalProps {
  charge: PaymentHistoryCharge;
  onClose: () => void;
  onRegisterPayment: () => void;
}

const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

export default function PaymentHistoryModal({
  charge,
  onClose,
  onRegisterPayment,
}: PaymentHistoryModalProps) {
  const [payments, setPayments] = useState<
    PaymentListItem[]
  >([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadPayments() {
      try {
        setIsLoading(true);
        setLoadError(null);

        const paymentHistory =
          await getPaymentsByCharge(charge.id);

        if (isMounted) {
          setPayments(paymentHistory);
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(
            getErrorMessage(
              error,
              "No fue posible cargar el historial de pagos.",
            ),
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadPayments();

    return () => {
      isMounted = false;
    };
  }, [charge.id]);

  const totalPayments = useMemo(
    () =>
      payments.reduce(
        (total, payment) =>
          total + payment.amount,
        0,
      ),
    [payments],
  );

  const canRegisterPayment =
    charge.balance > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 sm:items-center sm:p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-history-title"
        className="max-h-[calc(100dvh-var(--safe-top))] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-3xl"
      >
        <header className="sticky top-0 z-20 flex items-start justify-between gap-4 border-b border-slate-200 bg-white/95 p-4 backdrop-blur sm:p-6">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Historial de pagos
            </p>

            <h2
              id="payment-history-title"
              className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl"
            >
              {charge.feeTypeName}
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              {charge.memberName}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar historial de pagos"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            ×
          </button>
        </header>

        <div className="space-y-4 p-4 pb-[max(1rem,var(--safe-bottom))] sm:space-y-6 sm:p-6">
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            <SummaryItem
              label="Cargo"
              value={currencyFormatter.format(
                charge.amount,
              )}
            />

            <SummaryItem
              label="Pagado"
              value={currencyFormatter.format(
                charge.paidAmount,
              )}
              valueClassName="text-emerald-700"
            />

            <SummaryItem
              label="Saldo pendiente"
              value={currencyFormatter.format(
                charge.balance,
              )}
              valueClassName={
                charge.balance > 0
                  ? "text-amber-700"
                  : "text-emerald-700"
              }
            />
          </section>

          <section>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Pagos registrados
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Movimientos asociados a este cargo.
                </p>
              </div>

              {!isLoading && payments.length > 0 && (
                <p className="text-sm font-semibold text-slate-700">
                  Total consultado:{" "}
                  {currencyFormatter.format(
                    totalPayments,
                  )}
                </p>
              )}
            </div>

            <div className="mt-4">
              {isLoading ? (
                <LoadingState />
              ) : loadError ? (
                <ErrorState message={loadError} />
              ) : payments.length === 0 ? (
                <EmptyPaymentsState />
              ) : (
                <PaymentList payments={payments} />
              )}
            </div>
          </section>
        </div>

        <footer className="sticky bottom-0 grid grid-cols-2 gap-3 border-t border-slate-200 bg-white/95 p-4 pb-[max(1rem,var(--safe-bottom))] backdrop-blur sm:flex sm:flex-row sm:justify-end sm:p-6">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cerrar
          </button>

          {canRegisterPayment && (
            <button
              type="button"
              onClick={onRegisterPayment}
              className="min-h-11 rounded-xl bg-emerald-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Registrar nuevo pago
            </button>
          )}
        </footer>
      </section>
    </div>
  );
}

interface SummaryItemProps {
  label: string;
  value: string;
  valueClassName?: string;
}

function SummaryItem({
  label,
  value,
  valueClassName = "text-slate-900",
}: SummaryItemProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p
        className={`mt-2 text-xl font-bold ${valueClassName}`}
      >
        {value}
      </p>
    </div>
  );
}

interface PaymentListProps {
  payments: PaymentListItem[];
}

function PaymentList({
  payments,
}: PaymentListProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className="hidden grid-cols-[1.3fr_1fr_1fr] gap-4 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:grid">
        <span>Fecha</span>
        <span>Método</span>
        <span className="text-right">
          Monto
        </span>
      </div>

      <div className="divide-y divide-slate-200">
        {payments.map((payment) => (
          <article
            key={payment.id}
            className="grid gap-3 px-4 py-4 sm:grid-cols-[1.3fr_1fr_1fr] sm:items-start sm:gap-4"
          >
            <div>
              <p className="font-medium text-slate-900">
                {formatDate(payment.paymentDate)}
              </p>

              {payment.reference && (
                <p className="mt-1 text-xs text-slate-500">
                  Referencia:{" "}
                  {payment.reference}
                </p>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700">
                {getPaymentMethodLabel(
                  payment.paymentMethod,
                )}
              </p>

              {payment.notes && (
                <p className="mt-1 text-xs text-slate-500">
                  {payment.notes}
                </p>
              )}
            </div>

            <p className="font-semibold text-emerald-700 sm:text-right">
              {currencyFormatter.format(
                payment.amount,
              )}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-48 items-center justify-center rounded-xl border border-slate-200">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-700" />

        <p className="mt-4 text-sm text-slate-500">
          Cargando pagos...
        </p>
      </div>
    </div>
  );
}

interface ErrorStateProps {
  message: string;
}

function ErrorState({
  message,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 p-5"
    >
      <p className="font-semibold text-red-900">
        No fue posible cargar los pagos
      </p>

      <p className="mt-2 text-sm text-red-700">
        {message}
      </p>
    </div>
  );
}

function EmptyPaymentsState() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 px-5 py-10 text-center">
      <p className="font-semibold text-slate-800">
        No hay pagos registrados
      </p>

      <p className="mt-2 text-sm text-slate-500">
        Este cargo todavía no tiene movimientos.
      </p>
    </div>
  );
}

function getPaymentMethodLabel(
  paymentMethod: PaymentMethod,
): string {
  switch (paymentMethod) {
    case "cash":
      return "Efectivo";

    case "transfer":
      return "Transferencia";

    case "card":
      return "Tarjeta";

    case "other":
      return "Otro";

    default:
      return "Método no disponible";
  }
}

function formatDate(date: string): string {
  const [year, month, day] = date
    .slice(0, 10)
    .split("-")
    .map(Number);

  if (!year || !month || !day) {
    return "Fecha no disponible";
  }

  return dateFormatter.format(
    new Date(year, month - 1, day),
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