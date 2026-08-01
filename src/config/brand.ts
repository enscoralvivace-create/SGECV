export const VIVACE_BRAND = {
  organizationName:
    "Ensamble Coral Vivace",
  productName:
    "Vivace Suite",
  description:
    "Sistema integral para la administración coral y académica.",
  logo: {
    primary:
      "/images/logo-ecv-v2.png",
    alt:
      "Logotipo del Ensamble Coral Vivace",
  },
  colors: {
    primary: {
      50: "#ecfdf5",
      100: "#d1fae5",
      200: "#a7f3d0",
      300: "#6ee7b7",
      400: "#34d399",
      500: "#10b981",
      600: "#059669",
      700: "#047857",
      800: "#065f46",
      900: "#064e3b",
      950: "#022c22",
    },
    accent: {
      50: "#fffbeb",
      100: "#fef3c7",
      200: "#fde68a",
      300: "#fcd34d",
      400: "#fbbf24",
      500: "#f59e0b",
      600: "#d97706",
      700: "#b45309",
      800: "#92400e",
      900: "#78350f",
      950: "#451a03",
    },
    neutral: {
      background: "#f8fafc",
      surface: "#ffffff",
      border: "#e2e8f0",
      text: "#0f172a",
      mutedText: "#64748b",
    },
  },
  gradients: {
    primary:
      "linear-gradient(135deg, #064e3b 0%, #022c22 100%)",
    soft:
      "linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)",
    accent:
      "linear-gradient(135deg, #fef3c7 0%, #ffffff 100%)",
  },
} as const;

export type VivaceBrand =
  typeof VIVACE_BRAND;

export type VivacePrimaryColor =
  keyof typeof VIVACE_BRAND.colors.primary;

export type VivaceAccentColor =
  keyof typeof VIVACE_BRAND.colors.accent;