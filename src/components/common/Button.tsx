import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "ghost";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-emerald-800 hover:bg-emerald-900 text-white",

  secondary:
    "bg-slate-200 hover:bg-slate-300 text-slate-900",

  danger:
    "bg-red-600 hover:bg-red-700 text-white",

  ghost:
    "bg-transparent hover:bg-slate-100 text-slate-700",
};

export default function Button({
  children,
  variant = "primary",
  loading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        inline-flex
        items-center
        justify-center
        rounded-lg
        px-5
        py-3
        font-semibold
        transition
        disabled:cursor-not-allowed
        disabled:opacity-60
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {loading ? "Procesando..." : children}
    </button>
  );
}