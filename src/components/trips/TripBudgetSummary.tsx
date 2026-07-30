import type {
  TripBudgetSummary as TripBudgetSummaryData,
} from "@/types/tripBudget";

interface TripBudgetSummaryProps {
  summary: TripBudgetSummaryData;
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

function getDifferenceClasses(
  difference: number,
): string {
  if (difference > 0) {
    return "text-rose-700";
  }

  if (difference < 0) {
    return "text-emerald-700";
  }

  return "text-slate-700";
}

function getProgressBarClasses(
  percentage: number,
): string {
  if (percentage > 100) {
    return "bg-rose-600";
  }

  if (percentage >= 80) {
    return "bg-amber-500";
  }

  return "bg-emerald-600";
}

function getProgressStatus(
  percentage: number,
): string {
  if (percentage > 100) {
    return "Presupuesto excedido";
  }

  if (percentage >= 80) {
    return "Cerca del límite";
  }

  return "Dentro del presupuesto";
}

function getProgressStatusClasses(
  percentage: number,
): string {
  if (percentage > 100) {
    return (
      "bg-rose-50 text-rose-700 " +
      "ring-rose-200"
    );
  }

  if (percentage >= 80) {
    return (
      "bg-amber-50 text-amber-700 " +
      "ring-amber-200"
    );
  }

  return (
    "bg-emerald-50 text-emerald-700 " +
    "ring-emerald-200"
  );
}

export default function TripBudgetSummary({
  summary,
}: TripBudgetSummaryProps) {
  const progressPercentage =
    summary.executionPercentage;

  const progressBarWidth =
    Math.min(
      Math.max(
        progressPercentage,
        0,
      ),
      100,
    );

  const remainingAmount =
    summary.totalEstimated -
    summary.totalActual;

  return (
    <>
      <div className="grid gap-4 border-b border-slate-200 bg-slate-50 p-6 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Presupuesto estimado
          </p>

          <p className="mt-2 text-xl font-bold text-slate-900">
            {formatCurrency(
              summary.totalEstimated,
            )}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Gasto real
          </p>

          <p className="mt-2 text-xl font-bold text-slate-900">
            {formatCurrency(
              summary.totalActual,
            )}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Diferencia
          </p>

          <p
            className={`mt-2 text-xl font-bold ${getDifferenceClasses(
              summary.variance,
            )}`}
          >
            {formatCurrency(
              summary.variance,
            )}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Ejecución
          </p>

          <p className="mt-2 text-xl font-bold text-indigo-700">
            {progressPercentage.toFixed(
              1,
            )}
            %
          </p>
        </div>
      </div>

      <div className="border-b border-slate-200 bg-white px-6 py-5">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-bold text-slate-900">
                Uso del presupuesto
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {formatCurrency(
                  summary.totalActual,
                )}{" "}
                utilizados de{" "}
                {formatCurrency(
                  summary.totalEstimated,
                )}
              </p>
            </div>

            <span
              className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${getProgressStatusClasses(
                progressPercentage,
              )}`}
            >
              {getProgressStatus(
                progressPercentage,
              )}
            </span>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-slate-600">
                Ejecución
              </span>

              <span className="text-sm font-bold text-slate-900">
                {progressPercentage.toFixed(
                  1,
                )}
                %
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getProgressBarClasses(
                  progressPercentage,
                )}`}
                style={{
                  width: `${progressBarWidth}%`,
                }}
              />
            </div>
          </div>

          <div className="mt-4 border-t border-slate-200 pt-4">
            {remainingAmount >= 0 ? (
              <p className="text-sm text-slate-600">
                Disponible:{" "}
                <span className="font-bold text-emerald-700">
                  {formatCurrency(
                    remainingAmount,
                  )}
                </span>
              </p>
            ) : (
              <p className="text-sm text-slate-600">
                Excedido por:{" "}
                <span className="font-bold text-rose-700">
                  {formatCurrency(
                    Math.abs(
                      remainingAmount,
                    ),
                  )}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}