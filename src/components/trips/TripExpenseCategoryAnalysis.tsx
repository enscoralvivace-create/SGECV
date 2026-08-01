"use client";

import {
  ChartNoAxesColumnIncreasing,
  CircleDollarSign,
} from "lucide-react";

import type {
  TripExpenseCategorySummary,
} from "@/hooks/useTripFinancialDashboard";

interface TripExpenseCategoryAnalysisProps {
  categories:
    TripExpenseCategorySummary[];

  leadingCategory:
    TripExpenseCategorySummary | null;
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

export default function TripExpenseCategoryAnalysis({
  categories,
  leadingCategory,
}: TripExpenseCategoryAnalysisProps) {
  return (
    <section
      aria-labelledby="trip-expense-category-analysis-title"
      className="
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-sm
      "
    >
      <header
        className="
          flex
          flex-col
          gap-3
          border-b
          border-slate-200
          px-5
          py-4
          sm:flex-row
          sm:items-start
          sm:justify-between
        "
      >
        <div>
          <h3
            id="trip-expense-category-analysis-title"
            className="
              text-lg
              font-semibold
              text-slate-900
            "
          >
            Gastos por categoría
          </h3>

          <p
            className="
              mt-1
              text-sm
              text-slate-500
            "
          >
            Distribución de los egresos reales
            registrados para el viaje.
          </p>
        </div>

        <div
          className="
            inline-flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-slate-100
            text-slate-700
          "
        >
          <ChartNoAxesColumnIncreasing
            aria-hidden="true"
            className="h-5 w-5"
          />
        </div>
      </header>

      {categories.length === 0 ? (
        <div
          className="
            px-5
            py-10
            text-center
          "
        >
          <CircleDollarSign
            aria-hidden="true"
            className="
              mx-auto
              h-8
              w-8
              text-slate-300
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
            Aún no hay gastos para analizar.
          </p>

          <p
            className="
              mt-1
              text-sm
              text-slate-500
            "
          >
            El análisis aparecerá cuando se
            registren egresos.
          </p>
        </div>
      ) : (
        <div
          className="
            grid
            gap-0
            lg:grid-cols-[minmax(0,1fr)_280px]
          "
        >
          <div className="overflow-x-auto overscroll-x-contain">
            <table
              className="
                min-w-full
                divide-y
                divide-slate-200
              "
            >
              <thead className="bg-slate-50">
                <tr>
                  <th
                    className="
                      px-5
                      py-3
                      text-left
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wide
                      text-slate-500
                    "
                  >
                    Categoría
                  </th>

                  <th
                    className="
                      px-5
                      py-3
                      text-right
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wide
                      text-slate-500
                    "
                  >
                    Registros
                  </th>

                  <th
                    className="
                      px-5
                      py-3
                      text-right
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wide
                      text-slate-500
                    "
                  >
                    Total
                  </th>

                  <th
                    className="
                      px-5
                      py-3
                      text-right
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wide
                      text-slate-500
                    "
                  >
                    % de gastos
                  </th>

                  <th
                    className="
                      px-5
                      py-3
                      text-right
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wide
                      text-slate-500
                    "
                  >
                    % del presupuesto
                  </th>
                </tr>
              </thead>

              <tbody
                className="
                  divide-y
                  divide-slate-100
                "
              >
                {categories.map(
                  (category) => (
                    <tr
                      key={category.category}
                      className="
                        transition-colors
                        hover:bg-slate-50
                      "
                    >
                      <td
                        className="
                          px-5
                          py-4
                          text-sm
                          font-medium
                          text-slate-900
                        "
                      >
                        {category.category}
                      </td>

                      <td
                        className="
                          whitespace-nowrap
                          px-5
                          py-4
                          text-right
                          text-sm
                          text-slate-600
                        "
                      >
                        {category.expenseCount}
                      </td>

                      <td
                        className="
                          whitespace-nowrap
                          px-5
                          py-4
                          text-right
                          text-sm
                          font-semibold
                          text-slate-900
                        "
                      >
                        {formatCurrency(
                          category.totalAmount,
                        )}
                      </td>

                      <td
                        className="
                          whitespace-nowrap
                          px-5
                          py-4
                          text-right
                          text-sm
                          text-slate-600
                        "
                      >
                        {formatPercentage(
                          category
                            .percentageOfExpenses,
                        )}
                        %
                      </td>

                      <td
                        className="
                          whitespace-nowrap
                          px-5
                          py-4
                          text-right
                          text-sm
                          text-slate-600
                        "
                      >
                        {formatPercentage(
                          category
                            .percentageOfBudget,
                        )}
                        %
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>

          <aside
            className="
              border-t
              border-slate-200
              bg-slate-50
              p-5
              lg:border-l
              lg:border-t-0
            "
          >
            <p
              className="
                text-xs
                font-semibold
                uppercase
                tracking-wide
                text-slate-500
              "
            >
              Categoría con mayor gasto
            </p>

            {leadingCategory ? (
              <>
                <p
                  className="
                    mt-4
                    text-xl
                    font-bold
                    text-slate-950
                  "
                >
                  {leadingCategory.category}
                </p>

                <p
                  className="
                    mt-2
                    text-2xl
                    font-bold
                    text-slate-900
                  "
                >
                  {formatCurrency(
                    leadingCategory.totalAmount,
                  )}
                </p>

                <div
                  className="
                    mt-5
                    space-y-3
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    p-4
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
                    <span
                      className="
                        text-sm
                        text-slate-500
                      "
                    >
                      Del gasto total
                    </span>

                    <strong
                      className="
                        text-sm
                        text-slate-900
                      "
                    >
                      {formatPercentage(
                        leadingCategory
                          .percentageOfExpenses,
                      )}
                      %
                    </strong>
                  </div>

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-4
                    "
                  >
                    <span
                      className="
                        text-sm
                        text-slate-500
                      "
                    >
                      Del presupuesto
                    </span>

                    <strong
                      className="
                        text-sm
                        text-slate-900
                      "
                    >
                      {formatPercentage(
                        leadingCategory
                          .percentageOfBudget,
                      )}
                      %
                    </strong>
                  </div>

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-4
                    "
                  >
                    <span
                      className="
                        text-sm
                        text-slate-500
                      "
                    >
                      Registros
                    </span>

                    <strong
                      className="
                        text-sm
                        text-slate-900
                      "
                    >
                      {
                        leadingCategory
                          .expenseCount
                      }
                    </strong>
                  </div>
                </div>
              </>
            ) : null}
          </aside>
        </div>
      )}
    </section>
  );
}