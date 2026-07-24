import type { ReactNode } from "react";

type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "neutral"
  | "info";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<
  BadgeVariant,
  string
> = {
  success:
    "bg-emerald-100 text-emerald-800",

  warning:
    "bg-amber-100 text-amber-800",

  danger:
    "bg-red-100 text-red-800",

  neutral:
    "bg-slate-100 text-slate-700",

  info:
    "bg-blue-100 text-blue-800",
};

export default function Badge({
  children,
  variant = "neutral",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center",
        "rounded-full px-3 py-1",
        "text-xs font-semibold",
        variantClasses[variant],
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}