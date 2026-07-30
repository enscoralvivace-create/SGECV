"use client";

import type { TripExpense } from "@/types/tripExpense";

interface TripExpensesTableProps {
  expenses: TripExpense[];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(value);
}

export default function TripExpensesTable({
  expenses,
}: TripExpensesTableProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Gastos del viaje
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Registro de los gastos reales del viaje.
        </p>
      </div>

      {expenses.length === 0 ? (
        <div className="px-5 py-10 text-center text-slate-500">
          Aún no se han registrado gastos.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">Fecha</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">Concepto</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">Categoría</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">Proveedor</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-slate-500">Importe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 text-sm">{expense.expenseDate}</td>
                  <td className="px-5 py-4 text-sm font-medium">{expense.description}</td>
                  <td className="px-5 py-4 text-sm">{expense.category}</td>
                  <td className="px-5 py-4 text-sm">{expense.supplier ?? "—"}</td>
                  <td className="px-5 py-4 text-right text-sm font-semibold">
                    {formatCurrency(expense.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}