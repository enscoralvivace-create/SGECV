"use client";

import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

interface VivaceInputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const VivaceInput =
  forwardRef<
    HTMLInputElement,
    VivaceInputProps
  >(function VivaceInput(
    {
      label,
      description,
      error,
      leftIcon,
      rightIcon,
      className = "",
      id,
      disabled,
      ...props
    },
    ref,
  ) {
    const generatedId =
      useId();

    const inputId =
      id ?? generatedId;

    const descriptionId =
      `${inputId}-description`;

    const errorId =
      `${inputId}-error`;

    const describedBy = [
      description
        ? descriptionId
        : null,
      error
        ? errorId
        : null,
    ]
      .filter(Boolean)
      .join(" ") ||
      undefined;

    return (
      <div className="space-y-2">
        {label ? (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-slate-700"
          >
            {label}
          </label>
        ) : null}

        {description ? (
          <p
            id={descriptionId}
            className="text-xs leading-5 text-slate-500"
          >
            {description}
          </p>
        ) : null}

        <div
          className={[
            "flex min-h-11 items-center gap-3 rounded-xl border bg-white px-3.5 py-2.5 transition sm:px-4",
            error
              ? "border-rose-400 focus-within:border-rose-600 focus-within:ring-2 focus-within:ring-rose-100"
              : "border-slate-300 focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-100",
            disabled
              ? "cursor-not-allowed bg-slate-100 opacity-70"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {leftIcon ? (
            <span className="inline-flex shrink-0 items-center justify-center text-slate-400 [&>svg]:h-4 [&>svg]:w-4">
              {leftIcon}
            </span>
          ) : null}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={
              error
                ? true
                : undefined
            }
            aria-describedby={
              describedBy
            }
            className={[
              "min-w-0 flex-1 bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400 sm:text-sm",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            {...props}
          />

          {rightIcon ? (
            <span className="inline-flex shrink-0 items-center justify-center text-slate-400 [&>svg]:h-4 [&>svg]:w-4">
              {rightIcon}
            </span>
          ) : null}
        </div>

        {error ? (
          <p
            id={errorId}
            role="alert"
            className="text-xs font-medium leading-5 text-rose-600"
          >
            {error}
          </p>
        ) : null}
      </div>
    );
  });

export default VivaceInput;
