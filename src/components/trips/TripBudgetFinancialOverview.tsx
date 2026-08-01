"use client";

interface TripBudgetFinancialOverviewProps {
  estimatedTotal: number;
  actualTotal: number;
}

function formatCurrency(
  value: number,
): string {
  return new Intl.NumberFormat(
    "es-MX",
    {
      style: "currency",
      currency: "MXN",
    },
  ).format(value);
}

export default function TripBudgetFinancialOverview({
  estimatedTotal,
  actualTotal,
}: TripBudgetFinancialOverviewProps) {
  const difference =
    actualTotal - estimatedTotal;

  const percentage =
    estimatedTotal === 0
      ? 0
      : Math.min(
          (actualTotal /
            estimatedTotal) *
            100,
          100,
        );

  const differenceClasses =
    difference > 0
      ? "text-rose-700"
      : difference < 0
        ? "text-emerald-700"
        : "text-slate-700";

  return (
    <section className="px-6 pt-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          <div>
            <p className="text-sm text-slate-500">
              Presupuesto estimado
            </p>

            <p className="mt-2 text-2xl font-bold sm:text-3xl">
              {formatCurrency(
                estimatedTotal,
              )}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Gasto real
            </p>

            <p className="mt-2 text-2xl font-bold sm:text-3xl">
              {formatCurrency(
                actualTotal,
              )}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Diferencia
            </p>

            <p
              className={`mt-2 text-2xl font-bold sm:text-3xl ${differenceClasses}`}
            >
              {formatCurrency(
                difference,
              )}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-2 flex justify-between text-sm font-medium text-slate-600">
            <span>
              Avance del gasto
            </span>

            <span>
              {percentage.toFixed(1)}%
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all"
              style={{
                width: `${percentage}%`,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}