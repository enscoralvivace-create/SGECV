"use client";

import type {
  LucideIcon,
} from "lucide-react";

import TripFinancialMetricHeader from "@/components/trips/TripFinancialMetricHeader";

type TripFinancialMetricTone =
  | "neutral"
  | "positive"
  | "warning"
  | "danger";

interface TripFinancialMetricCardProps {
  title: string;

  description: string;

  value: string;

  supportingText?: string;

  icon?: LucideIcon;

  tone?: TripFinancialMetricTone;
}

function getToneClasses(
  tone: TripFinancialMetricTone,
): {
  card: string;
  icon: string;
  value: string;
} {
  switch (tone) {
    case "positive":
      return {
        card:
          "border-emerald-200 bg-emerald-50",
        icon:
          "bg-emerald-100 text-emerald-700",
        value:
          "text-emerald-950",
      };

    case "warning":
      return {
        card:
          "border-amber-200 bg-amber-50",
        icon:
          "bg-amber-100 text-amber-700",
        value:
          "text-amber-950",
      };

    case "danger":
      return {
        card:
          "border-rose-200 bg-rose-50",
        icon:
          "bg-rose-100 text-rose-700",
        value:
          "text-rose-950",
      };

    case "neutral":
      return {
        card:
          "border-slate-200 bg-white",
        icon:
          "bg-slate-100 text-slate-700",
        value:
          "text-slate-950",
      };
  }
}

export default function TripFinancialMetricCard({
  title,
  description,
  value,
  supportingText,
  icon: Icon,
  tone = "neutral",
}: TripFinancialMetricCardProps) {
  const toneClasses =
    getToneClasses(tone);

  return (
    <article
      className={`
        rounded-2xl
        border
        p-5
        shadow-sm
        transition
        duration-200
        hover:-translate-y-0.5
        hover:shadow-md
        ${toneClasses.card}
      `}
    >
      <div
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >
        <TripFinancialMetricHeader
          title={title}
          description={description}
        />

        {Icon ? (
          <div
            className={`
              inline-flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              ${toneClasses.icon}
            `}
          >
            <Icon
              aria-hidden="true"
              className="h-5 w-5"
            />
          </div>
        ) : null}
      </div>

      <p
        className={`
          mt-5
          text-2xl
          font-bold
          tracking-tight
          ${toneClasses.value}
        `}
      >
        {value}
      </p>

      {supportingText ? (
        <p
          className="
            mt-2
            text-xs
            leading-5
            text-slate-500
          "
        >
          {supportingText}
        </p>
      ) : null}
    </article>
  );
}