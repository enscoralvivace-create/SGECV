"use client";

import Button from "@/components/common/Button";

import type {
  TripFinancialSummary,
  TripMemberFinancialStatus,
} from "@/services/tripService";

interface TripFinancialReportModalProps {
  tripName: string;
  summary: TripFinancialSummary;
  onClose: () => void;
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

function getStatusLabel(
  status: TripMemberFinancialStatus,
): string {
  const labels: Record<
    TripMemberFinancialStatus,
    string
  > = {
    paid: "Pagado",
    partial: "Parcial",
    pending: "Pendiente",
  };

  return labels[status];
}

function getStatusClasses(
  status: TripMemberFinancialStatus,
): string {
  const classes: Record<
    TripMemberFinancialStatus,
    string
  > = {
    paid:
      "border-emerald-300 bg-emerald-50 text-emerald-800",
    partial:
      "border-amber-300 bg-amber-50 text-amber-800",
    pending:
      "border-rose-300 bg-rose-50 text-rose-800",
  };

  return classes[status];
}

export default function TripFinancialReportModal({
  tripName,
  summary,
  onClose,
}: TripFinancialReportModalProps) {
  const recoveryPercentage =
    summary.recoveryPercentage;

  function handlePrint() {
    window.print();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 px-4 py-6 print:static print:block print:bg-white print:p-0">
      <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl print:max-h-none print:max-w-none print:overflow-visible print:rounded-none print:shadow-none">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 print:hidden">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              Viaje
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              Reporte financiero
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              Vista previa lista para impresión
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-lg font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Cerrar reporte financiero"
          >
            ×
          </button>
        </header>

        <div className="overflow-y-auto bg-slate-100 p-6 print:overflow-visible print:bg-white print:p-0">
          <article className="mx-auto w-full max-w-[1050px] bg-white px-8 py-10 shadow-sm print:max-w-none print:px-0 print:py-0 print:shadow-none">
            <section className="border-b-2 border-slate-900 pb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Ensamble Coral Vivace
              </p>

              <h1 className="mt-3 text-3xl font-bold text-slate-950">
                Reporte financiero del viaje
              </h1>

              <p className="mt-2 text-xl font-semibold text-slate-700">
                {tripName}
              </p>
            </section>

            <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-4">
              <article className="rounded-xl border border-slate-300 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Presupuesto
                </p>

                <p className="mt-2 text-xl font-bold text-slate-950">
                  {formatCurrency(
                    summary.estimatedBudget,
                  )}
                </p>
              </article>

              <article className="rounded-xl border border-blue-300 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                  Cargos generados
                </p>

                <p className="mt-2 text-xl font-bold text-slate-950">
                  {formatCurrency(
                    summary.totalCharged,
                  )}
                </p>
              </article>

              <article className="rounded-xl border border-emerald-300 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  Total pagado
                </p>

                <p className="mt-2 text-xl font-bold text-slate-950">
                  {formatCurrency(
                    summary.totalPaid,
                  )}
                </p>
              </article>

              <article className="rounded-xl border border-amber-300 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                  Saldo pendiente
                </p>

                <p className="mt-2 text-xl font-bold text-slate-950">
                  {formatCurrency(
                    summary.totalPending,
                  )}
                </p>
              </article>
            </section>

            <section className="mt-8 rounded-xl border border-slate-300 p-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    Recuperación financiera
                  </h2>

                  <p className="mt-1 text-sm text-slate-600">
                    Porcentaje recuperado de los cargos
                    generados.
                  </p>
                </div>

                <p className="text-2xl font-bold text-emerald-800">
                  {recoveryPercentage.toFixed(1)}%
                </p>
              </div>

              <div className="mt-4 h-4 overflow-hidden rounded-full border border-slate-300 bg-slate-100">
                <div
                  className="h-full bg-emerald-600"
                  style={{
                    width: `${Math.min(
                      recoveryPercentage,
                      100,
                    )}%`,
                  }}
                />
              </div>
            </section>

            <section className="mt-8">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-slate-950">
                  Relación completa de cargos
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  Desglose individual de los cargos
                  vinculados al viaje.
                </p>
              </div>

              {summary.members.length > 0 ? (
                <div className="overflow-hidden rounded-xl border border-slate-300">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-700">
                      <tr>
                        <th className="border-b border-slate-300 px-4 py-3">
                          Integrante
                        </th>

                        <th className="border-b border-slate-300 px-4 py-3">
                          Concepto
                        </th>

                        <th className="border-b border-slate-300 px-4 py-3 text-right">
                          Cargo
                        </th>

                        <th className="border-b border-slate-300 px-4 py-3 text-right">
                          Pagado
                        </th>

                        <th className="border-b border-slate-300 px-4 py-3 text-right">
                          Pendiente
                        </th>

                        <th className="border-b border-slate-300 px-4 py-3 text-center">
                          Estado
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-200">
                      {summary.members.map(
                        (charge) => (
                          <tr
                            key={charge.chargeId}
                            className="break-inside-avoid"
                          >
                            <td className="px-4 py-3 font-semibold text-slate-900">
                              {charge.memberName}
                            </td>

                            <td className="px-4 py-3 text-slate-700">
                              {charge.feeTypeName}
                            </td>

                            <td className="px-4 py-3 text-right font-medium text-slate-800">
                              {formatCurrency(
                                charge.totalCharged,
                              )}
                            </td>

                            <td className="px-4 py-3 text-right font-medium text-emerald-700">
                              {formatCurrency(
                                charge.totalPaid,
                              )}
                            </td>

                            <td className="px-4 py-3 text-right font-medium text-amber-700">
                              {formatCurrency(
                                charge.totalPending,
                              )}
                            </td>

                            <td className="px-4 py-3 text-center">
                              <span
                                className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                                  charge.status,
                                )}`}
                              >
                                {getStatusLabel(
                                  charge.status,
                                )}
                              </span>
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>

                    <tfoot className="border-t-2 border-slate-400 bg-slate-100 font-bold text-slate-950">
                      <tr>
                        <td
                          colSpan={2}
                          className="px-4 py-3"
                        >
                          Totales
                        </td>

                        <td className="px-4 py-3 text-right">
                          {formatCurrency(
                            summary.totalCharged,
                          )}
                        </td>

                        <td className="px-4 py-3 text-right text-emerald-800">
                          {formatCurrency(
                            summary.totalPaid,
                          )}
                        </td>

                        <td className="px-4 py-3 text-right text-amber-800">
                          {formatCurrency(
                            summary.totalPending,
                          )}
                        </td>

                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-300 bg-slate-50 px-5 py-6 text-center text-sm text-slate-600">
                  Este viaje todavía no tiene cargos
                  financieros vinculados.
                </div>
              )}
            </section>
          </article>
        </div>

        <footer className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-5 print:hidden">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cerrar
          </Button>

          <Button onClick={handlePrint}>
            Imprimir
          </Button>
        </footer>
      </div>
    </div>
  );
}
