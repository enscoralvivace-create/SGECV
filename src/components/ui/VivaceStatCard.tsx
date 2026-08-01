"use client";

import type { ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  Minus,
} from "lucide-react";

import VivaceCard from "./VivaceCard";

interface VivaceStatCardProps {
  title: string;
  value: ReactNode;
  subtitle?: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
}

export default function VivaceStatCard({
  title,
  value,
  subtitle,
  icon,
  trend = "neutral",
  trendLabel,
}: VivaceStatCardProps) {
  const TrendIcon =
    trend === "up"
      ? ArrowUp
      : trend === "down"
      ? ArrowDown
      : Minus;

  const trendColor =
    trend === "up"
      ? "text-emerald-700"
      : trend === "down"
      ? "text-rose-700"
      : "text-slate-500";

  return (
    <VivaceCard
      interactive
      className="overflow-hidden"
    >
      <VivaceCard.Body className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          {subtitle ? (
            <p className="mt-2 text-sm text-slate-500">
              {subtitle}
            </p>
          ) : null}

          {trendLabel ? (
            <div className={`mt-3 inline-flex items-center gap-1 text-xs font-semibold ${trendColor}`}>
              <TrendIcon className="h-4 w-4" />
              {trendLabel}
            </div>
          ) : null}
        </div>

        {icon ? (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
            {icon}
          </div>
        ) : null}
      </VivaceCard.Body>
    </VivaceCard>
  );
}