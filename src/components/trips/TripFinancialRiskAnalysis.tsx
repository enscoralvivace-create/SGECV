"use client";

import {
  CircleCheckBig,
  CircleDollarSign,
  CircleGauge,
  TriangleAlert,
} from "lucide-react";

import type {
  TripParticipantFinancialSummary,
} from "@/types/tripFinancial";

interface TripFinancialRiskAnalysisProps {
  participants:
    TripParticipantFinancialSummary[];

  estimatedBudget: number;
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

function calculatePercentage(
  value: number,
  total: number,
): number {
  if (total <= 0) {
    return 0;
  }

  return Math.round(
    (value / total) * 1000,
  ) / 10;
}

export default function TripFinancialRiskAnalysis({
  participants,
  estimatedBudget,
}: TripFinancialRiskAnalysisProps) {
  const paidParticipants =
    participants.filter(
      (participant) =>
        participant.status === "paid",
    );

  const partialParticipants =
    participants.filter(
      (participant) =>
        participant.status === "partial",
    );

  const pendingParticipants =
    participants.filter(
      (participant) =>
        participant.status === "pending",
    );

  const totalPending =
    participants.reduce(
      (
        accumulatedTotal,
        participant,
      ) =>
        accumulatedTotal +
        participant.totalPending,
      0,
    );

  const pendingBudgetPercentage =
    calculatePercentage(
      totalPending,
      estimatedBudget,
    );

  const highestDebts =
    participants
      .filter(
        (participant) =>
          participant.totalPending > 0,
      )
      .sort(
        (
          firstParticipant,
          secondParticipant,
        ) =>
          secondParticipant.totalPending -
          firstParticipant.totalPending,
      )
      .slice(0, 5);

  return (
    <section
      aria-labelledby="trip-financial-risk-title"
      className="space-y-4"
    >
      <div>
        <h3
          id="trip-financial-risk-title"
          className="
            text-lg
            font-semibold
            text-slate-900
          "
        >
          Riesgo financiero
        </h3>

        <p
          className="
            mt-1
            text-sm
            text-slate-500
          "
        >
          Seguimiento de participantes con
          pagos pendientes y concentración de
          adeudos.
        </p>
      </div>

      <div
        className="
          grid
          gap-4
          md:grid-cols-2
          xl:grid-cols-4
        "
      >
        <article
          className="
            rounded-2xl
            border
            border-emerald-200
            bg-emerald-50
            p-5
            shadow-sm
          "
        >
          <CircleCheckBig
            aria-hidden="true"
            className="
              h-5
              w-5
              text-emerald-700
            "
          />

          <p
            className="
              mt-4
              text-sm
              font-medium
              text-emerald-800
            "
          >
            Al corriente
          </p>

          <p
            className="
              mt-1
              text-3xl
              font-bold
              text-emerald-950
            "
          >
            {paidParticipants.length}
          </p>
        </article>

        <article
          className="
            rounded-2xl
            border
            border-amber-200
            bg-amber-50
            p-5
            shadow-sm
          "
        >
          <CircleGauge
            aria-hidden="true"
            className="
              h-5
              w-5
              text-amber-700
            "
          />

          <p
            className="
              mt-4
              text-sm
              font-medium
              text-amber-800
            "
          >
            Pago parcial
          </p>

          <p
            className="
              mt-1
              text-3xl
              font-bold
              text-amber-950
            "
          >
            {partialParticipants.length}
          </p>
        </article>

        <article
          className="
            rounded-2xl
            border
            border-rose-200
            bg-rose-50
            p-5
            shadow-sm
          "
        >
          <TriangleAlert
            aria-hidden="true"
            className="
              h-5
              w-5
              text-rose-700
            "
          />

          <p
            className="
              mt-4
              text-sm
              font-medium
              text-rose-800
            "
          >
            Sin pagos
          </p>

          <p
            className="
              mt-1
              text-3xl
              font-bold
              text-rose-950
            "
          >
            {pendingParticipants.length}
          </p>
        </article>

        <article
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-sm
          "
        >
          <CircleDollarSign
            aria-hidden="true"
            className="
              h-5
              w-5
              text-slate-700
            "
          />

          <p
            className="
              mt-4
              text-sm
              font-medium
              text-slate-600
            "
          >
            Adeudo total
          </p>

          <p
            className="
              mt-1
              text-2xl
              font-bold
              text-slate-950
            "
          >
            {formatCurrency(totalPending)}
          </p>

          <p
            className="
              mt-2
              text-xs
              text-slate-500
            "
          >
            {formatPercentage(
              pendingBudgetPercentage,
            )}
            % del presupuesto estimado
          </p>
        </article>
      </div>

      <div
        className="
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-sm
        "
      >
        <div
          className="
            border-b
            border-slate-200
            px-5
            py-4
          "
        >
          <h4
            className="
              font-semibold
              text-slate-900
            "
          >
            Mayores adeudos
          </h4>

          <p
            className="
              mt-1
              text-sm
              text-slate-500
            "
          >
            Participantes que requieren mayor
            seguimiento de cobro.
          </p>
        </div>

        {highestDebts.length === 0 ? (
          <div
            className="
              px-5
              py-10
              text-center
            "
          >
            <CircleCheckBig
              aria-hidden="true"
              className="
                mx-auto
                h-8
                w-8
                text-emerald-500
              "
            />

            <p
              className="
                mt-3
                text-sm
                font-semibold
                text-slate-800
              "
            >
              No existen adeudos pendientes.
            </p>
          </div>
        ) : (
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
                    Participante
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
                    Cargado
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
                    Pagado
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
                    Pendiente
                  </th>
                </tr>
              </thead>

              <tbody
                className="
                  divide-y
                  divide-slate-100
                "
              >
                {highestDebts.map(
                  (participant) => (
                    <tr
                      key={participant.memberId}
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
                        {participant.memberName}
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
                        {formatCurrency(
                          participant.totalCharged,
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
                        {formatCurrency(
                          participant.totalPaid,
                        )}
                      </td>

                      <td
                        className="
                          whitespace-nowrap
                          px-5
                          py-4
                          text-right
                          text-sm
                          font-semibold
                          text-rose-700
                        "
                      >
                        {formatCurrency(
                          participant.totalPending,
                        )}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}