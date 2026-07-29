"use client";

import Image from "next/image";

import {
  useRef,
  useState,
} from "react";

import Button from "@/components/common/Button";

import {
  downloadElementAsPdf,
} from "@/services/pdfService";

import type {
  TripFinancialSummary,
  TripMemberFinancialStatus,
} from "@/services/tripService";

interface TripFinancialReportModalProps {
  tripName: string;
  summary: TripFinancialSummary;
  responsible?: string;
  observations?: string;
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

function formatEmissionDate(
  date: Date,
): string {
  return new Intl.DateTimeFormat(
    "es-MX",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    },
  ).format(date);
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

function createPdfFileName(
  tripName: string,
): string {
  const normalizedTripName = tripName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalizedTripName
    ? `Reporte-Financiero-${normalizedTripName}`
    : "Reporte-Financiero-Viaje";
}

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />

      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
      />

      <path d="M3 10h18" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M8 17h.01" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export default function TripFinancialReportModal({
  tripName,
  summary,
  responsible = "Dirección del Ensamble Coral Vivace",
  observations = "",
  onClose,
}: TripFinancialReportModalProps) {
  const reportRef =
    useRef<HTMLElement>(null);

  const [isDownloadingPdf, setIsDownloadingPdf] =
    useState(false);

  const [pdfError, setPdfError] =
    useState<string | null>(null);

  const recoveryPercentage =
    summary.recoveryPercentage;

  const emissionDate =
    formatEmissionDate(new Date());

  function handlePrint() {
    window.print();
  }

  async function handleDownloadPdf() {
    const reportElement = reportRef.current;

    if (!reportElement || isDownloadingPdf) {
      return;
    }

    setIsDownloadingPdf(true);
    setPdfError(null);

    try {
      await downloadElementAsPdf({
        element: reportElement,
        fileName: createPdfFileName(
          tripName,
        ),
        marginMm: 7,
      });
    } catch (error) {
      console.error(
        "No fue posible generar el reporte PDF:",
        error,
      );

      setPdfError(
        "No fue posible descargar el PDF. Inténtalo nuevamente.",
      );
    } finally {
      setIsDownloadingPdf(false);
    }
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
              Vista previa en tamaño Carta
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
          <article
            ref={reportRef}
            id="trip-financial-report"
            className="mx-auto min-h-[279mm] w-[216mm] max-w-full bg-white px-[12mm] py-[10mm] shadow-sm print:min-h-0 print:w-full print:max-w-none print:px-0 print:py-0 print:shadow-none"
          >
            <section className="border-b-2 border-slate-900 pb-4 print:pb-2.5">
              <div className="grid grid-cols-[130px_minmax(0,1fr)_190px] items-stretch gap-0 print:grid-cols-[105px_minmax(0,1fr)_155px]">
                <div className="flex items-center justify-start pr-2 print:pr-3">
                  <div className="relative -ml-2 h-40 w-full print:-ml-1 print:h-[100px]">
                    <Image
                      src="/images/logo-ecv-v2.png"
                      alt="Logotipo del Ensamble Coral Vivace"
                      fill
                      priority
                      sizes="150px"
                      className="object-contain object-left"
                    />
                  </div>
                </div>

                <div className="flex min-w-0 items-center border-l-2 border-slate-300 pl-4 pr-5 print:px-4">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-700 print:text-[7px]">
                      Documento institucional
                    </p>

                    <h1 className="mt-2 text-[2.15rem] font-bold leading-tight text-slate-950 print:mt-1 print:text-[22px]">
                      Reporte financiero del viaje
                    </h1>

                    <p className="mt-2 text-xl font-bold text-slate-800 print:mt-1 print:text-[13px]">
                      {tripName}
                    </p>

                    <p className="mt-1 text-sm text-slate-600 print:text-[8px]">
                      Ensamble Coral Vivace
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end pl-5 print:pl-3">
                  <div className="w-full max-w-[180px] print:max-w-[145px]">
                    <p className="mb-2 text-right text-xs font-bold text-slate-900 print:mb-1 print:text-[7px]">
                      Fecha de emisión
                    </p>

                    <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-3 py-3 text-slate-700 print:gap-1.5 print:rounded-md print:px-2 print:py-2">
                      <span className="shrink-0 text-slate-700 print:[&>svg]:h-3 print:[&>svg]:w-3">
                        <CalendarIcon />
                      </span>

                      <p className="whitespace-nowrap text-center text-xs font-semibold capitalize print:text-[7px]">
                        {emissionDate}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

                        <section className="mt-5 grid grid-cols-4 gap-3 print:mt-3 print:gap-2">
              <article className="rounded-xl border border-slate-300 p-4 print:rounded-md print:p-2">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-600 print:text-[7px]">
                  Presupuesto
                </p>

                <p className="mt-2 text-xl font-bold text-slate-950 print:mt-1 print:text-[14px]">
                  {formatCurrency(
                    summary.estimatedBudget,
                  )}
                </p>
              </article>

              <article className="rounded-xl border border-blue-300 p-4 print:rounded-md print:p-2">
                <p className="text-xs font-bold uppercase tracking-wide text-blue-700 print:text-[7px]">
                  Cargos generados
                </p>

                <p className="mt-2 text-xl font-bold text-slate-950 print:mt-1 print:text-[14px]">
                  {formatCurrency(
                    summary.totalCharged,
                  )}
                </p>
              </article>

              <article className="rounded-xl border border-emerald-300 p-4 print:rounded-md print:p-2">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700 print:text-[7px]">
                  Total pagado
                </p>

                <p className="mt-2 text-xl font-bold text-slate-950 print:mt-1 print:text-[14px]">
                  {formatCurrency(
                    summary.totalPaid,
                  )}
                </p>
              </article>

              <article className="rounded-xl border border-amber-300 p-4 print:rounded-md print:p-2">
                <p className="text-xs font-bold uppercase tracking-wide text-amber-700 print:text-[7px]">
                  Saldo pendiente
                </p>

                <p className="mt-2 text-xl font-bold text-slate-950 print:mt-1 print:text-[14px]">
                  {formatCurrency(
                    summary.totalPending,
                  )}
                </p>
              </article>
            </section>

            <section className="mt-4 rounded-xl border border-slate-300 p-5 print:mt-3 print:rounded-md print:p-2.5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-950 print:text-[12px]">
                    Recuperación financiera
                  </h2>

                  <p className="mt-1 text-sm text-slate-600 print:text-[7px]">
                    Porcentaje recuperado de los cargos
                    generados.
                  </p>
                </div>

                <p className="text-2xl font-bold text-emerald-800 print:text-[17px]">
                  {recoveryPercentage.toFixed(1)}%
                </p>
              </div>

              <div className="mt-4 h-4 overflow-hidden rounded-full border border-slate-300 bg-slate-100 print:mt-2 print:h-2">
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

            <section className="mt-4 grid grid-cols-2 gap-3 print:mt-3 print:gap-2">
              <article className="rounded-xl border border-slate-300 p-4 print:rounded-md print:p-2">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-600 print:text-[7px]">
                  Responsable
                </p>

                <p className="mt-2 font-semibold text-slate-900 print:mt-1 print:text-[8px]">
                  {responsible}
                </p>
              </article>

              <article className="rounded-xl border border-slate-300 p-4 print:rounded-md print:p-2">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-600 print:text-[7px]">
                  Observaciones
                </p>

                <p className="mt-2 whitespace-pre-line text-sm text-slate-700 print:mt-1 print:text-[8px]">
                  {observations.trim() ||
                    "Sin observaciones registradas."}
                </p>
              </article>
            </section>

            <section className="mt-4 print:mt-3">
              <div className="mb-3 print:mb-2">
                <h2 className="text-xl font-bold text-slate-950 print:text-[13px]">
                  Relación completa de cargos
                </h2>

                <p className="mt-1 text-sm text-slate-600 print:text-[7px]">
                  Desglose individual de los cargos
                  vinculados al viaje.
                </p>
              </div>

              {summary.members.length > 0 ? (
                <div className="overflow-hidden rounded-xl border border-slate-300 print:rounded-md">
                  <table className="w-full border-collapse text-left text-sm print:text-[8px]">
                    <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-800 print:text-[7px]">
                      <tr>
                        <th className="border-b border-slate-400 px-4 py-3 print:px-2 print:py-1.5">
                          Integrante
                        </th>

                        <th className="border-b border-slate-400 px-4 py-3 print:px-2 print:py-1.5">
                          Concepto
                        </th>

                        <th className="border-b border-slate-400 px-4 py-3 text-right print:px-2 print:py-1.5">
                          Cargo
                        </th>

                        <th className="border-b border-slate-400 px-4 py-3 text-right print:px-2 print:py-1.5">
                          Pagado
                        </th>

                        <th className="border-b border-slate-400 px-4 py-3 text-right print:px-2 print:py-1.5">
                          Pendiente
                        </th>

                        <th className="border-b border-slate-400 px-4 py-3 text-center print:px-2 print:py-1.5">
                          Estado
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-300">
                      {summary.members.map(
                        (charge) => (
                          <tr
                            key={charge.chargeId}
                            className="break-inside-avoid"
                          >
                            <td className="px-4 py-3 font-semibold text-slate-950 print:px-2 print:py-1.5">
                              {charge.memberName}
                            </td>

                            <td className="px-4 py-3 text-slate-700 print:px-2 print:py-1.5">
                              {charge.feeTypeName}
                            </td>

                            <td className="px-4 py-3 text-right font-medium text-slate-900 print:px-2 print:py-1.5">
                              {formatCurrency(
                                charge.totalCharged,
                              )}
                            </td>

                            <td className="px-4 py-3 text-right font-semibold text-emerald-700 print:px-2 print:py-1.5">
                              {formatCurrency(
                                charge.totalPaid,
                              )}
                            </td>

                            <td className="px-4 py-3 text-right font-semibold text-amber-700 print:px-2 print:py-1.5">
                              {formatCurrency(
                                charge.totalPending,
                              )}
                            </td>

                            <td className="px-4 py-3 text-center print:px-2 print:py-1.5">
                              <span
                                className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold print:px-1.5 print:py-0.5 print:text-[7px] ${getStatusClasses(
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

                    <tfoot className="border-t-2 border-slate-600 bg-slate-100 font-bold text-slate-950">
                      <tr>
                        <td
                          colSpan={2}
                          className="px-4 py-3 print:px-2 print:py-1.5"
                        >
                          Totales
                        </td>

                        <td className="px-4 py-3 text-right print:px-2 print:py-1.5">
                          {formatCurrency(
                            summary.totalCharged,
                          )}
                        </td>

                        <td className="px-4 py-3 text-right text-emerald-800 print:px-2 print:py-1.5">
                          {formatCurrency(
                            summary.totalPaid,
                          )}
                        </td>

                        <td className="px-4 py-3 text-right text-amber-800 print:px-2 print:py-1.5">
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

            <footer className="mt-10 break-inside-avoid border-t border-slate-300 pt-7 print:mt-8 print:pt-5">
              <div className="grid grid-cols-3 gap-8 print:gap-5">
                <div className="pt-7 text-center print:pt-5">
                  <div className="border-t border-slate-800" />

                  <p className="mt-2 text-xs font-bold text-slate-900 print:text-[7px]">
                    Elaboró
                  </p>

                  <p className="mt-1 text-xs text-slate-600 print:text-[6px]">
                    Responsable financiero
                  </p>
                </div>

                <div className="pt-7 text-center print:pt-5">
                  <div className="border-t border-slate-800" />

                  <p className="mt-2 text-xs font-bold text-slate-900 print:text-[7px]">
                    Revisó
                  </p>

                  <p className="mt-1 text-xs text-slate-600 print:text-[6px]">
                    Tesorería
                  </p>
                </div>

                <div className="pt-7 text-center print:pt-5">
                  <div className="border-t border-slate-800" />

                  <p className="mt-2 text-xs font-bold text-slate-900 print:text-[7px]">
                    Autorizó
                  </p>

                  <p className="mt-1 text-xs text-slate-600 print:text-[6px]">
                    Dirección general
                  </p>
                </div>
              </div>

              <p className="mt-6 text-center text-[10px] text-slate-500 print:mt-4 print:text-[6px]">
                Documento generado por Vivace Suite
                para uso administrativo del Ensamble
                Coral Vivace.
              </p>
            </footer>
          </article>
        </div>

                   <div className="border-t border-slate-200 bg-white px-6 py-4 print:hidden">
          {pdfError ? (
            <p className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {pdfError}
            </p>
          ) : null}

          <div className="flex flex-wrap justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isDownloadingPdf}
            >
              Cerrar
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                void handleDownloadPdf();
              }}
              disabled={isDownloadingPdf}
            >
              {isDownloadingPdf
                ? "Generando PDF..."
                : "Descargar PDF"}
            </Button>

            <Button
              type="button"
              onClick={handlePrint}
              disabled={isDownloadingPdf}
            >
              Imprimir
            </Button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        #trip-financial-report.pdf-export-mode {
  width: 202mm !important;
  min-height: 265mm !important;
  padding: 0 !important;
  box-shadow: none !important;
}

#trip-financial-report.pdf-export-mode .print\:mt-1 {
  margin-top: 0.25rem !important;
}

#trip-financial-report.pdf-export-mode .print\:mt-2 {
  margin-top: 0.5rem !important;
}

#trip-financial-report.pdf-export-mode .print\:mt-3 {
  margin-top: 0.75rem !important;
}

#trip-financial-report.pdf-export-mode .print\:mt-4 {
  margin-top: 1rem !important;
}

#trip-financial-report.pdf-export-mode .print\:mt-8 {
  margin-top: 2rem !important;
}

#trip-financial-report.pdf-export-mode .print\:pb-2\.5 {
  padding-bottom: 0.625rem !important;
}

#trip-financial-report.pdf-export-mode .print\:pt-5 {
  padding-top: 1.25rem !important;
}

#trip-financial-report.pdf-export-mode .print\:p-2 {
  padding: 0.5rem !important;
}

#trip-financial-report.pdf-export-mode .print\:p-2\.5 {
  padding: 0.625rem !important;
}

#trip-financial-report.pdf-export-mode .print\:px-2 {
  padding-left: 0.5rem !important;
  padding-right: 0.5rem !important;
}

#trip-financial-report.pdf-export-mode .print\:py-1\.5 {
  padding-top: 0.375rem !important;
  padding-bottom: 0.375rem !important;
}

#trip-financial-report.pdf-export-mode .print\:gap-2 {
  gap: 0.5rem !important;
}

#trip-financial-report.pdf-export-mode .print\:gap-5 {
  gap: 1.25rem !important;
}

#trip-financial-report.pdf-export-mode .print\:text-\[22px\] {
  font-size: 22px !important;
}

#trip-financial-report.pdf-export-mode .print\:text-\[17px\] {
  font-size: 17px !important;
}

#trip-financial-report.pdf-export-mode .print\:text-\[14px\] {
  font-size: 14px !important;
}

#trip-financial-report.pdf-export-mode .print\:text-\[13px\] {
  font-size: 13px !important;
}

#trip-financial-report.pdf-export-mode .print\:text-\[12px\] {
  font-size: 12px !important;
}

#trip-financial-report.pdf-export-mode .print\:text-\[8px\] {
  font-size: 8px !important;
}

#trip-financial-report.pdf-export-mode .print\:text-\[7px\] {
  font-size: 7px !important;
}

#trip-financial-report.pdf-export-mode .print\:text-\[6px\] {
  font-size: 6px !important;
}

#trip-financial-report.pdf-export-mode .print\:h-\[100px\] {
  height: 100px !important;
}

#trip-financial-report.pdf-export-mode .print\:h-2 {
  height: 0.5rem !important;
}

#trip-financial-report.pdf-export-mode .print\:rounded-md {
  border-radius: 0.375rem !important;
}

#trip-financial-report.pdf-export-mode .print\:shadow-none {
  box-shadow: none !important;
}
        @media print {
          @page {
            size: letter portrait;
            margin: 7mm;
          }

          html,
          body {
            width: 216mm;
            min-height: 279mm;
            background: #ffffff;
          }

          body * {
            visibility: hidden !important;
          }

          #trip-financial-report,
          #trip-financial-report * {
            visibility: visible !important;
          }

          #trip-financial-report {
            position: absolute;
            top: 0;
            left: 0;
            width: 202mm;
            min-height: 265mm;
            margin: 0;
          }

          #trip-financial-report img,
          #trip-financial-report div,
          #trip-financial-report span,
          #trip-financial-report article,
          #trip-financial-report section,
          #trip-financial-report table,
          #trip-financial-report th,
          #trip-financial-report td {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          #trip-financial-report thead {
            display: table-header-group;
          }

          #trip-financial-report tfoot {
            display: table-row-group;
          }

          #trip-financial-report tr,
          #trip-financial-report section,
          #trip-financial-report footer {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}