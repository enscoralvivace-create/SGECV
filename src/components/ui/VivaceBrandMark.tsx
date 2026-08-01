"use client";

import Image from "next/image";

import {
  VIVACE_BRAND,
} from "@/config/brand";

export type VivaceBrandMarkSize =
  | "sm"
  | "md"
  | "lg";

export type VivaceBrandMarkTheme =
  | "light"
  | "dark";

interface VivaceBrandMarkProps {
  size?: VivaceBrandMarkSize;
  theme?: VivaceBrandMarkTheme;
  showOrganization?: boolean;
  showDescription?: boolean;
  className?: string;
}

const SIZE_STYLES:
Record<
  VivaceBrandMarkSize,
  {
    container: string;
    logo: string;
    product: string;
    organization: string;
    description: string;
    imageSize: number;
  }
> = {
  sm: {
    container: "gap-3",
    logo:
      "h-11 w-11 rounded-xl p-1",
    product:
      "text-lg",
    organization:
      "text-[9px] tracking-[0.16em]",
    description:
      "text-[11px]",
    imageSize: 44,
  },
  md: {
    container: "gap-4",
    logo:
      "h-16 w-16 rounded-2xl p-1",
    product:
      "text-xl",
    organization:
      "text-[10px] tracking-[0.2em]",
    description:
      "text-xs",
    imageSize: 64,
  },
  lg: {
    container: "gap-5",
    logo:
      "h-20 w-20 rounded-3xl p-2",
    product:
      "text-2xl",
    organization:
      "text-xs tracking-[0.22em]",
    description:
      "text-sm",
    imageSize: 80,
  },
};

const THEME_STYLES:
Record<
  VivaceBrandMarkTheme,
  {
    logo: string;
    product: string;
    organization: string;
    description: string;
  }
> = {
  light: {
    logo:
      "border-emerald-900/10 bg-emerald-50",
    product:
      "text-slate-900",
    organization:
      "text-emerald-800",
    description:
      "text-slate-500",
  },
  dark: {
    logo:
      "border-white/15 bg-white/10",
    product:
      "text-white",
    organization:
      "text-emerald-200",
    description:
      "text-emerald-100/80",
  },
};

export default function VivaceBrandMark({
  size = "md",
  theme = "light",
  showOrganization = true,
  showDescription = true,
  className = "",
}: VivaceBrandMarkProps) {
  const sizeStyles =
    SIZE_STYLES[size];

  const themeStyles =
    THEME_STYLES[theme];

  return (
    <div
      className={[
        "flex min-w-0 items-center",
        sizeStyles.container,
        className,
      ].join(" ")}
    >
      <div
        className={[
          "flex shrink-0 items-center justify-center overflow-hidden border shadow-sm",
          sizeStyles.logo,
          themeStyles.logo,
        ].join(" ")}
      >
        <Image
          src={
            VIVACE_BRAND.logo.primary
          }
          alt={
            VIVACE_BRAND.logo.alt
          }
          width={
            sizeStyles.imageSize
          }
          height={
            sizeStyles.imageSize
          }
          priority
          className="h-full w-full object-contain"
        />
      </div>

      <div className="min-w-0">
        {showOrganization ? (
          <p
            className={[
              "truncate font-bold uppercase",
              sizeStyles.organization,
              themeStyles.organization,
            ].join(" ")}
          >
            {
              VIVACE_BRAND.organizationName
            }
          </p>
        ) : null}

        <p
          className={[
            "truncate font-bold tracking-tight",
            sizeStyles.product,
            themeStyles.product,
          ].join(" ")}
        >
          {
            VIVACE_BRAND.productName
          }
        </p>

        {showDescription ? (
          <p
            className={[
              "mt-1 truncate font-medium",
              sizeStyles.description,
              themeStyles.description,
            ].join(" ")}
          >
            Sistema de gestión
          </p>
        ) : null}
      </div>
    </div>
  );
}