import type {
  TripFinancialDashboardMetrics,
  TripFinancialSummary,
} from "@/types/tripFinancial";

interface TripFinancialSummaryCardsProps {
  summary: TripFinancialSummary;

  metrics: TripFinancialDashboardMetrics;
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

export default function TripFinancialSummaryCards({
  summary,
  metrics,
}: TripFinancialSummaryCardsProps) {
  const cards = [
    {
      label: "Presupuesto estimado",

      value: formatCurrency(
        summary.estimatedBudget,
      ),

      description:
        "Costo estimado total del viaje.",
    },
    {
      label: "Total asignado",

      value: formatCurrency(
        summary.totalCharged,
      ),

      description: `${metrics.chargeCount} ${
        metrics.chargeCount === 1
          ? "cargo registrado"
          : "cargos registrados"
      }.`,
    },
    {
      label: "Total recaudado",

      value: formatCurrency(
        summary.totalPaid,
      ),

      description:
        `${summary.recoveryPercentage}% ` +
        "de los cargos cubierto.",
    },
    {
      label: "Saldo pendiente",

      value: formatCurrency(
        summary.totalPending,
      ),

      description:
        metrics.pendingParticipantCount === 0 &&
        metrics.partialParticipantCount === 0
          ? "No existen adeudos pendientes."
          : `${
              metrics.pendingParticipantCount +
              metrics.partialParticipantCount
            } ${
              metrics.pendingParticipantCount +
                metrics.partialParticipantCount ===
              1
                ? "participante con saldo"
                : "participantes con saldo"
            }.`,
    },
  ];

  return (
    <section
      aria-label="Resumen financiero del viaje"
      className="
        grid
        gap-4
        sm:grid-cols-2
        xl:grid-cols-4
      "
    >
      {cards.map((card) => (
        <article
          key={card.label}
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-sm
          "
        >
          <p
            className="
              text-sm
              font-medium
              text-slate-500
            "
          >
            {card.label}
          </p>

          <p
            className="
              mt-2
              break-words
              text-2xl
              font-semibold
              tracking-tight
              text-slate-900
            "
          >
            {card.value}
          </p>

          <p
            className="
              mt-2
              text-sm
              leading-5
              text-slate-500
            "
          >
            {card.description}
          </p>
        </article>
      ))}
    </section>
  );
}