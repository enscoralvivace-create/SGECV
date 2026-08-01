"use client";

import type { HTMLAttributes } from "react";

interface VivaceCardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  interactive?: boolean;
  gradient?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const PADDING = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
} as const;

function cx(...values: Array<string | false | undefined>) {
  return values.filter(Boolean).join(" ");
}

function Header({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("border-b border-slate-200 px-6 py-4", className)} {...props} />;
}

function Body({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("px-6 py-5", className)} {...props} />;
}

function Footer({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("border-t border-slate-200 px-6 py-4", className)} {...props} />;
}

function VivaceCard({
  elevated = true,
  interactive = false,
  gradient = false,
  padding = "none",
  className,
  ...props
}: VivaceCardProps) {
  return (
    <div
      className={cx(
        "rounded-3xl border border-slate-200 bg-white transition",
        elevated && "shadow-sm",
        interactive && "cursor-pointer hover:-translate-y-0.5 hover:shadow-md",
        gradient && "bg-gradient-to-br from-white via-white to-emerald-50/60",
        PADDING[padding],
        className,
      )}
      {...props}
    />
  );
}

export default Object.assign(VivaceCard, {
  Header,
  Body,
  Footer,
});