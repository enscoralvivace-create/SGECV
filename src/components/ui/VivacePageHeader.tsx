"use client";

import type { ReactNode } from "react";

interface VivacePageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
}

export default function VivacePageHeader({
  title,
  description,
  eyebrow,
  actions,
}: VivacePageHeaderProps) {
  return (
    <header className="mb-8 flex flex-col gap-6 rounded-3xl border border-emerald-100 bg-gradient-to-br from-white via-white to-emerald-50 p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
            {eyebrow}
          </p>
        ) : null}

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>

        {description ? (
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          {actions}
        </div>
      ) : null}
    </header>
  );
}