export const theme = {
  colors: {
    primary: "#065f46",
    primaryHover: "#064e3b",
    primarySoft: "#d1fae5",

    secondary: "#0f766e",
    secondaryHover: "#115e59",

    success: "#059669",
    warning: "#d97706",
    danger: "#dc2626",
    info: "#2563eb",

    background: "#f1f5f9",
    surface: "#ffffff",

    text: "#0f172a",
    textSecondary: "#475569",
    textMuted: "#64748b",

    border: "#e2e8f0",
  },

  radius: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
  },

  shadow: {
    sm: "0 1px 2px rgb(15 23 42 / 0.05)",
    md: "0 4px 6px -1px rgb(15 23 42 / 0.1)",
    lg: "0 10px 15px -3px rgb(15 23 42 / 0.1)",
  },
} as const;

export type Theme = typeof theme;