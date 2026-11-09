import React, { createContext, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";
import type { AppSettings } from "../domain/types";
import {
  colorsForScheme,
  darkPalette,
  palette,
  radii,
  spacing,
  typography,
  touchTarget,
  type ThemeColors,
} from "./tokens";

type ThemeContextValue = {
  scheme: "light" | "dark";
  colors: ThemeColors;
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
  touchTarget: number;
  reduceMotion: boolean;
};

const ThemeContext = createContext<ThemeContextValue>({
  scheme: "light",
  colors: palette,
  spacing,
  radii,
  typography,
  touchTarget,
  reduceMotion: false,
});

export function ThemeProvider({
  children,
  preference = "system",
  reduceMotion = false,
}: {
  children: React.ReactNode;
  preference?: AppSettings["theme"];
  reduceMotion?: boolean;
}) {
  const system = useColorScheme();
  const scheme: "light" | "dark" =
    preference === "system" ? (system === "dark" ? "dark" : "light") : preference;

  const value = useMemo<ThemeContextValue>(
    () => ({
      scheme,
      colors: colorsForScheme(scheme),
      spacing,
      radii,
      typography,
      touchTarget,
      reduceMotion,
    }),
    [scheme, reduceMotion]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

export { palette, darkPalette, spacing, radii, typography, touchTarget };
