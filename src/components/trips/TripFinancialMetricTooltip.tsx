"use client";

import {
  CircleHelp,
} from "lucide-react";

interface TripFinancialMetricTooltipProps {
  label: string;

  description: string;
}

export default function TripFinancialMetricTooltip({
  label,
  description,
}: TripFinancialMetricTooltipProps) {
  return (
    <span
      className="
        group
        relative
        inline-flex
        items-center
      "
    >
      <button
        aria-label={`Información sobre ${label}`}
        className="
          inline-flex
          h-6
          w-6
          items-center
          justify-center
          rounded-full
          text-slate-400
          transition-colors
          hover:bg-slate-100
          hover:text-slate-700
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-slate-400
          focus-visible:ring-offset-2
        "
        type="button"
      >
        <CircleHelp
          aria-hidden="true"
          className="h-4 w-4"
        />
      </button>

      <span
        className="
          pointer-events-none
          absolute
          bottom-full
          left-1/2
          z-30
          mb-2
          w-64
          -translate-x-1/2
          translate-y-1
          rounded-xl
          bg-slate-950
          px-3
          py-2.5
          text-left
          text-xs
          font-normal
          leading-5
          text-white
          opacity-0
          shadow-xl
          transition-all
          duration-150
          group-hover:translate-y-0
          group-hover:opacity-100
          group-focus-within:translate-y-0
          group-focus-within:opacity-100
        "
        role="tooltip"
      >
        <strong
          className="
            block
            font-semibold
            text-white
          "
        >
          {label}
        </strong>

        <span
          className="
            mt-1
            block
            text-slate-200
          "
        >
          {description}
        </span>

        <span
          aria-hidden="true"
          className="
            absolute
            left-1/2
            top-full
            h-0
            w-0
            -translate-x-1/2
            border-x-8
            border-t-8
            border-x-transparent
            border-t-slate-950
          "
        />
      </span>
    </span>
  );
}