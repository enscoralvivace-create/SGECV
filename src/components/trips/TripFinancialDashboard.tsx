"use client";

import {
  RefreshCw,
  TriangleAlert,
} from "lucide-react";

import TripFinancialProgress from "@/components/trips/TripFinancialProgress";
import TripFinancialSummaryCards from "@/components/trips/TripFinancialSummaryCards";
import TripMemberFinancialTable from "@/components/trips/TripMemberFinancialTable";

import {
  useTripFinancialDashboard,
} from "@/hooks/useTripFinancialDashboard";

interface TripFinancialDashboardProps {
  tripId: string;

  tripName: string;
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

export default function TripFinancialDashboard({
  tripId,
  tripName,
}: TripFinancialDashboardProps) {
  const {
    summary,
    participants,
    metrics,
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
            Vista ejecutiva de cargos, pagos y
            saldos de {tripName}.
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