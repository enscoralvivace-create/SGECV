"use client";

import {
  useEffect,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import {
  X,
} from "lucide-react";

export type VivaceModalSize =
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "full";

interface VivaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: VivaceModalSize;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}

const SIZE_STYLES:
Record<VivaceModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
  full: "max-w-[calc(100vw-2rem)]",
};

export default function VivaceModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  closeOnBackdrop = true,
  closeOnEscape = true,
  className = "",
}: VivaceModalProps) {
  useEffect(() => {
    if (
      !isOpen ||
      !closeOnEscape
    ) {
      return;
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ): void {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    closeOnEscape,
    isOpen,
    onClose,
  ]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const titleId =
    title
      ? "vivace-modal-title"
      : undefined;

  const descriptionId =
    description
      ? "vivace-modal-description"
      : undefined;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (
          closeOnBackdrop &&
          event.target ===
            event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={
          descriptionId
        }
        className={[
          "flex max-h-[92vh] w-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl",
          SIZE_STYLES[size],
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {title || description ? (
          <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
            <div className="min-w-0">
              {title ? (
                <h2
                  id={titleId}
                  className="text-xl font-bold tracking-tight text-slate-950"
                >
                  {title}
                </h2>
              ) : null}

              {description ? (
                <p
                  id={descriptionId}
                  className="mt-1 text-sm leading-6 text-slate-600"
                >
                  {description}
                </p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar ventana"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <X
                aria-hidden="true"
                className="h-5 w-5"
              />
            </button>
          </header>
        ) : null}

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {footer ? (
          <footer className="border-t border-slate-200 bg-slate-50/80 px-6 py-4">
            {footer}
          </footer>
        ) : null}
      </section>
    </div>
  );
}

interface VivaceModalSectionProps
  extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function VivaceModalSection({
  children,
  className = "",
  ...sectionProps
}: VivaceModalSectionProps) {
  return (
    <div
      className={[
        "space-y-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...sectionProps}
    >
      {children}
    </div>
  );
}