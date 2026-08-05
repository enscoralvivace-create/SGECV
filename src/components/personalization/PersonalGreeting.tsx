"use client";

import { usePersonalGreeting } from "@/components/personalization/PersonalGreetingProvider";

export default function PersonalGreeting({
  variant,
}: {
  variant: "sidebar" | "mobile";
}) {
  const { greeting, preferredName, isLoading } = usePersonalGreeting();
  const isMobile = variant === "mobile";

  return (
    <section
      aria-label="Saludo personal"
      className={
        isMobile
          ? "border-b border-slate-200 bg-emerald-50/70 px-5 py-4"
          : "border-b border-slate-200 bg-emerald-50/50 px-5 py-3.5"
      }
    >
      <p className="text-xs font-semibold text-emerald-800">
        {isLoading ? "Hola" : greeting}
      </p>
      {isLoading ? (
        <div
          aria-hidden="true"
          className="mt-2 h-4 w-32 animate-pulse rounded bg-emerald-200/70 motion-reduce:animate-none"
        />
      ) : (
        <p
          className="mt-0.5 truncate text-sm font-bold text-slate-950"
          title={preferredName}
        >
          {preferredName}
        </p>
      )}
    </section>
  );
}
