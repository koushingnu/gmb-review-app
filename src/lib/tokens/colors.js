export const colors = {
  orange: {
    50: "#fff7ed",
    100: "#ffedd5",
    200: "#fed7aa",
    300: "#fdba74",
    400: "#fb923c",
    500: "#f97316",
    600: "#ea580c",
    700: "#c2410c",
    800: "#9a3412",
    900: "#7c2d12",
    950: "#431407",
  },
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
    950: "#030712",
  },
  green: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
    950: "#052e16",
  },
  red: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
    950: "#450a0a",
  },
  white: "#ffffff",
};

export const gradients = {
  primary: {
    default: `linear-gradient(135deg, ${colors.orange[500]} 0%, ${colors.orange[300]} 100%)`,
    hover: `linear-gradient(135deg, ${colors.orange[400]} 0%, ${colors.orange[200]} 100%)`,
    transparent: {
      light: `linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(253, 186, 116, 0.08) 100%)`,
      medium: `linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(253, 186, 116, 0.1) 100%)`,
      strong: `linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(253, 186, 116, 0.2) 100%)`,
    },
  },
  accent: {
    horizontal: `linear-gradient(to right, ${colors.orange[500]}, ${colors.orange[200]})`,
    vertical: `linear-gradient(to bottom, ${colors.orange[200]} 0%, rgba(249, 115, 22, 0.2) 100%)`,
  },
};

export const shadows = {
  sm: "0 2px 12px rgba(249, 115, 22, 0.2)",
  md: "0 4px 12px rgba(249, 115, 22, 0.2)",
  lg: "0 4px 20px rgba(249, 115, 22, 0.15)",
};

export const borders = {
  light: "rgba(249, 115, 22, 0.08)",
  medium: "rgba(249, 115, 22, 0.1)",
};

export const backgrounds = {
  light: "rgba(249, 115, 22, 0.04)",
};
