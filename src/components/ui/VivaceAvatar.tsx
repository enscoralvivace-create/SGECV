"use client";

import Image from "next/image";

export type VivaceAvatarSize =
  | "sm"
  | "md"
  | "lg"
  | "xl";

export type VivaceAvatarStatus =
  | "online"
  | "offline"
  | "busy"
  | "away";

interface VivaceAvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: VivaceAvatarSize;
  status?: VivaceAvatarStatus;
  className?: string;
}

const SIZE_STYLES:
Record<
  VivaceAvatarSize,
  {
    container: string;
    text: string;
    imageSize: number;
    status: string;
  }
> = {
  sm: {
    container: "h-8 w-8 rounded-lg",
    text: "text-xs",
    imageSize: 32,
    status:
      "h-2.5 w-2.5 border-2",
  },
  md: {
    container: "h-11 w-11 rounded-xl",
    text: "text-sm",
    imageSize: 44,
    status:
      "h-3 w-3 border-2",
  },
  lg: {
    container: "h-14 w-14 rounded-2xl",
    text: "text-base",
    imageSize: 56,
    status:
      "h-3.5 w-3.5 border-2",
  },
  xl: {
    container: "h-20 w-20 rounded-3xl",
    text: "text-xl",
    imageSize: 80,
    status:
      "h-4 w-4 border-[3px]",
  },
};

const STATUS_STYLES:
Record<VivaceAvatarStatus, string> = {
  online: "bg-emerald-500",
  offline: "bg-slate-400",
  busy: "bg-rose-500",
  away: "bg-amber-500",
};

function createInitials(
  name: string,
): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "VS";
  }

  return parts
    .slice(0, 2)
    .map((part) =>
      part.charAt(0).toUpperCase(),
    )
    .join("");
}

export default function VivaceAvatar({
  name,
  imageUrl,
  size = "md",
  status,
  className = "",
}: VivaceAvatarProps) {
  const styles =
    SIZE_STYLES[size];

  const initials =
    createInitials(name);

  return (
    <div
      className={[
        "relative inline-flex shrink-0",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={name}
    >
      <div
        className={[
          "flex items-center justify-center overflow-hidden border border-emerald-900/10 bg-gradient-to-br from-emerald-100 to-emerald-50 font-bold text-emerald-900 shadow-sm",
          styles.container,
          styles.text,
        ].join(" ")}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            width={
              styles.imageSize
            }
            height={
              styles.imageSize
            }
            className="h-full w-full object-cover"
          />
        ) : (
          <span aria-hidden="true">
            {initials}
          </span>
        )}
      </div>

      {status ? (
        <span
          aria-label={`Estado: ${status}`}
          className={[
            "absolute -bottom-0.5 -right-0.5 rounded-full border-white",
            styles.status,
            STATUS_STYLES[status],
          ].join(" ")}
        />
      ) : null}
    </div>
  );
}