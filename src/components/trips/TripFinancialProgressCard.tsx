"use client";

import type {
  LucideIcon,
} from "lucide-react";

import TripFinancialMetricHeader from "@/components/trips/TripFinancialMetricHeader";

type TripFinancialProgressTone =
  | "positive"
  | "warning"
  | "danger"
  | "neutral";

interface TripFinancialProgressCardProps {
  title: string;

  description: string;

  percentage: number;

  supportingText?: string;

  icon?: LucideIcon;

  tone?: TripFinancialProgressTone;
}

function clampPercentage(
  percentage: number,
): number {
  return Math.min(
    100,
    Math.max(
      0,
      percentage,
    ),
  );
}

function getToneClasses(
  tone: TripFinancialProgressTone,
): {
  card: string;
  icon: string;
  percentage: string;
  progress: string;
} {
  switch (tone) {
    case "positive":
      return {
        card:
          "border-emerald-200 bg-emerald-50",
        icon:
          "bg-emerald-100 text-emerald-700",
        percentage:
          "text-emerald-950",
        progress:
          "bg-emerald-600",
      };

    case "warning":
      return {
        card:
          "border-amber-200 bg-amber-50",
        icon:
          "bg-amber-100 text-amber-700",
        percentage:
          "text-amber-950",
        progress:
          "bg-amber-500",
      };

    case "danger":
      return {
        card:
          "border-rose-200 bg-rose-50",
        icon:
          "bg-rose-100 text-rose-700",
        percentage:
          "text-rose-950",
        progress:
          "bg-rose-600",
      };

    case "neutral":
      return {
        card:
          "border-slate-200 bg-white",
        icon:
          "bg-slate-100 text-slate-700",
        percentage:
          "text-slate-950",
        progress:
          "bg-slate-700",
      };
  }
}

export default function TripFinancialProgressCard({
  title,
  description,
  percentage,
  supportingText,
  icon: Icon,
  tone = "neutral",
}: TripFinancialProgressCardProps) {
  const safePercentage =
    clampPercentage(percentage);

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

      <div
        className="
          mt-5
          flex
          items-end
          justify-between
          gap-4
        "
      >
        <p
          className={`
            text-3xl
            font-bold
            tracking-tight
            ${toneClasses.percentage}
          `}
        >
          {percentage.toFixed(1)}%
        </p>

        {supportingText ? (
          <p
            className="
              max-w-56
              text-right
              text-xs
              leading-5
              text-slate-500
            "
          >
            {supportingText}
          </p>
        ) : null}
      </div>

      <div
        aria-label={`${title}: ${percentage.toFixed(1)}%`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={safePercentage}
        className="
          mt-4
          h-3
          overflow-hidden
          rounded-full
          bg-white/80
          ring-1
          ring-inset
          ring-slate-200
        "
        role="progressbar"
      >
        <div
          className={`
            h-full
            rounded-full
            transition-[width]
            duration-500
            ${toneClasses.progress}
          `}
          style={{
            width: `${safePercentage}%`,
          }}
        />
      </div>
    </article>
  );
}