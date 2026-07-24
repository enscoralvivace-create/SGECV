import type {
  HTMLAttributes,
  ReactNode,
} from "react";

interface CardProps
  extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export default function Card({
  children,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      className={[
        "rounded-2xl",
        "border border-slate-200",
        "bg-white",
        "shadow-sm",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}