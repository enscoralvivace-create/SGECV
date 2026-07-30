"use client";

import {
  BadgeCheck,
  CircleGauge,
  ShieldAlert,
  TriangleAlert,
} from "lucide-react";

import type {
  TripFinancialReconciliation,
} from "@/hooks/useTripFinancialDashboard";

import type {
  TripParticipantFinancialSummary,
} from "@/types/tripFinancial";

type FinancialHealthLevel =
  | "excellent"
  | "good"
  | "attention"
  | "critical";

interface TripFinancialHealthCardProps {
  reconciliation:
    TripFinancialReconciliation;

  participants:
    TripParticipantFinancialSummary[];
}

interface FinancialHealthResult {
  level: FinancialHealthLevel;

  label: string;

  score: number;

  summary: string;

  factors: string[];

  recommendations: string[];
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

function clampScore(
  value: number,
): number {
  return Math.min(
    100,
    Math.max(
      0,
      Math.round(value),
    ),
  );
}

function getFinancialHealth(
  reconciliation:
    TripFinancialReconciliation,
  participants:
    TripParticipantFinancialSummary[],
): FinancialHealthResult {
  const participantCount =
    participants.length;

  const participantDebtCount =
    participants.filter(
      (participant) =>
        participant.totalPending > 0,
    ).length;

  const participantDebtPercentage =
    calculatePercentage(
      participantDebtCount,
      participantCount,
    );

  const paymentCoveragePercentage =
    calculatePercentage(
      reconciliation.totalPaid,
      reconciliation.totalCharged,
    );

  const expenseCoveragePercentage =
    calculatePercentage(
      reconciliation.totalPaid,
      reconciliation.totalExpenses,
    );

  let score = 100;

  const factors: string[] = [];
  const recommendations: string[] = [];

  if (
    reconciliation.availableCash < 0
  ) {
    score -= 35;

    factors.push(
      "Los gastos superan el efectivo recibido.",
    );

    recommendations.push(
      "Prioriza la cobranza inmediata y evita nuevos egresos no esenciales.",
    );
  } else {
    factors.push(
      "Los pagos recibidos cubren los gastos registrados.",
    );
  }

  if (
    reconciliation.budgetRemaining < 0
  ) {
    score -= 30;

    factors.push(
      "El presupuesto estimado ya fue superado.",
    );

    recommendations.push(
      "Revisa los gastos por categoría y ajusta el presupuesto del viaje.",
    );
  } else if (
    reconciliation
      .expenseBudgetPercentage >= 85
  ) {
    score -= 15;

    factors.push(
      "El presupuesto disponible está próximo a agotarse.",
    );

    recommendations.push(
      "Limita nuevos gastos y valida los compromisos todavía pendientes.",
    );
  } else {
    factors.push(
      "El gasto se mantiene dentro del presupuesto estimado.",
    );
  }

  if (
    participantDebtPercentage >= 60
  ) {
    score -= 20;

    factors.push(
      "La mayoría de los participantes conserva adeudos.",
    );

    recommendations.push(
      "Organiza un seguimiento de cobro para los participantes con mayor saldo.",
    );
  } else if (
    participantDebtPercentage >= 30
  ) {
    score -= 10;

    factors.push(
      "Existe una proporción relevante de participantes con adeudos.",
    );

    recommendations.push(
      "Da seguimiento a pagos parciales y fechas de compromiso.",
    );
  } else if (participantCount > 0) {
    factors.push(
      "La mayoría de los participantes está al corriente.",
    );
  }

  if (
    reconciliation.totalCharged > 0 &&
    paymentCoveragePercentage < 50
  ) {
    score -= 15;

    factors.push(
      "Se ha recuperado menos de la mitad de los cargos generados.",
    );

    recommendations.push(
      "Acelera la recuperación de cuotas antes de asumir nuevos compromisos.",
    );
  }

  if (
    reconciliation.totalExpenses > 0 &&
    expenseCoveragePercentage < 100
  ) {
    score -= 10;
  }

  const normalizedScore =
    clampScore(score);

  if (normalizedScore >= 85) {
    return {
      level: "excellent",
      label: "Excelente",
      score: normalizedScore,
      summary:
        "El viaje mantiene una posición financiera sólida y controlada.",
      factors,
      recommendations:
        recommendations.length > 0
          ? recommendations
          : [
              "Mantén actualizado el registro de pagos y gastos.",
            ],
    };
  }

  if (normalizedScore >= 70) {
    return {
      level: "good",
      label: "Buena",
      score: normalizedScore,
      summary:
        "La situación financiera es favorable, aunque conviene mantener vigilancia.",
      factors,
      recommendations:
        recommendations.length > 0
          ? recommendations
          : [
              "Continúa monitoreando la cobranza y el consumo del presupuesto.",
            ],
    };
  }

  if (normalizedScore >= 45) {
    return {
      level: "attention",
      label: "Atención",
      score: normalizedScore,
      summary:
        "Existen señales que requieren seguimiento para evitar un deterioro financiero.",
      factors,
      recommendations,
    };
  }

  return {
    level: "critical",
    label: "Crítica",
    score: normalizedScore,
    summary:
      "La viabilidad financiera del viaje requiere acciones correctivas inmediatas.",
    factors,
    recommendations:
      recommendations.length > 0
        ? recommendations
        : [
            "Revisa de inmediato la cobranza, los gastos y el presupuesto.",
          ],
  };
}

function getLevelClasses(
  level: FinancialHealthLevel,
): string {
  switch (level) {
    case "excellent":
      return (
        "border-emerald-200 " +
        "bg-emerald-50 " +
        "text-emerald-950"
      );

    case "good":
      return (
        "border-sky-200 " +
        "bg-sky-50 " +
        "text-sky-950"
      );

    case "attention":
      return (
        "border-amber-200 " +
        "bg-amber-50 " +
        "text-amber-950"
      );

    case "critical":
      return (
        "border-rose-200 " +
        "bg-rose-50 " +
        "text-rose-950"
      );
  }
}

function getProgressClasses(
  level: FinancialHealthLevel,
): string {
  switch (level) {
    case "excellent":
      return "bg-emerald-600";

    case "good":
      return "bg-sky-600";

    case "attention":
      return "bg-amber-500";

    case "critical":
      return "bg-rose-600";
  }
}

function HealthIcon({
  level,
}: {
  level: FinancialHealthLevel;
}) {
  const iconClasses =
    "h-6 w-6";

  switch (level) {
    case "excellent":
      return (
        <BadgeCheck
          aria-hidden="true"
          className={iconClasses}
        />
      );

    case "good":
      return (
        <CircleGauge
          aria-hidden="true"
          className={iconClasses}
        />
      );

    case "attention":
      return (
        <TriangleAlert
          aria-hidden="true"
          className={iconClasses}
        />
      );

    case "critical":
      return (
        <ShieldAlert
          aria-hidden="true"
          className={iconClasses}
        />
      );
  }
}

export default function TripFinancialHealthCard({
  reconciliation,
  participants,
}: TripFinancialHealthCardProps) {
  const health =
    getFinancialHealth(
      reconciliation,
      participants,
    );

  return (
    <section
      aria-labelledby="trip-financial-health-title"
      className={`
        rounded-2xl
        border
        p-5
        shadow-sm
        ${getLevelClasses(health.level)}
      `}
    >
      <div
        className="
          flex
          flex-col
          gap-5
          lg:flex-row
          lg:items-start
          lg:justify-between
        "
      >
        <div className="max-w-2xl">
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-white/70
              "
            >
              <HealthIcon
                level={health.level}
              />
            </div>

            <div>
              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  opacity-70
                "
              >
                Salud financiera
              </p>

              <h3
                id="trip-financial-health-title"
                className="
                  text-2xl
                  font-bold
                "
              >
                {health.label}
              </h3>
            </div>
          </div>

          <p
            className="
              mt-4
              text-sm
              leading-6
              opacity-80
            "
          >
            {health.summary}
          </p>
        </div>

        <div
          className="
            min-w-48
            rounded-xl
            bg-white/70
            p-4
          "
        >
          <div
            className="
              flex
              items-end
              justify-between
              gap-4
            "
          >
            <span
              className="
                text-sm
                font-medium
                opacity-70
              "
            >
              Puntaje
            </span>

            <strong
              className="
                text-3xl
                font-bold
              "
            >
              {health.score}
              <span
                className="
                  text-base
                  font-semibold
                  opacity-60
                "
              >
                /100
              </span>
            </strong>
          </div>

          <div
            aria-label={`Puntaje financiero: ${health.score} de 100`}
            className="
              mt-3
              h-2
              overflow-hidden
              rounded-full
              bg-slate-200
            "
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={health.score}
          >
            <div
              className={`
                h-full
                rounded-full
                transition-all
                ${getProgressClasses(
                  health.level,
                )}
              `}
              style={{
                width: `${health.score}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div
        className="
          mt-5
          grid
          gap-4
          lg:grid-cols-2
        "
      >
        <div
          className="
            rounded-xl
            bg-white/70
            p-4
          "
        >
          <h4 className="font-semibold">
            Factores principales
          </h4>

          <ul
            className="
              mt-3
              space-y-2
              text-sm
              leading-5
              opacity-80
            "
          >
            {health.factors.map(
              (factor) => (
                <li
                  key={factor}
                  className="
                    flex
                    items-start
                    gap-2
                  "
                >
                  <span
                    aria-hidden="true"
                    className="
                      mt-2
                      h-1.5
                      w-1.5
                      shrink-0
                      rounded-full
                      bg-current
                    "
                  />

                  <span>{factor}</span>
                </li>
              ),
            )}
          </ul>
        </div>

        <div
          className="
            rounded-xl
            bg-white/70
            p-4
          "
        >
          <h4 className="font-semibold">
            Recomendaciones
          </h4>

          <ul
            className="
              mt-3
              space-y-2
              text-sm
              leading-5
              opacity-80
            "
          >
            {health.recommendations.map(
              (recommendation) => (
                <li
                  key={recommendation}
                  className="
                    flex
                    items-start
                    gap-2
                  "
                >
                  <span
                    aria-hidden="true"
                    className="
                      mt-2
                      h-1.5
                      w-1.5
                      shrink-0
                      rounded-full
                      bg-current
                    "
                  />

                  <span>
                    {recommendation}
                  </span>
                </li>
              ),
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}