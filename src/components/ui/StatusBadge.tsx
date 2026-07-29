interface StatusBadgeProps {
  label: string;
  tone?: "neutral" | "warning" | "info" | "success" | "danger";
}

const toneClasses = {
  neutral:
    "border-slate-200 bg-slate-100 text-slate-700",
  warning:
    "border-amber-200 bg-amber-50 text-amber-700",
  info:
    "border-blue-200 bg-blue-50 text-blue-700",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-700",
  danger:
    "border-red-200 bg-red-50 text-red-700",
};

export default function StatusBadge({
  label,
  tone = "neutral",
}: StatusBadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        toneClasses[tone],
      ].join(" ")}
    >
      {label}
    </span>
  );
}