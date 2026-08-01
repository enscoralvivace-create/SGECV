"use client";

import type {
  ReactNode,
} from "react";

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
    <header className="mb-4 overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-white via-white to-emerald-50 p-4 shadow-sm sm:mb-6 sm:rounded-3xl sm:p-6 lg:mb-8 lg:flex lg:items-center lg:justify-between lg:gap-6">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700 sm:text-xs sm:tracking-[0.2em]">
            {eyebrow}
          </p>
        ) : null}

        <h1 className="mt-1.5 break-words text-2xl font-bold tracking-tight text-slate-900 sm:mt-2 sm:text-3xl">
          {title}
        </h1>

        {description ? (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div className="mt-4 grid gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3 lg:mt-0 lg:shrink-0 lg:justify-end">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
