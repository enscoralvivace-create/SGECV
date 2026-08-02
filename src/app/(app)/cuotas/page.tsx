"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import NewChargeModal from "@/components/fees/NewChargeModal";
import MemberAccountStatementModal from "@/components/fees/MemberAccountStatementModal";
import PaymentHistoryModal from "@/components/payments/PaymentHistoryModal";
import RegisterPaymentModal from "@/components/payments/RegisterPaymentModal";
import DataTable, {
  type DataTableColumn,
} from "@/components/ui/DataTable";
import EmptyState from "@/components/ui/EmptyState";
import StatCard from "@/components/ui/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";
import VivacePageHeader from "@/components/ui/VivacePageHeader";
import useUserAccess from "@/hooks/useUserAccess";
import {
  getChargeSummary,
  getRecentCharges,
  type ChargeListItem,
  type ChargeStatus,
  type ChargeSummary,
} from "@/services/chargeService";

const INITIAL_SUMMARY: ChargeSummary = {
  pending: 0,
  partial: 0,
  paid: 0,
  cancelled: 0,
  monthlyIncome: 0,
};

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

export default function CuotasPage() {
  const {
    access,
    isLoading: isLoadingAccess,
    error: accessError,
    hasPermission,
  } = useUserAccess();

  const canManageFees = hasPermission("fees.manage");
  const canViewAllFees = hasPermission("fees.viewAll");
  const canViewOwnFees = hasPermission("fees.viewOwn");
  const accessMemberId = access?.memberId ?? null;

  const [isNewChargeModalOpen, setIsNewChargeModalOpen] =
    useState(false);

  const [isOwnAccountOpen, setIsOwnAccountOpen] =
    useState(false);

  const [selectedCharge, setSelectedCharge] =
    useState<ChargeListItem | null>(null);

  const [historyCharge, setHistoryCharge] =
    useState<ChargeListItem | null>(null);

  const [charges, setCharges] = useState<
    ChargeListItem[]
  >([]);

  const [summary, setSummary] =
    useState<ChargeSummary>(INITIAL_SUMMARY);

  const [isLoading, setIsLoading] = useState(true);

  const [loadError, setLoadError] =
    useState<string | null>(null);

  const totalCharges = charges.reduce(
    (total, charge) => total + charge.amount,
    0,
  );

  const totalPaid = charges.reduce(
    (total, charge) =>
      total + charge.paidAmount,
    0,
  );

  const totalBalance = charges.reduce(
    (total, charge) => total + charge.balance,
    0,
  );

  const loadFinancialData = useCallback(async () => {
    if (isLoadingAccess || !canViewAllFees) {
      return;
    }

    try {
      setIsLoading(true);
      setLoadError(null);

      const [recentCharges, chargeSummary] =
        await Promise.all([
          getRecentCharges(10),
          getChargeSummary(),
        ]);

      setCharges(recentCharges);
      setSummary(chargeSummary);
    } catch (error) {
      setLoadError(
        getErrorMessage(
          error,
          "No fue posible cargar la información de cuotas.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, [canViewAllFees, isLoadingAccess]);

  useEffect(() => {
    if (!isLoadingAccess && canViewAllFees) {
      void loadFinancialData();
    } else if (!isLoadingAccess) {
      setCharges([]);
      setSummary(INITIAL_SUMMARY);
      setIsLoading(false);
    }
  }, [canViewAllFees, isLoadingAccess, loadFinancialData]);

  const columns = useMemo<
    DataTableColumn<ChargeListItem>[]
  >(
    () => [
      {
        key: "member",
        header: "Integrante",
        render: (charge) => (
          <div>
            <p className="font-semibold text-slate-900">
              {charge.memberName}
            </p>

            {charge.billingPeriod && (
              <p className="mt-1 text-xs text-slate-500">
                Periodo:{" "}
                {formatBillingPeriod(
                  charge.billingPeriod,
                )}
              </p>
            )}
          </div>
        ),
      },
      {
        key: "feeType",
        header: "Concepto",
        render: (charge) => (
          <span className="font-medium text-slate-700">
            {charge.feeTypeName}
          </span>
        ),
      },
      {
        key: "amount",
        header: "Cargo",
        render: (charge) => (
          <span className="font-semibold text-slate-900">
            {currencyFormatter.format(
              Number(charge.amount),
            )}
          </span>
        ),
      },
      {
        key: "paidAmount",
        header: "Pagado",
        render: (charge) => (
          <span className="font-medium text-emerald-700">
            {currencyFormatter.format(
              Number(charge.paidAmount),
            )}
          </span>
        ),
      },
      {
        key: "balance",
        header: "Saldo",
        render: (charge) => (
          <span
            className={
              charge.balance > 0
                ? "font-semibold text-amber-700"
                : "font-semibold text-emerald-700"
            }
          >
            {currencyFormatter.format(
              Number(charge.balance),
            )}
          </span>
        ),
      },
      {
        key: "status",
        header: "Estado",
        render: (charge) => (
          <ChargeStatusBadge
            status={charge.status}
          />
        ),
      },
      {
        key: "dueDate",
        header: "Fecha límite",
        render: (charge) =>
          charge.dueDate
            ? formatDate(charge.dueDate)
            : "Sin fecha",
      },
      {
        key: "actions",
        header: "Acciones",
        render: (charge) => (
          <ChargeActions
            charge={charge}
            onViewHistory={() =>
              setHistoryCharge(charge)
            }
            onRegisterPayment={() =>
              setSelectedCharge(charge)
            }
            canManageFees={canManageFees}
            isLoadingAccess={isLoadingAccess}
          />
        ),
      },
    ],
    [canManageFees, isLoadingAccess],
  );

  function handleChargeCreated() {
    setIsNewChargeModalOpen(false);
    void loadFinancialData();
  }

  function handlePaymentCreated() {
    setSelectedCharge(null);
    setHistoryCharge(null);
    void loadFinancialData();
  }

  function handleRegisterPaymentFromHistory() {
    if (!historyCharge) {
      return;
    }

    setSelectedCharge(historyCharge);
    setHistoryCharge(null);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-5 sm:px-6 sm:py-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <VivacePageHeader
          eyebrow="Administración financiera"
          title="Cuotas"
          description="Consulta cargos, pagos, saldos pendientes e ingresos recientes."
          actions={
            !isLoadingAccess ? (
              <div className="flex flex-col gap-3 sm:flex-row">
                {canViewOwnFees ? (
                  <button
                    type="button"
                    onClick={() =>
                      setIsOwnAccountOpen(true)
                    }
                    disabled={accessMemberId === null}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-emerald-950 px-5 py-2.5 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Mi estado de cuenta
                  </button>
                ) : null}

                {canManageFees ? (
                  <button
                    type="button"
                    onClick={() =>
                      setIsNewChargeModalOpen(true)
                    }
                    className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900 active:scale-[0.98]"
                  >
                    + Nuevo cargo
                  </button>
                ) : null}
              </div>
            ) : null
          }
        />

      {!isLoadingAccess &&
      canViewOwnFees &&
      accessMemberId === null ? (
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          Tu usuario no está vinculado a un integrante. Contacta a un administrador para consultar tu estado de cuenta.
        </div>
      ) : null}

      {canViewAllFees ? (
        <>
      <section className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
        <StatCard
          title="Pendientes"
          value={isLoading ? "—" : summary.pending}
          description="Cargos sin pagos registrados"
        />

        <StatCard
          title="Parciales"
          value={isLoading ? "—" : summary.partial}
          description="Cargos con saldo pendiente"
        />

        <StatCard
          title="Pagados"
          value={isLoading ? "—" : summary.paid}
          description="Cargos cubiertos completamente"
        />

        <StatCard
          title="Ingresos del mes"
          value={
            isLoading
              ? "—"
              : currencyFormatter.format(
                  summary.monthlyIncome,
                )
          }
          description="Pagos recibidos durante el mes actual"
        />
      </section>
        </>
      ) : !isLoadingAccess ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Estado de cuenta personal
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Consulta tus cargos, pagos y saldo pendiente desde el acceso “Mi estado de cuenta”.
          </p>
        </section>
      ) : null}

      {canViewAllFees ? (
        <>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Cargos recientes
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Últimos cargos registrados en el sistema.
            </p>
          </div>

          {!isLoading && charges.length > 0 && (
            <span className="text-sm font-medium text-slate-500">
              {charges.length}{" "}
              {charges.length === 1
                ? "registro"
                : "registros"}
            </span>
          )}
        </div>

        {isLoading ? (
          <LoadingCharges />
        ) : loadError ? (
          <LoadError
            message={loadError}
            onRetry={() =>
              void loadFinancialData()
            }
          />
        ) : (
          <DataTable
            columns={columns}
            data={charges}
            getRowKey={(charge) => charge.id}
            emptyState={
              <div className="p-5">
                <EmptyState
                  title="Aún no existen cargos"
                  description="Crea el primer cargo para comenzar a administrar las cuotas del coro."
                  action={
                    !isLoadingAccess && canManageFees ? (
                      <button
                        type="button"
                        onClick={() =>
                          setIsNewChargeModalOpen(true)
                        }
                        className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                      >
                        Crear primer cargo
                      </button>
                    ) : null
                  }
                />
              </div>
            }
          />
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Resumen financiero
        </h2>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div>
            <p className="text-sm text-slate-500">
              Total de cargos
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {currencyFormatter.format(
                totalCharges,
              )}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Total pagado
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-700">
              {currencyFormatter.format(totalPaid)}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Saldo pendiente
            </p>

            <p className="mt-2 text-2xl font-bold text-amber-700">
              {currencyFormatter.format(
                totalBalance,
              )}
            </p>
          </div>
        </div>
      </section>
        </>
      ) : null}

      {isNewChargeModalOpen && (
        <NewChargeModal
          onClose={() =>
            setIsNewChargeModalOpen(false)
          }
          onChargeCreated={handleChargeCreated}
        />
      )}

      {historyCharge && (
        <PaymentHistoryModal
          charge={{
            id: historyCharge.id,
            memberName: historyCharge.memberName,
            feeTypeName:
              historyCharge.feeTypeName,
            amount: Number(historyCharge.amount),
            paidAmount: Number(
              historyCharge.paidAmount,
            ),
            balance: Number(
              historyCharge.balance,
            ),
          }}
          onClose={() => setHistoryCharge(null)}
          onRegisterPayment={
            handleRegisterPaymentFromHistory
          }
          canManageFees={canManageFees}
          isLoadingAccess={isLoadingAccess}
          canViewPayments={canViewAllFees}
          accessError={accessError}
        />
      )}

      {selectedCharge && (
        <RegisterPaymentModal
          charge={{
            id: selectedCharge.id,
            memberName: selectedCharge.memberName,
            feeTypeName:
              selectedCharge.feeTypeName,
            amount: Number(selectedCharge.amount),
          }}
          onClose={() => setSelectedCharge(null)}
          onPaymentCreated={handlePaymentCreated}
          canManageFees={canManageFees}
          isLoadingAccess={isLoadingAccess}
          accessError={accessError}
        />
      )}

      {isOwnAccountOpen && accessMemberId !== null && (
        <MemberAccountStatementModal
          member={{
            id: accessMemberId,
            name: "Mi estado de cuenta",
          }}
          onClose={() => setIsOwnAccountOpen(false)}
          isLoadingAccess={isLoadingAccess}
          accessError={accessError}
          canManageFees={canManageFees}
          canViewAllFees={canViewAllFees}
          canViewOwnFees={canViewOwnFees}
          accessMemberId={accessMemberId}
        />
      )}
          </div>
    </main>
  );
}

interface ChargeActionsProps {
  charge: ChargeListItem;
  onViewHistory: () => void;
  onRegisterPayment: () => void;
  canManageFees: boolean;
  isLoadingAccess: boolean;
}

function ChargeActions({
  charge,
  onViewHistory,
  onRegisterPayment,
  canManageFees,
  isLoadingAccess,
}: ChargeActionsProps) {
  const canRegisterPayment =
    !isLoadingAccess &&
    canManageFees &&
    (charge.status === "pending" ||
      charge.status === "partial");

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={onViewHistory}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900"
      >
        Historial
      </button>

      {canRegisterPayment && (
        <button
          type="button"
          onClick={onRegisterPayment}
          className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
        >
          Registrar pago
        </button>
      )}
    </div>
  );
}

interface ChargeStatusBadgeProps {
  status: ChargeStatus;
}

function ChargeStatusBadge({
  status,
}: ChargeStatusBadgeProps) {
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

function LoadingCharges() {
  return (
    <div className="flex min-h-72 items-center justify-center px-6 py-16">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-700" />

        <p className="mt-4 text-sm text-slate-500">
          Cargando cargos...
        </p>
      </div>
    </div>
  );
}

interface LoadErrorProps {
  message: string;
  onRetry: () => void;
}

function LoadError({
  message,
  onRetry,
}: LoadErrorProps) {
  return (
    <div className="px-5 py-8">
      <div
        role="alert"
        className="rounded-2xl border border-red-200 bg-red-50 p-5"
      >
        <p className="font-semibold text-red-900">
          No fue posible cargar los cargos
        </p>

        <p className="mt-2 text-sm text-red-700">
          {message}
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
        >
          Intentar nuevamente
        </button>
      </div>
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
