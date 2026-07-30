import { useMemo } from "react";

import {
  TRIP_BUDGET_CATEGORY_LABELS,
  type TripBudgetCategory,
  type TripBudgetItem,
} from "@/types/tripBudget";

interface TripBudgetCategoryChartProps {
  items: TripBudgetItem[];
}

interface CategorySummary {
  category: TripBudgetCategory;
  estimatedAmount: number;
  actualAmount: number;
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

function calculateCategorySummaries(
  items: TripBudgetItem[],
): CategorySummary[] {
  const summaries = new Map<
    TripBudgetCategory,
    CategorySummary
  >();

  items.forEach((item) => {
    const current =
      summaries.get(item.category);

    if (current) {
      current.estimatedAmount +=
        item.estimatedAmount;

      current.actualAmount +=
        item.actualAmount;

      return;
    }

    summaries.set(
      item.category,
      {
        category: item.category,
        estimatedAmount:
          item.estimatedAmount,
        actualAmount:
          item.actualAmount,
      },
    );
  });

  return Array.from(
    summaries.values(),
  ).sort(
    (
      firstCategory,
      secondCategory,
    ) =>
      secondCategory.estimatedAmount -
      firstCategory.estimatedAmount,
  );
}

function getBarWidth(
  value: number,
  maximumValue: number,
): number {
  if (maximumValue <= 0) {
    return 0;
  }

  return Math.min(
    (value / maximumValue) * 100,
    100,
  );
}

export default function TripBudgetCategoryChart({
  items,
}: TripBudgetCategoryChartProps) {
  const categorySummaries =
    useMemo(
      () =>
        calculateCategorySummaries(
          items,
        ),
      [items],
    );

  const maximumValue =
    useMemo(
      () =>
        categorySummaries.reduce(
          (
            currentMaximum,
            category,
          ) =>
            Math.max(
              currentMaximum,
              category.estimatedAmount,
              category.actualAmount,
            ),
          0,
        ),
      [categorySummaries],
    );

  if (
    categorySummaries.length === 0
  ) {
    return null;
  }

  return (
    <div className="border-b border-slate-200 bg-white px-6 py-5">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Distribución por categorías
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Comparación entre el presupuesto
            estimado y el gasto real.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-4 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-slate-300" />

            <span>
              Estimado
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-emerald-600" />

            <span>
              Gasto real
            </span>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {categorySummaries.map(
            (category) => {
              const estimatedWidth =
                getBarWidth(
                  category.estimatedAmount,
                  maximumValue,
                );

              const actualWidth =
                getBarWidth(
                  category.actualAmount,
                  maximumValue,
                );

              return (
                <div
                  key={
                    category.category
                  }
                >
                  <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-semibold text-slate-800">
                      {
                        TRIP_BUDGET_CATEGORY_LABELS[
                          category.category
                        ]
                      }
                    </p>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                      <span className="text-slate-500">
                        Estimado:{" "}
                        <strong className="text-slate-700">
                          {formatCurrency(
                            category.estimatedAmount,
                          )}
                        </strong>
                      </span>

                      <span className="text-slate-500">
                        Real:{" "}
                        <strong className="text-emerald-700">
                          {formatCurrency(
                            category.actualAmount,
                          )}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-slate-300 transition-all duration-500"
                        style={{
                          width: `${estimatedWidth}%`,
                        }}
                      />
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                        style={{
                          width: `${actualWidth}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            },
          )}
        </div>
      </div>
    </div>
  );
}