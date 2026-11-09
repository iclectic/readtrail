export const palette = {
  ink: "#1C1917",
  inkMuted: "#57534E",
  inkSubtle: "#78716C",
  paper: "#F7F3EC",
  paperElevated: "#FFFDF8",
  line: "#E7E0D5",
  accent: "#0F5C4C",
  accentSoft: "#D8EDE7",
  accentInk: "#FFFFFF",
  danger: "#9B1C1C",
  dangerSoft: "#F8E4E4",
  warning: "#92400E",
  success: "#166534",
  overlay: "rgba(28, 25, 23, 0.45)",
  chart: ["#0F5C4C", "#B45309", "#1D4ED8", "#9F1239", "#6D28D9", "#0E7490"],
} as const;

export const darkPalette = {
  ink: "#F5F0E8",
  inkMuted: "#D6D0C6",
  inkSubtle: "#A8A29E",
  paper: "#161411",
  paperElevated: "#221F1B",
  line: "#3F3A34",
  accent: "#3D9B86",
  accentSoft: "#1D3B34",
  accentInk: "#061512",
  danger: "#FCA5A5",
  dangerSoft: "#3F1D1D",
  warning: "#FBBF24",
  success: "#86EFAC",
  overlay: "rgba(0, 0, 0, 0.55)",
  chart: ["#3D9B86", "#F59E0B", "#60A5FA", "#FB7185", "#C4B5FD", "#22D3EE"],
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const typography = {
  display: {
    fontSize: 32,
    fontWeight: "700" as const,
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    lineHeight: 30,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
    lineHeight: 22,
  },
  bodyStrong: {
    fontSize: 16,
    fontWeight: "600" as const,
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    fontWeight: "500" as const,
    lineHeight: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    lineHeight: 18,
  },
};

export const touchTarget = 44;

export type ThemeColors = {
  ink: string;
  inkMuted: string;
  inkSubtle: string;
  paper: string;
  paperElevated: string;
  line: string;
  accent: string;
  accentSoft: string;
  accentInk: string;
  danger: string;
  dangerSoft: string;
  warning: string;
  success: string;
  overlay: string;
  chart: readonly string[];
};

export function colorsForScheme(scheme: "light" | "dark"): ThemeColors {
  return scheme === "dark" ? darkPalette : palette;
}
