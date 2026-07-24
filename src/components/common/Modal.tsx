"use client";

import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  title?: string;
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
  onClose: () => void;
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
};

export default function Modal({
  open,
  title,
  children,
  maxWidth = "md",
  onClose,
}: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={
          title ? "modal-title" : undefined
        }
        onMouseDown={(event) =>
          event.stopPropagation()
        }
        className={[
          "w-full rounded-2xl",
          "border border-slate-200",
          "bg-white shadow-xl",
          maxWidthClasses[maxWidth],
        ].join(" ")}
      >
        {title && (
          <div className="border-b border-slate-200 px-6 py-5">
            <h2
              id="modal-title"
              className="text-xl font-bold text-slate-900"
            >
              {title}
            </h2>
          </div>
        )}

        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}