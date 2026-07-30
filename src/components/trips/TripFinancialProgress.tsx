import type {
  TripFinancialDashboardMetrics,
  TripFinancialSummary,
} from "@/types/tripFinancial";

interface TripFinancialProgressProps {
  summary: TripFinancialSummary;

  metrics: TripFinancialDashboardMetrics;
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

function getRecoveryMessage(
  recoveryPercentage: number,
  totalCharged: number,
): string {
  if (totalCharged <= 0) {
    return "Todavía no se han asignado cargos para este viaje.";
  }

  if (recoveryPercentage >= 100) {
    return "Todos los cargos registrados se encuentran cubiertos.";
  }

  if (recoveryPercentage >= 75) {
    return "La recaudación se encuentra cerca de completar el objetivo.";
  }

  if (recoveryPercentage >= 50) {
    return "Se ha cubierto más de la mitad de los cargos registrados.";
  }

  if (recoveryPercentage > 0) {
    return "La recaudación está en curso.";
  }

  return "Todavía no se han registrado pagos para este viaje.";
}

function getBudgetMessage(
  estimatedBudget: number,
  totalPaid: number,
  budgetCoveragePercentage: number,
): string {
  if (estimatedBudget <= 0) {
    return "El viaje no tiene un presupuesto estimado registrado.";
  }

  if (totalPaid >= estimatedBudget) {
    return (
      "Los pagos recibidos ya cubren el presupuesto " +
      "estimado del viaje."
    );
  }

  return (
    `${budgetCoveragePercentage}% del presupuesto ` +
    "estimado está cubierto con los pagos recibidos."
  );
}

export default function TripFinancialProgress({
  summary,
  metrics,
}: TripFinancialProgressProps) {
  const recoveryPercentage = Math.min(
    Math.max(
      summary.recoveryPercentage,
      0,
    ),
    100,
  );

  const budgetCoveragePercentage = Math.min(
    Math.max(
      metrics.budgetCoveragePercentage,
      0,
    ),
    100,
  );

  const recoveryMessage =
    getRecoveryMessage(
      recoveryPercentage,
      summary.totalCharged,
    );

  const budgetMessage =
    getBudgetMessage(
      summary.estimatedBudget,
      summary.totalPaid,
      budgetCoveragePercentage,
    );

  return (
    <section
      aria-labelledby="trip-financial-progress-title"
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
          sm:items-start
          sm:justify-between
        "
      >
        <div>
          <h3
            id="trip-financial-progress-title"
            className="
              text-lg
              font-semibold
              text-slate-900
            "
          >
            Avance de recaudación
          </h3>

          <p
            className="
              mt-1
              text-sm
              leading-5
              text-slate-500
            "
          >
            Seguimiento de los cargos y pagos
            asociados al viaje.
          </p>
        </div>

        <p
          className="
            text-2xl
            font-semibold
            tracking-tight
            text-slate-900
          "
        >
          {recoveryPercentage}%
        </p>
      </div>

      <div className="mt-5">
        <div
          aria-label={
            `Porcentaje de cargos cubiertos: ` +
            `${recoveryPercentage}%`
          }
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={recoveryPercentage}
          className="
            h-3
            overflow-hidden
            rounded-full
            bg-slate-100
          "
          role="progressbar"
        >
          <div
            className="
              h-full
              rounded-full
              bg-emerald-600
              transition-[width]
              duration-300
            "
            style={{
              width: `${recoveryPercentage}%`,
            }}
          />
        </div>

        <div
          className="
            mt-3
            flex
            flex-col
            gap-1
            text-sm
            text-slate-600
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <p>
            {formatCurrency(
              summary.totalPaid,
            )}{" "}
            recaudados
          </p>

          <p>
            Objetivo asignado:{" "}
            {formatCurrency(
              summary.totalCharged,
            )}
          </p>
        </div>

        <p
          className="
            mt-3
            text-sm
            leading-5
            text-slate-500
          "
        >
          {recoveryMessage}
        </p>
      </div>

      <div
        className="
          mt-6
          border-t
          border-slate-100
          pt-5
        "
      >
        <div
          className="
            flex
            items-center
            justify-between
            gap-4
          "
        >
          <div>
            <p
              className="
                text-sm
                font-medium
                text-slate-700
              "
            >
              Cobertura del presupuesto
            </p>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              {budgetMessage}
            </p>
          </div>

          <p
            className="
              shrink-0
              text-lg
              font-semibold
              text-slate-900
            "
          >
            {budgetCoveragePercentage}%
          </p>
        </div>

        <div
          aria-label={
            `Cobertura del presupuesto estimado: ` +
            `${budgetCoveragePercentage}%`
          }
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={budgetCoveragePercentage}
          className="
            mt-4
            h-2
            overflow-hidden
            rounded-full
            bg-slate-100
          "
          role="progressbar"
        >
          <div
            className="
              h-full
              rounded-full
              bg-sky-600
              transition-[width]
              duration-300
            "
            style={{
              width:
                `${budgetCoveragePercentage}%`,
            }}
          />
        </div>
      </div>
    </section>
  );
}