"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Button from "@/components/common/Button";
import AccessDenied from "@/components/auth/AccessDenied";
import VivaceLoading from "@/components/ui/VivaceLoading";
import TripFinancialReportModal from "@/components/trips/TripFinancialReportModal";
import RegisterPaymentModal from "@/components/payments/RegisterPaymentModal";
import useUserAccess from "@/hooks/useUserAccess";

import {
  getTripFinancialSummary,
} from "@/services/tripService";

import type {
  TripFinancialSummary,
  TripMemberFinancialStatus,
  TripMemberFinancialSummary,
} from "@/types/tripFinancial";

interface TripFinancialSummaryModalProps {
  tripId: string;
  tripName: string;
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

function getErrorMessage(
  error: unknown,
): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Error desconocido.";
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
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    partial:
      "border-amber-200 bg-amber-50 text-amber-700",
    pending:
      "border-rose-200 bg-rose-50 text-rose-700",
  };

  return classes[status];
}

export default function TripFinancialSummaryModal({
  tripId,
  tripName,
  onClose,
}: TripFinancialSummaryModalProps) {
  const {
    isLoading: isLoadingAccess,
    error: accessError,
    hasPermission,
  } = useUserAccess();

  const canManageFees = hasPermission("fees.manage");
  const canViewAllFees = hasPermission("fees.viewAll");

  const [
    summary,
    setSummary,
  ] = useState<TripFinancialSummary | null>(
    null,
  );

  const [
    selectedCharge,
    setSelectedCharge,
  ] =
    useState<TripMemberFinancialSummary | null>(
      null,
    );
  const [
    isReportOpen,
    setIsReportOpen,
  ] = useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadSummary = useCallback(
    async () => {
      if (isLoadingAccess || !canViewAllFees) {
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const financialSummary =
          await getTripFinancialSummary(
            tripId,
          );

        setSummary(financialSummary);
      } catch (loadError: unknown) {
        setError(
          `No fue posible cargar el resumen financiero: ${getErrorMessage(
            loadError,
          )}`,
        );
      } finally {
        setIsLoading(false);
      }
    },
    [canViewAllFees, isLoadingAccess, tripId],
  );

  useEffect(() => {
    if (!isLoadingAccess && canViewAllFees) {
      void loadSummary();
    }
  }, [canViewAllFees, isLoadingAccess, loadSummary]);

  function handlePaymentCreated() {
    setSelectedCharge(null);
    void loadSummary();
  }

  const recoveryPercentage =
    summary?.recoveryPercentage ?? 0;

  if (isLoadingAccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
        <div className="w-full max-w-4xl rounded-3xl bg-white shadow-2xl">
          <VivaceLoading message="Verificando permisos..." />
        </div>
      </div>
    );
  }

  if (!canViewAllFees) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
        <div className="w-full max-w-4xl rounded-3xl bg-white shadow-2xl">
          <AccessDenied
            title="Acceso denegado"
            description={
              accessError ||
              "No cuentas con permisos para consultar información financiera de otros integrantes."
            }
            showBackButton={false}
            className="min-h-64"
          />
          <div className="flex justify-end border-t border-slate-200 p-4">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8 print:hidden">
        <div className="w-full max-w-6xl overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
          <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                Viaje
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                Resumen financiero
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                {tripName}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-lg font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="Cerrar resumen financiero"
            >
              ×
            </button>
          </header>

          <div className="max-h-[75vh] overflow-y-auto px-6 py-6">
            {isLoading && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-8 text-center text-sm font-medium text-slate-600">
                Cargando resumen financiero...
              </div>
            )}

            {!isLoading && error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
                <p>{error}</p>

                <button
                  type="button"
                  onClick={() =>
                    void loadSummary()
                  }
                  className="mt-4 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                >
                  Intentar nuevamente
                </button>
              </div>
            )}

            {!isLoading &&
              !error &&
              summary && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <article className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                      <p className="text-sm font-medium text-slate-600">
                        Presupuesto estimado
                      </p>

                      <p className="mt-2 text-2xl font-bold text-slate-900">
                        {formatCurrency(
                          summary.estimatedBudget,
                        )}
                      </p>
                    </article>

                    <article className="rounded-xl border border-blue-200 bg-blue-50 p-5">
                      <p className="text-sm font-medium text-blue-700">
                        Cargos generados
                      </p>

                      <p className="mt-2 text-2xl font-bold text-blue-950">
                        {formatCurrency(
                          summary.totalCharged,
                        )}
                      </p>
                    </article>

                    <article className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                      <p className="text-sm font-medium text-emerald-700">
                        Total pagado
                      </p>

                      <p className="mt-2 text-2xl font-bold text-emerald-950">
                        {formatCurrency(
                          summary.totalPaid,
                        )}
                      </p>
                    </article>

                    <article className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                      <p className="text-sm font-medium text-amber-700">
                        Saldo pendiente
                      </p>

                      <p className="mt-2 text-2xl font-bold text-amber-950">
                        {formatCurrency(
                          summary.totalPending,
                        )}
                      </p>
                    </article>
                  </div>

                  <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          Recuperación
                        </h3>

                        <p className="mt-1 text-sm text-slate-600">
                          Porcentaje cubierto de los cargos generados.
                        </p>
                      </div>

                      <p className="text-2xl font-bold text-emerald-800">
                        {recoveryPercentage.toFixed(
                          1,
                        )}
                        %
                      </p>
                    </div>

                    <div className="mt-4 h-4 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-emerald-600 transition-all"
                        style={{
                          width: `${Math.min(
                            recoveryPercentage,
                            100,
                          )}%`,
                        }}
                      />
                    </div>
                  </section>

                  {summary.members.length >
                  0 ? (
                    <section className="mt-6">
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-slate-900">
                          Desglose por integrante
                        </h3>

                        <p className="mt-1 text-sm text-slate-600">
                          Estado financiero individual de los cargos vinculados a este viaje.
                        </p>
                      </div>

                      <div className="overflow-hidden rounded-xl border border-slate-200">
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[1100px] text-left">
                            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
                              <tr>
                                <th className="px-5 py-4">
                                  Integrante
                                </th>

                                <th className="px-5 py-4">
                                  Concepto
                                </th>

                                <th className="px-5 py-4">
                                  Cargo
                                </th>

                                <th className="px-5 py-4">
                                  Pagado
                                </th>

                                <th className="px-5 py-4">
                                  Pendiente
                                </th>

                                <th className="px-5 py-4">
                                  Estado
                                </th>

                                <th className="px-5 py-4">
                                  Acciones
                                </th>
                              </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-200 bg-white">
                              {summary.members.map(
                                (
                                  member: TripMemberFinancialSummary,
                                ) => {
                                  const canRegisterPayment =
                                    !isLoadingAccess &&
                                    canManageFees &&
                                    (member.status ===
                                      "pending" ||
                                      member.status ===
                                        "partial");

                                  return (
                                    <tr
                                      key={
                                        member.chargeId
                                      }
                                      className="transition hover:bg-slate-50"
                                    >
                                      <td className="px-5 py-4">
                                        <p className="font-semibold text-slate-900">
                                          {
                                            member.memberName
                                          }
                                        </p>
                                      </td>

                                      <td className="px-5 py-4">
                                        <p className="font-medium text-slate-700">
                                          {
                                            member.feeTypeName
                                          }
                                        </p>
                                      </td>

                                      <td className="px-5 py-4 font-medium text-slate-700">
                                        {formatCurrency(
                                          member.totalCharged,
                                        )}
                                      </td>

                                      <td className="px-5 py-4 font-medium text-emerald-700">
                                        {formatCurrency(
                                          member.totalPaid,
                                        )}
                                      </td>

                                      <td className="px-5 py-4 font-medium text-amber-700">
                                        {formatCurrency(
                                          member.totalPending,
                                        )}
                                      </td>

                                      <td className="px-5 py-4">
                                        <span
                                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                                            member.status,
                                          )}`}
                                        >
                                          {getStatusLabel(
                                            member.status,
                                          )}
                                        </span>
                                      </td>

                                      <td className="px-5 py-4">
                                        {canRegisterPayment ? (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setSelectedCharge(
                                                member,
                                              )
                                            }
                                            className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
                                          >
                                            Registrar pago
                                          </button>
                                        ) : (
                                          <span className="text-sm font-medium text-emerald-700">
                                            Liquidado
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                },
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </section>
                  ) : (
                    <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
                      Este viaje todavía no tiene cargos financieros vinculados.
                    </div>
                  )}
                </>
              )}
          </div>

          <footer className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 px-6 py-5">
            {summary && !isLoading && !error && (
              <Button
                variant="secondary"
                onClick={() =>
                  setIsReportOpen(true)
                }
              >
                Ver reporte
              </Button>
            )}

            <Button onClick={onClose}>
              Cerrar
            </Button>
          </footer>
        </div>
      </div>

      {selectedCharge && (
        <RegisterPaymentModal
          charge={{
            id: selectedCharge.chargeId,
            memberName:
              selectedCharge.memberName,
            feeTypeName:
              selectedCharge.feeTypeName,
            amount:
              selectedCharge.totalCharged,
          }}
          onClose={() =>
            setSelectedCharge(null)
          }
          onPaymentCreated={
            handlePaymentCreated
          }
          canManageFees={canManageFees}
          isLoadingAccess={isLoadingAccess}
          accessError={accessError}
        />
      )}
      {isReportOpen && summary && (
        <TripFinancialReportModal
          tripName={tripName}
          summary={summary}
          onClose={() =>
            setIsReportOpen(false)
          }
        />
      )}
    </>
  );
}
