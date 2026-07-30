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
import TripFinancialExportButton from "@/components/trips/TripFinancialExportButton";
import TripFinancialHealthCard from "@/components/trips/TripFinancialHealthCard";
import TripFinancialMetricCard from "@/components/trips/TripFinancialMetricCard";
import TripFinancialProgress from "@/components/trips/TripFinancialProgress";
import TripFinancialProgressCard from "@/components/trips/TripFinancialProgressCard";
import TripFinancialRiskAnalysis from "@/components/trips/TripFinancialRiskAnalysis";
import TripFinancialSection from "@/components/trips/TripFinancialSection";
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

interface FinancialAlertProps {
  message: React.ReactNode;

  tone: "danger" | "warning";
}

function FinancialAlert({
  message,
  tone,
}: FinancialAlertProps) {
  const toneClasses =
    tone === "danger"
      ? (
        "border-rose-200 " +
        "bg-rose-50 " +
        "text-rose-800"
      )
      : (
        "border-amber-200 " +
        "bg-amber-50 " +
        "text-amber-900"
      );

  return (
    <div
      className={`
        flex
        gap-3
        rounded-xl
        border
        px-4
        py-3
        text-sm
        ${toneClasses}
      `}
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

      <p>{message}</p>
    </div>
  );
}

interface ReconciliationContentProps {
  reconciliation:
    TripFinancialReconciliation;
}

function ReconciliationContent({
  reconciliation,
}: ReconciliationContentProps) {
  const isCashNegative =
    reconciliation.availableCash < 0;

  const isBudgetExceeded =
    reconciliation.budgetRemaining < 0;

  const isProjectedNegative =
    reconciliation.projectedBalance < 0;

  return (
    <div className="space-y-4">
      <div
        className="
          grid
          gap-4
          md:grid-cols-2
          xl:grid-cols-4
        "
      >
        <TripFinancialMetricCard
          description={
            "Pagos recibidos menos gastos " +
            "reales registrados."
          }
          icon={WalletCards}
          title="Efectivo disponible"
          value={formatCurrency(
            reconciliation.availableCash,
          )}
          tone={
            isCashNegative
              ? "danger"
              : "positive"
          }
        />

        <TripFinancialMetricCard
          description={
            "Presupuesto estimado menos " +
            "gastos reales."
          }
          icon={
            isBudgetExceeded
              ? TrendingDown
              : TrendingUp
          }
          title="Disponible del presupuesto"
          value={formatCurrency(
            reconciliation.budgetRemaining,
          )}
          tone={
            isBudgetExceeded
              ? "danger"
              : "positive"
          }
        />

        <TripFinancialMetricCard
          description={
            "Total de cargos menos gastos " +
            "reales."
          }
          icon={Landmark}
          title="Saldo proyectado"
          value={formatCurrency(
            reconciliation.projectedBalance,
          )}
          tone={
            isProjectedNegative
              ? "danger"
              : "neutral"
          }
        />

        <TripFinancialMetricCard
          description={
            "Egresos reales registrados " +
            "para este viaje."
          }
          icon={CircleDollarSign}
          title="Gastos reales"
          value={formatCurrency(
            reconciliation.totalExpenses,
          )}
          tone={
            isBudgetExceeded
              ? "danger"
              : "warning"
          }
        />
      </div>

      <TripFinancialProgressCard
        title="Presupuesto consumido"
        description={
          "Porcentaje del presupuesto " +
          "estimado que ya representan " +
          "los gastos reales registrados."
        }
        percentage={
          reconciliation
            .expenseBudgetPercentage
        }
        supportingText={
          `${formatCurrency(
            reconciliation.totalExpenses,
          )} de ${formatCurrency(
            reconciliation.estimatedBudget,
          )}`
        }
        icon={
          isBudgetExceeded
            ? TrendingDown
            : TrendingUp
        }
        tone={
          isBudgetExceeded
            ? "danger"
            : "positive"
        }
      />

      {isBudgetExceeded ? (
        <FinancialAlert
          tone="danger"
          message={
            <>
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
            </>
          }
        />
      ) : null}

      {isCashNegative ? (
        <FinancialAlert
          tone="warning"
          message={
            <>
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
            </>
          }
        />
      ) : null}
    </div>
  );
}

function EmptyState() {
  return (
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

  const dashboardActions = (
    <div
      className="
        flex
        flex-col
        gap-2
        sm:flex-row
        sm:items-start
      "
    >
      {summary ? (
        <TripFinancialExportButton
          tripId={tripId}
          tripName={tripName}
          reconciliation={
            reconciliation
          }
          participants={participants}
          expenseCategories={
            expenseCategories
          }
        />
      ) : null}

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
    </div>
  );

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

        {dashboardActions}
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

          <TripFinancialSection
            title="Conciliación financiera"
            description={
              "Comparación entre cobros, " +
              "pagos, gastos reales y " +
              "presupuesto."
            }
          >
            <ReconciliationContent
              reconciliation={reconciliation}
            />
          </TripFinancialSection>

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
        <EmptyState />
      )}
    </section>
  );
}