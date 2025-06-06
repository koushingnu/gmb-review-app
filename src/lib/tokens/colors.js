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
  },
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
