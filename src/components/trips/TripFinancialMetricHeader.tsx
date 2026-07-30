"use client";

import TripFinancialMetricTooltip from "@/components/trips/TripFinancialMetricTooltip";

interface TripFinancialMetricHeaderProps {
  title: string;
  description: string;
}

export default function TripFinancialMetricHeader({
  title,
  description,
}: TripFinancialMetricHeaderProps) {
  return (
    <div
      className="
        flex
        items-center
        gap-2
      "
    >
      <h4
        className="
          text-sm
          font-semibold
          text-slate-700
        "
      >
        {title}
      </h4>

      <TripFinancialMetricTooltip
        label={title}
        description={description}
      />
    </div>
  );
}