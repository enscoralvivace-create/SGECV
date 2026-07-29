"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import NewChargeModal from "@/components/fees/NewChargeModal";
import DataTable, {
  type DataTableColumn,
} from "@/components/ui/DataTable";
import EmptyState from "@/components/ui/EmptyState";
import StatCard from "@/components/ui/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";
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

export default function CuotasPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [charges, setCharges] = useState<ChargeListItem[]>(
    [],
  );

  const [summary, setSummary] =
    useState<ChargeSummary>(INITIAL_SUMMARY);

  const [isLoading, setIsLoading] = useState(true);

  const [loadError, setLoadError] =
    useState<string | null>(null);

  const loadFinancialData = useCallback(async () => {
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
        error instanceof Error
          ? error.message
          : "No fue posible cargar la información de cuotas.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFinancialData();
  }, [loadFinancialData]);

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
        header: "Monto",
        render: (charge) => (
          <span className="font-semibold text-slate-900">
            {currencyFormatter.format(charge.amount)}
          </span>
        ),
      },
      {
        key: "status",
        header: "Estado",
        render: (charge) => (
          <ChargeStatusBadge status={charge.status} />
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
    ],
    [],
  );

  function handleOpenModal() {
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
  }

  function handleChargeCreated() {
    void loadFinancialData();
  }

  return (
    <main className="space-y-8">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Administración financiera
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Cuotas
          </h1>

          <p className="mt-2 text-slate-600">
            Gestiona cuotas, cargos y pagos de los
            integrantes del Ensamble Coral Vivace.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenModal}
          className="shrink-0 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          + Nuevo cargo
        </button>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
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
          value="$0.00"
          description="Se calculará desde los pagos"
        />
      </section>

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
          <div className="flex min-h-72 items-center justify-center px-6 py-16">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-700" />

              <p className="mt-4 text-sm text-slate-500">
                Cargando cargos...
              </p>
            </div>
          </div>
        ) : loadError ? (
          <div className="px-5 py-8">
            <div
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 p-5"
            >
              <p className="font-semibold text-red-900">
                No fue posible cargar los cargos
              </p>

              <p className="mt-2 text-sm text-red-700">
                {loadError}
              </p>

              <button
                type="button"
                onClick={() => void loadFinancialData()}
                className="mt-4 rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
              >
                Intentar nuevamente
              </button>
            </div>
          </div>
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
                    <button
                      type="button"
                      onClick={handleOpenModal}
                      className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                    >
                      Crear primer cargo
                    </button>
                  }
                />
              </div>
            }
          />
        )}
      </section>

      {isModalOpen && (
        <NewChargeModal
          onClose={handleCloseModal}
          onChargeCreated={handleChargeCreated}
        />
      )}
    </main>
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

function formatDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);

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
    .split("-")
    .map(Number);

  if (!year || !month) {
    return "Periodo no disponible";
  }

  return new Intl.DateTimeFormat("es-MX", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}