"use client";

import {
  CircleDollarSign,
  Landmark,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  WalletCards,
} from "lucide-react";

import TripExpenseCategoryAnalysis from "@/components/trips/TripExpenseCategoryAnalysis";
import TripFinancialHealthCard from "@/components/trips/TripFinancialHealthCard";
import TripFinancialProgress from "@/components/trips/TripFinancialProgress";
import TripFinancialRiskAnalysis from "@/components/trips/TripFinancialRiskAnalysis";
import TripFinancialSummaryCards from "@/components/trips/TripFinancialSummaryCards";
import TripMemberFinancialTable from "@/components/trips/TripMemberFinancialTable";

import {
  useTripFinancialDashboard,
  type TripFinancialReconciliation,
} from "@/hooks/useTripFinancialDashboard";

interface TripFinancialDashboardProps {
  tripId: string;

  tripName: string;
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

function formatPercentage(
  value: number,
): string {
  return new Intl.NumberFormat(
    "es-MX",
    {
      maximumFractionDigits: 1,
      minimumFractionDigits: 0,
    },
  ).format(value);
}

function LoadingState() {
  return (
    <div
      aria-live="polite"
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        px-5
        py-12
        text-center
        shadow-sm
      "
    >
      <RefreshCw
        aria-hidden="true"
        className="
          mx-auto
          h-7
          w-7
          animate-spin
          text-slate-400
        "
      />

      <p
        className="
          mt-3
          text-sm
          font-medium
          text-slate-700
        "
      >
        Cargando información financiera...
      </p>
    </div>
  );
}

interface ErrorStateProps {
  error: string;

  onRetry: () => Promise<void>;
}

function ErrorState({
  error,
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-rose-200
        bg-rose-50
        px-5
        py-8
        text-center
      "
      role="alert"
    >
      <TriangleAlert
        aria-hidden="true"
        className="
          mx-auto
          h-7
          w-7
          text-rose-600
        "
      />

      <p
        className="
          mt-3
          text-sm
          font-semibold
          text-rose-800
        "
      >
        No fue posible cargar el dashboard
        financiero.
      </p>

      <p
        className="
          mx-auto
          mt-1
          max-w-xl
          text-sm
          leading-5
          text-rose-700
        "
      >
        {error}
      </p>

      <button
        className="
          mt-4
          inline-flex
          items-center
          justify-center
          rounded-lg
          border
          border-rose-300
          bg-white
          px-4
          py-2
          text-sm
          font-medium
          text-rose-700
          transition-colors
          hover:bg-rose-100
          focus:outline-none
          focus:ring-2
          focus:ring-rose-500
          focus:ring-offset-2
        "
        onClick={() => {
          void onRetry();
        }}
        type="button"
      >
        Intentar nuevamente
      </button>
    </div>
  );
}

interface ReconciliationCardProps {
  label: string;

  value: number;

  description: string;

  variant:
    | "neutral"
    | "positive"
    | "warning"
    | "danger";

  icon: typeof CircleDollarSign;
}

function getVariantClasses(
  variant: ReconciliationCardProps["variant"],
): string {
  switch (variant) {
    case "positive":
      return (
        "border-emerald-200 " +
        "bg-emerald-50 " +
        "text-emerald-900"
      );

    case "warning":
      return (
        "border-amber-200 " +
        "bg-amber-50 " +
        "text-amber-900"
      );

    case "danger":
      return (
        "border-rose-200 " +
        "bg-rose-50 " +
        "text-rose-900"
      );

    default:
      return (
        "border-slate-200 " +
        "bg-white " +
        "text-slate-900"
      );
  }
}

function ReconciliationCard({
  label,
  value,
  description,
  variant,
  icon: Icon,
}: ReconciliationCardProps) {
  return (
    <article
      className={`
        rounded-2xl
        border
        p-5
        shadow-sm
        ${getVariantClasses(variant)}
      `}
    >
      <div
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >
        <div>
          <p
            className="
              text-sm
              font-medium
              opacity-75
            "
          >
            {label}
          </p>

          <p
            className="
              mt-2
              text-2xl
              font-bold
              tracking-tight
            "
          >
            {formatCurrency(value)}
          </p>
        </div>

        <div
          className="
            rounded-xl
            bg-white/70
            p-2.5
          "
        >
          <Icon
            aria-hidden="true"
            className="h-5 w-5"
          />
        </div>
      </div>

      <p
        className="
          mt-3
          text-xs
          leading-5
          opacity-70
        "
      >
        {description}
      </p>
    </article>
  );
}

interface TripFinancialReconciliationSectionProps {
  reconciliation:
    TripFinancialReconciliation;
}

function TripFinancialReconciliationSection({
  reconciliation,
}: TripFinancialReconciliationSectionProps) {
  const isCashNegative =
    reconciliation.availableCash < 0;

  const isBudgetExceeded =
    reconciliation.budgetRemaining < 0;

  const isProjectedNegative =
    reconciliation.projectedBalance < 0;

  const progressWidth = Math.min(
    reconciliation.expenseBudgetPercentage,
    100,
  );

  return (
    <section
      aria-labelledby="trip-reconciliation-title"
      className="space-y-4"
    >
      <div>
        <h3
          id="trip-reconciliation-title"
          className="
            text-lg
            font-semibold
            text-slate-900
          "
        >
          Conciliación financiera
        </h3>

        <p
          className="
            mt-1
            text-sm
            text-slate-500
          "
        >
          Comparación entre cobros, pagos,
          gastos reales y presupuesto.
        </p>
      </div>

      <div
        className="
          grid
          gap-4
          md:grid-cols-2
          xl:grid-cols-4
        "
      >
        <ReconciliationCard
          description={
            "Pagos recibidos menos gastos " +
            "reales registrados."
          }
          icon={WalletCards}
          label="Efectivo disponible"
          value={
            reconciliation.availableCash
          }
          variant={
            isCashNegative
              ? "danger"
              : "positive"
          }
        />

        <ReconciliationCard
          description={
            "Presupuesto estimado menos " +
            "gastos reales."
          }
          icon={
            isBudgetExceeded
              ? TrendingDown
              : TrendingUp
          }
          label="Disponible del presupuesto"
          value={
            reconciliation.budgetRemaining
          }
          variant={
            isBudgetExceeded
              ? "danger"
              : "positive"
          }
        />

        <ReconciliationCard
          description={
            "Total de cargos menos gastos " +
            "reales."
          }
          icon={Landmark}
          label="Saldo proyectado"
          value={
            reconciliation.projectedBalance
          }
          variant={
            isProjectedNegative
              ? "danger"
              : "neutral"
          }
        />

        <ReconciliationCard
          description={
            "Egresos reales registrados " +
            "para este viaje."
          }
          icon={CircleDollarSign}
          label="Gastos reales"
          value={
            reconciliation.totalExpenses
          }
          variant={
            isBudgetExceeded
              ? "danger"
              : "warning"
          }
        />
      </div>

      <div
        className="
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-5
          shadow-sm
        "
      >
        <div
          className="
            flex
            flex-col
            gap-2
            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >
          <div>
            <p
              className="
                text-sm
                font-semibold
                text-slate-900
              "
            >
              Presupuesto consumido
            </p>

            <p
              className="
                mt-1
                text-xs
                text-slate-500
              "
            >
              {formatCurrency(
                reconciliation.totalExpenses,
              )}{" "}
              de{" "}
              {formatCurrency(
                reconciliation.estimatedBudget,
              )}
            </p>
          </div>

          <p
            className={`
              text-lg
              font-bold
              ${
                isBudgetExceeded
                  ? "text-rose-700"
                  : "text-slate-900"
              }
            `}
          >
            {formatPercentage(
              reconciliation
                .expenseBudgetPercentage,
            )}
            %
          </p>
        </div>

        <div
          aria-label={`Presupuesto consumido: ${formatPercentage(
            reconciliation
              .expenseBudgetPercentage,
          )}%`}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={Math.min(
            Math.round(
              reconciliation
                .expenseBudgetPercentage,
            ),
            100,
          )}
          className="
            mt-4
            h-3
            overflow-hidden
            rounded-full
            bg-slate-200
          "
          role="progressbar"
        >
          <div
            className={`
              h-full
              rounded-full
              transition-all
              ${
                isBudgetExceeded
                  ? "bg-rose-600"
                  : "bg-emerald-600"
              }
            `}
            style={{
              width: `${progressWidth}%`,
            }}
          />
        </div>

        {isBudgetExceeded ? (
          <div
            className="
              mt-4
              flex
              gap-3
              rounded-xl
              border
              border-rose-200
              bg-rose-50
              px-4
              py-3
              text-sm
              text-rose-800
            "
            role="alert"
          >
            <TriangleAlert
              aria-hidden="true"
              className="
                mt-0.5
                h-5
                w-5
                shrink-0
              "
            />

            <p>
              Los gastos reales superan el
              presupuesto estimado por{" "}
              <strong>
                {formatCurrency(
                  Math.abs(
                    reconciliation
                      .budgetRemaining,
                  ),
                )}
              </strong>
              .
            </p>
          </div>
        ) : null}

        {isCashNegative ? (
          <div
            className="
              mt-4
              flex
              gap-3
              rounded-xl
              border
              border-amber-200
              bg-amber-50
              px-4
              py-3
              text-sm
              text-amber-900
            "
            role="alert"
          >
            <TriangleAlert
              aria-hidden="true"
              className="
                mt-0.5
                h-5
                w-5
                shrink-0
              "
            />

            <p>
              Los gastos registrados superan
              los pagos recibidos por{" "}
              <strong>
                {formatCurrency(
                  Math.abs(
                    reconciliation
                      .availableCash,
                  ),
                )}
              </strong>
              .
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default function TripFinancialDashboard({
  tripId,
  tripName,
}: TripFinancialDashboardProps) {
  const {
    summary,
    participants,
    metrics,
    reconciliation,
    expenseCategories,
    leadingExpenseCategory,
    loading,
    error,
    refreshFinancialDashboard,
  } = useTripFinancialDashboard(tripId);

  return (
    <section
      aria-labelledby="trip-financial-dashboard-title"
      className="space-y-5"
    >
      <header
        className="
          flex
          flex-col
          gap-3
          sm:flex-row
          sm:items-start
          sm:justify-between
        "
      >
        <div>
          <h2
            id="trip-financial-dashboard-title"
            className="
              text-xl
              font-semibold
              tracking-tight
              text-slate-900
            "
          >
            Dashboard financiero
          </h2>

          <p
            className="
              mt-1
              text-sm
              leading-5
              text-slate-500
            "
          >
            Vista ejecutiva de cargos, pagos,
            gastos y saldos de {tripName}.
          </p>
        </div>

        <button
          className="
            inline-flex
            shrink-0
            items-center
            justify-center
            gap-2
            rounded-lg
            border
            border-slate-300
            bg-white
            px-3
            py-2
            text-sm
            font-medium
            text-slate-700
            shadow-sm
            transition-colors
            hover:bg-slate-50
            disabled:cursor-not-allowed
            disabled:opacity-60
            focus:outline-none
            focus:ring-2
            focus:ring-slate-500
            focus:ring-offset-2
          "
          disabled={loading}
          onClick={() => {
            void refreshFinancialDashboard();
          }}
          type="button"
        >
          <RefreshCw
            aria-hidden="true"
            className={`
              h-4
              w-4
              ${loading ? "animate-spin" : ""}
            `}
          />

          Actualizar
        </button>
      </header>

      {loading && !summary ? (
        <LoadingState />
      ) : error ? (
        <ErrorState
          error={error}
          onRetry={
            refreshFinancialDashboard
          }
        />
      ) : summary ? (
        <>
          <TripFinancialSummaryCards
            metrics={metrics}
            summary={summary}
          />

          <TripFinancialReconciliationSection
            reconciliation={reconciliation}
          />

          <TripFinancialHealthCard
            reconciliation={reconciliation}
            participants={participants}
          />

          <TripExpenseCategoryAnalysis
            categories={expenseCategories}
            leadingCategory={
              leadingExpenseCategory
            }
          />

          <TripFinancialRiskAnalysis
            estimatedBudget={
              reconciliation.estimatedBudget
            }
            participants={participants}
          />

          <TripFinancialProgress
            metrics={metrics}
            summary={summary}
          />

          <TripMemberFinancialTable
            participants={participants}
          />
        </>
      ) : (
        <div
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            px-5
            py-10
            text-center
            shadow-sm
          "
        >
          <p
            className="
              text-sm
              font-medium
              text-slate-700
            "
          >
            No existe información financiera
            disponible.
          </p>
        </div>
      )}
    </section>
  );
}