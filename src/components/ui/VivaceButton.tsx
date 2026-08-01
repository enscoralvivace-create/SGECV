"use client";

import {
  LoaderCircle,
} from "lucide-react";

import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

export type VivaceButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";

export type VivaceButtonSize =
  | "sm"
  | "md"
  | "lg";

interface VivaceButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: VivaceButtonVariant;
  size?: VivaceButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const VARIANT_STYLES:
Record<VivaceButtonVariant, string> = {
  primary:
    "border-transparent bg-emerald-950 text-white shadow-sm hover:bg-emerald-900 focus-visible:ring-emerald-700",
  secondary:
    "border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-200 focus-visible:ring-slate-500",
  outline:
    "border-emerald-800 bg-white text-emerald-900 hover:bg-emerald-50 focus-visible:ring-emerald-700",
  ghost:
    "border-transparent bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-500",
  danger:
    "border-transparent bg-rose-700 text-white shadow-sm hover:bg-rose-800 focus-visible:ring-rose-600",
};

const SIZE_STYLES:
Record<VivaceButtonSize, string> = {
  sm:
    "min-h-10 rounded-lg px-3 py-2 text-xs sm:min-h-9",
  md:
    "min-h-11 rounded-xl px-4 py-2.5 text-sm",
  lg:
    "min-h-12 rounded-2xl px-5 py-3 text-base",
};

const ICON_SIZE_STYLES:
Record<VivaceButtonSize, string> = {
  sm:
    "[&>svg]:h-4 [&>svg]:w-4",
  md:
    "[&>svg]:h-5 [&>svg]:w-5",
  lg:
    "[&>svg]:h-5 [&>svg]:w-5",
};

const VivaceButton =
  forwardRef<
    HTMLButtonElement,
    VivaceButtonProps
  >(function VivaceButton(
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      disabled,
      className = "",
      children,
      type = "button",
      ...buttonProps
    },
    ref,
  ) {
    const isDisabled =
      disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={
          loading
            ? true
            : undefined
        }
        className={[
          "inline-flex touch-manipulation select-none items-center justify-center gap-2 border font-semibold transition",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-60",
          "active:scale-[0.98] motion-reduce:active:scale-100 sm:active:scale-[0.99]",
          VARIANT_STYLES[variant],
          SIZE_STYLES[size],
          ICON_SIZE_STYLES[size],
          fullWidth
            ? "w-full"
            : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...buttonProps}
      >
        {loading ? (
          <LoaderCircle
            aria-hidden="true"
            className="animate-spin"
          />
        ) : leftIcon ? (
          <span
            aria-hidden="true"
            className="inline-flex shrink-0 items-center justify-center"
          >
            {leftIcon}
          </span>
        ) : null}

        <span className="min-w-0 truncate">
          {children}
        </span>

        {!loading &&
        rightIcon ? (
          <span
            aria-hidden="true"
            className="inline-flex shrink-0 items-center justify-center"
          >
            {rightIcon}
          </span>
        ) : null}
      </button>
    );
  });

export default VivaceButton;
