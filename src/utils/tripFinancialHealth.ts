import type {
  TripFinancialReconciliation,
} from "@/hooks/useTripFinancialDashboard";

import type {
  TripParticipantFinancialSummary,
} from "@/types/tripFinancial";

export type TripFinancialHealthLevel =
  | "excellent"
  | "good"
  | "attention"
  | "critical";

export interface TripFinancialHealthResult {
  level: TripFinancialHealthLevel;

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

export function calculateTripFinancialHealth(
  reconciliation:
    TripFinancialReconciliation,
  participants:
    TripParticipantFinancialSummary[],
): TripFinancialHealthResult {
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