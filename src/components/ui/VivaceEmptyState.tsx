"use client";

import type {
  ReactNode,
} from "react";

import {
  Inbox,
} from "lucide-react";

import VivaceButton from "@/components/ui/VivaceButton";

interface VivaceEmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function VivaceEmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className = "",
}: VivaceEmptyStateProps) {
  return (
    <section
      className={[
        "flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
        {icon ?? (
          <Inbox
            aria-hidden="true"
            className="h-8 w-8"
            strokeWidth={1.8}
          />
        )}
      </div>

      <h2 className="mt-5 text-xl font-bold text-slate-900">
        {title}
      </h2>

      {description ? (
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
          {description}
        </p>
      ) : null}

      {actionLabel &&
      onAction ? (
        <VivaceButton
          className="mt-6"
          onClick={onAction}
        >
          {actionLabel}
        </VivaceButton>
      ) : null}
    </section>
  );
}