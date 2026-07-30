interface TripMemberSummaryCardsProps {
  total: number;
  confirmed: number;
  invited: number;
  cancelled: number;
  charged: number;
  paid: number;
  partial: number;
  pending: number;
}

interface SummaryCard {
  label: string;
  value: number;
  className: string;
  labelClassName: string;
  valueClassName: string;
}

export default function TripMemberSummaryCards({
  total,
  confirmed,
  invited,
  cancelled,
  charged,
  paid,
  partial,
  pending,
}: TripMemberSummaryCardsProps) {
  const cards: SummaryCard[] = [
    {
      label: "Participantes",
      value: total,
      className:
        "border-slate-200 bg-white shadow-sm",
      labelClassName: "text-slate-600",
      valueClassName: "text-slate-900",
    },
    {
      label: "Confirmados",
      value: confirmed,
      className:
        "border-emerald-200 bg-emerald-50",
      labelClassName: "text-emerald-700",
      valueClassName: "text-emerald-950",
    },
    {
      label: "Invitados",
      value: invited,
      className:
        "border-amber-200 bg-amber-50",
      labelClassName: "text-amber-700",
      valueClassName: "text-amber-950",
    },
    {
      label: "Cancelados",
      value: cancelled,
      className:
        "border-rose-200 bg-rose-50",
      labelClassName: "text-rose-700",
      valueClassName: "text-rose-950",
    },
    {
      label: "Con cargo",
      value: charged,
      className:
        "border-blue-200 bg-blue-50",
      labelClassName: "text-blue-700",
      valueClassName: "text-blue-950",
    },
    {
      label: "Liquidados",
      value: paid,
      className:
        "border-emerald-200 bg-emerald-50",
      labelClassName: "text-emerald-700",
      valueClassName: "text-emerald-950",
    },
    {
      label: "Pagos parciales",
      value: partial,
      className:
        "border-amber-200 bg-amber-50",
      labelClassName: "text-amber-700",
      valueClassName: "text-amber-950",
    },
    {
      label: "Pagos pendientes",
      value: pending,
      className:
        "border-rose-200 bg-rose-50",
      labelClassName: "text-rose-700",
      valueClassName: "text-rose-950",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.label}
          className={`rounded-xl border px-4 py-3 ${card.className}`}
        >
          <p
            className={`text-xs font-semibold ${card.labelClassName}`}
          >
            {card.label}
          </p>

          <p
            className={`mt-1 text-xl font-bold ${card.valueClassName}`}
          >
            {card.value}
          </p>
        </article>
      ))}
    </div>
  );
}