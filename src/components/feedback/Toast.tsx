"use client";

import { useEffect } from "react";

type ToastVariant =
  | "success"
  | "error"
  | "warning"
  | "info";

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onClose: () => void;
}

const variantClasses: Record<
  ToastVariant,
  string
> = {
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-800",

  error:
    "border-red-200 bg-red-50 text-red-800",

  warning:
    "border-amber-200 bg-amber-50 text-amber-800",

  info:
    "border-blue-200 bg-blue-50 text-blue-800",
};

export default function Toast({
  message,
  variant = "success",
  duration = 4000,
  onClose,
}: ToastProps) {
  useEffect(() => {
    const timeout = window.setTimeout(
      onClose,
      duration,
    );

    return () => {
      window.clearTimeout(timeout);
    };
  }, [duration, onClose]);

  return (
    <div className="fixed right-6 top-6 z-50 w-full max-w-sm">
      <div
        role="status"
        className={[
          "rounded-xl border px-5 py-4 shadow-lg",
          variantClasses[variant],
        ].join(" ")}
      >
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm font-semibold">
            {message}
          </p>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar notificación"
            className="text-lg leading-none opacity-70 transition hover:opacity-100"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}