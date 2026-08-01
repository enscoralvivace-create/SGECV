"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import PaymentHistoryModal from "@/components/payments/PaymentHistoryModal";
import RegisterPaymentModal from "@/components/payments/RegisterPaymentModal";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  getChargesByMember,
  type ChargeListItem,
  type ChargeStatus,
} from "@/services/chargeService";

interface AccountStatementMember {
  id: number;
  name: string;
}

interface MemberAccountStatementModalProps {
  member: AccountStatementMember;
  onClose: () => void;
}

const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const billingPeriodFormatter = new Intl.DateTimeFormat(
  "es-MX",
  {
    month: "long",
    year: "numeric",
  },
);

export default function MemberAccountStatementModal({
  member,
  onClose,
}: MemberAccountStatementModalProps) {
  const [charges, setCharges] = useState<
    ChargeListItem[]
  >([]);

  const [historyCharge, setHistoryCharge] =
    useState<ChargeListItem | null>(null);

  const [paymentCharge, setPaymentCharge] =
    useState<ChargeListItem | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [loadError, setLoadError] =
    useState<string | null>(null);

  const loadCharges =
    useCallback(async (): Promise<void> => {
      try {
        setIsLoading(true);
        setLoadError(null);

        const memberCharges =
          await getChargesByMember(
            member.id,
          );

        setCharges(memberCharges);
      } catch (error) {
        setLoadError(
          getErrorMessage(
            error,
            "No fue posible cargar el estado de cuenta.",
          ),
        );
      } finally {
        setIsLoading(false);
      }
    }, [member.id]);

  useEffect(() => {
    void loadCharges();
  }, [loadCharges]);

  const totals = useMemo(
    () =>
      charges.reduce(
        (result, charge) => ({
          charged:
            result.charged + charge.amount,
          paid:
            result.paid + charge.paidAmount,
          balance:
            result.balance + charge.balance,
        }),
        {
          charged: 0,
          paid: 0,
          balance: 0,
        },
      ),
    [charges],
  );

  function handleRegisterPaymentFromHistory() {
    if (!historyCharge) {
      return;
    }

    setPaymentCharge(historyCharge);
    setHistoryCharge(null);
  }

  function handlePaymentCreated() {
    setPaymentCharge(null);
    void loadCharges();
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 p-4"
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
          aria-labelledby="account-statement-title"
          className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        >
          <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-6">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Estado de cuenta
              </p>

              <h2
                id="account-statement-title"
                className="mt-1 text-2xl font-bold text-slate-900"
              >
                {member.name}
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                Consulta los cargos, pagos y saldos del
                integrante.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar estado de cuenta"
              className="rounded-lg px-3 py-2 text-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              ×
            </button>
          </header>

          <div className="space-y-6 p-6">
            <section className="grid gap-4 sm:grid-cols-3">
              <SummaryItem
                label="Total de cargos"
                value={currencyFormatter.format(
                  totals.charged,
                )}
              />

              <SummaryItem
                label="Total pagado"
                value={currencyFormatter.format(
                  totals.paid,
                )}
                valueClassName="text-emerald-700"
              />

              <SummaryItem
                label="Saldo pendiente"
                value={currencyFormatter.format(
                  totals.balance,
                )}
                valueClassName={
                  totals.balance > 0
                    ? "text-amber-700"
                    : "text-emerald-700"
                }
              />
            </section>

            <section>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Cargos del integrante
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Historial completo de conceptos y
                  movimientos financieros.
                </p>
              </div>

              <div className="mt-4">
                {isLoading ? (
                  <LoadingState />
                ) : loadError ? (
                  <ErrorState
                    message={loadError}
                    onRetry={() =>
                      void loadCharges()
                    }
                  />
                ) : charges.length === 0 ? (
                  <EmptyState />
                ) : (
                  <ChargesList
                    charges={charges}
                    onViewHistory={setHistoryCharge}
                    onRegisterPayment={
                      setPaymentCharge
                    }
                  />
                )}
              </div>
            </section>
          </div>

          <footer className="flex justify-end border-t border-slate-200 p-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cerrar
            </button>
          </footer>
        </section>
      </div>

      {historyCharge && (
        <PaymentHistoryModal
          charge={{
            id: historyCharge.id,
            memberName: historyCharge.memberName,
            feeTypeName:
              historyCharge.feeTypeName,
            amount: historyCharge.amount,
            paidAmount: historyCharge.paidAmount,
            balance: historyCharge.balance,
          }}
          onClose={() => setHistoryCharge(null)}
          onRegisterPayment={
            handleRegisterPaymentFromHistory
          }
        />
      )}

      {paymentCharge && (
        <RegisterPaymentModal
          charge={{
            id: paymentCharge.id,
            memberName: paymentCharge.memberName,
            feeTypeName:
              paymentCharge.feeTypeName,
            amount: paymentCharge.amount,
          }}
          onClose={() => setPaymentCharge(null)}
          onPaymentCreated={handlePaymentCreated}
        />
      )}
    </>
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

interface ChargesListProps {
  charges: ChargeListItem[];
  onViewHistory: (charge: ChargeListItem) => void;
  onRegisterPayment: (
    charge: ChargeListItem,
  ) => void;
}

function ChargesList({
  charges,
  onViewHistory,
  onRegisterPayment,
}: ChargesListProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className="hidden grid-cols-[1.4fr_1fr_1fr_1fr_1fr_auto] gap-4 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 lg:grid">
        <span>Concepto</span>
        <span>Cargo</span>
        <span>Pagado</span>
        <span>Saldo</span>
        <span>Estado</span>
        <span>Acciones</span>
      </div>

      <div className="divide-y divide-slate-200">
        {charges.map((charge) => {
          const canRegisterPayment =
            charge.status === "pending" ||
            charge.status === "partial";

          return (
            <article
              key={charge.id}
              className="grid gap-4 px-4 py-5 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_auto] lg:items-center"
            >
              <div>
                <p className="font-semibold text-slate-900">
                  {charge.feeTypeName}
                </p>

                <div className="mt-1 space-y-1 text-xs text-slate-500">
                  {charge.billingPeriod && (
                    <p>
                      Periodo:{" "}
                      {formatBillingPeriod(
                        charge.billingPeriod,
                      )}
                    </p>
                  )}

                  <p>
                    Fecha límite:{" "}
                    {charge.dueDate
                      ? formatDate(charge.dueDate)
                      : "Sin fecha"}
                  </p>
                </div>
              </div>

              <Value
                label="Cargo"
                value={currencyFormatter.format(
                  charge.amount,
                )}
              />

              <Value
                label="Pagado"
                value={currencyFormatter.format(
                  charge.paidAmount,
                )}
                className="text-emerald-700"
              />

              <Value
                label="Saldo"
                value={currencyFormatter.format(
                  charge.balance,
                )}
                className={
                  charge.balance > 0
                    ? "text-amber-700"
                    : "text-emerald-700"
                }
              />

              <div>
                <p className="mb-1 text-xs font-medium uppercase text-slate-400 lg:hidden">
                  Estado
                </p>

                <ChargeStatusBadge
                  status={charge.status}
                />
              </div>

              <div className="flex flex-wrap gap-2 lg:justify-end">
                <button
                  type="button"
                  onClick={() =>
                    onViewHistory(charge)
                  }
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Historial
                </button>

                {canRegisterPayment && (
                  <button
                    type="button"
                    onClick={() =>
                      onRegisterPayment(charge)
                    }
                    className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
                  >
                    Registrar pago
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

interface ValueProps {
  label: string;
  value: string;
  className?: string;
}

function Value({
  label,
  value,
  className = "text-slate-900",
}: ValueProps) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase text-slate-400 lg:hidden">
        {label}
      </p>

      <p className={`font-semibold ${className}`}>
        {value}
      </p>
    </div>
  );
}

function ChargeStatusBadge({
  status,
}: {
  status: ChargeStatus;
}) {
  switch (status) {
    case "pending":
      return (
        <StatusBadge
          label="Pendiente"
          tone="warning"
        />
      );

    case "partial":
      return (
        <StatusBadge
          label="Parcial"
          tone="info"
        />
      );

    case "paid":
      return (
        <StatusBadge
          label="Pagado"
          tone="success"
        />
      );

    case "cancelled":
      return (
        <StatusBadge
          label="Cancelado"
          tone="neutral"
        />
      );

    default:
      return (
        <StatusBadge
          label="Desconocido"
          tone="neutral"
        />
      );
  }
}

function LoadingState() {
  return (
    <div className="flex min-h-56 items-center justify-center rounded-xl border border-slate-200">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-700" />

        <p className="mt-4 text-sm text-slate-500">
          Cargando estado de cuenta...
        </p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 px-5 py-12 text-center">
      <p className="font-semibold text-slate-800">
        No existen cargos
      </p>

      <p className="mt-2 text-sm text-slate-500">
        Este integrante todavía no tiene cargos
        registrados.
      </p>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 p-5"
    >
      <p className="font-semibold text-red-900">
        No fue posible cargar la información
      </p>

      <p className="mt-2 text-sm text-red-700">
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
      >
        Intentar nuevamente
      </button>
    </div>
  );
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

function formatBillingPeriod(
  billingPeriod: string,
): string {
  const [year, month] = billingPeriod
    .slice(0, 7)
    .split("-")
    .map(Number);

  if (!year || !month) {
    return "Periodo no disponible";
  }

  return billingPeriodFormatter.format(
    new Date(year, month - 1, 1),
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