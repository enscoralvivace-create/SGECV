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
  if (
    variant === "inline"
  ) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={[
          "inline-flex min-h-8 items-center gap-2 text-sm font-medium text-slate-600",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <LoaderCircle
          aria-hidden="true"
          className="h-4 w-4 shrink-0 animate-spin text-emerald-800"
        />

        <span className="min-w-0">
          {message}
        </span>
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
          ? "min-h-[55dvh] px-4 py-10 sm:min-h-[70vh] sm:px-6 sm:py-12"
          : "min-h-52 rounded-2xl border border-slate-200 bg-white px-4 py-8 shadow-sm sm:min-h-64 sm:rounded-3xl sm:px-6 sm:py-10",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="text-center">
        <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-900 sm:h-20 sm:w-20 sm:rounded-3xl">
          <Music2
            aria-hidden="true"
            className="h-7 w-7 sm:h-8 sm:w-8"
            strokeWidth={1.8}
          />

          <LoaderCircle
            aria-hidden="true"
            className="absolute h-16 w-16 animate-spin text-emerald-800/35 sm:h-20 sm:w-20"
            strokeWidth={1.3}
          />
        </div>

        <p className="mt-4 text-sm font-semibold text-slate-700 sm:mt-5">
          {message}
        </p>

        <p className="mt-1.5 text-xs text-slate-500 sm:mt-2">
          Vivace Suite
        </p>
      </div>
    </section>
  );
}
