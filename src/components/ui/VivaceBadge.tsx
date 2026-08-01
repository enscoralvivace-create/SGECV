"use client";

import type {
  HTMLAttributes,
  ReactNode,
} from "react";

export type VivaceBadgeTone =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "brand"
  | "accent";

export type VivaceBadgeSize =
  | "sm"
  | "md";

interface VivaceBadgeProps
  extends HTMLAttributes<HTMLSpanElement> {
  tone?: VivaceBadgeTone;
  size?: VivaceBadgeSize;
  icon?: ReactNode;
  dot?: boolean;
}

const TONE_STYLES:
Record<VivaceBadgeTone, string> = {
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning:
    "border-amber-200 bg-amber-50 text-amber-800",
  danger:
    "border-rose-200 bg-rose-50 text-rose-800",
  info:
    "border-sky-200 bg-sky-50 text-sky-800",
  neutral:
    "border-slate-200 bg-slate-100 text-slate-700",
  brand:
    "border-emerald-900/20 bg-emerald-950 text-white",
  accent:
    "border-amber-300 bg-amber-100 text-amber-900",
};

const DOT_STYLES:
Record<VivaceBadgeTone, string> = {
  success: "bg-emerald-600",
  warning: "bg-amber-600",
  danger: "bg-rose-600",
  info: "bg-sky-600",
  neutral: "bg-slate-500",
  brand: "bg-emerald-200",
  accent: "bg-amber-700",
};

const SIZE_STYLES:
Record<VivaceBadgeSize, string> = {
  sm:
    "min-h-6 gap-1.5 rounded-full px-2 py-1 text-[10px] sm:px-2.5 sm:text-[11px]",
  md:
    "min-h-7 gap-2 rounded-full px-2.5 py-1 text-[11px] sm:px-3 sm:text-xs",
};

export default function VivaceBadge({
  tone = "neutral",
  size = "md",
  icon,
  dot = false,
  className = "",
  children,
  ...spanProps
}: VivaceBadgeProps) {
  return (
    <span
      className={[
        "inline-flex max-w-full items-center border font-semibold leading-none",
        TONE_STYLES[tone],
        SIZE_STYLES[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...spanProps}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className={[
            "h-1.5 w-1.5 shrink-0 rounded-full",
            DOT_STYLES[tone],
          ].join(" ")}
        />
      ) : null}

      {icon ? (
        <span
          aria-hidden="true"
          className="inline-flex shrink-0 items-center justify-center [&>svg]:h-3.5 [&>svg]:w-3.5"
        >
          {icon}
        </span>
      ) : null}

      <span className="min-w-0 truncate">
        {children}
      </span>
    </span>
  );
}
