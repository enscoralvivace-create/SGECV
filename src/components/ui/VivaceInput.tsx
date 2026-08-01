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

const VivaceInput = forwardRef<
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
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helpId = `${inputId}-help`;

  return (
    <div className="space-y-2">
      {label ? (
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-slate-700"
        >
          {label}
        </label>
      ) : null}

      {description ? (
        <p id={helpId} className="text-xs text-slate-500">
          {description}
        </p>
      ) : null}

      <div className="flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-100">
        {leftIcon ? <span className="text-slate-400">{leftIcon}</span> : null}

        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={description ? helpId : undefined}
          className={`flex-1 bg-transparent outline-none ${className}`}
          {...props}
        />

        {rightIcon ? <span className="text-slate-400">{rightIcon}</span> : null}
      </div>

      {error ? (
        <p className="text-xs font-medium text-rose-600">
          {error}
        </p>
      ) : null}
    </div>
  );
});

export default VivaceInput;