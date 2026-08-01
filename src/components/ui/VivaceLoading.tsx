"use client";

import {
  LoaderCircle,
  Music2,
} from "lucide-react";

export type VivaceLoadingVariant =
  | "inline"
  | "card"
  | "page";

interface VivaceLoadingProps {
  message?: string;
  variant?: VivaceLoadingVariant;
  className?: string;
}

export default function VivaceLoading({
  message = "Cargando información...",
  variant = "card",
  className = "",
}: VivaceLoadingProps) {
  if (variant === "inline") {
    return (
      <div
        role="status"
        aria-live="polite"
        className={[
          "inline-flex items-center gap-2 text-sm font-medium text-slate-600",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <LoaderCircle
          aria-hidden="true"
          className="h-4 w-4 animate-spin text-emerald-800"
        />

        <span>{message}</span>
      </div>
    );
  }

  const isPage =
    variant === "page";

  return (
    <section
      role="status"
      aria-live="polite"
      className={[
        "flex items-center justify-center",
        isPage
          ? "min-h-[70vh] px-6 py-12"
          : "min-h-64 rounded-3xl border border-slate-200 bg-white px-6 py-10 shadow-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="text-center">
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-900">
          <Music2
            aria-hidden="true"
            className="h-8 w-8"
            strokeWidth={1.8}
          />

          <LoaderCircle
            aria-hidden="true"
            className="absolute h-20 w-20 animate-spin text-emerald-800/35"
            strokeWidth={1.3}
          />
        </div>

        <p className="mt-5 text-sm font-semibold text-slate-700">
          {message}
        </p>

        <p className="mt-2 text-xs text-slate-500">
          Vivace Suite
        </p>
      </div>
    </section>
  );
}