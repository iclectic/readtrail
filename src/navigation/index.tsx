import React from "react";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { RootTabs } from "./RootTabs";
import { useTheme } from "../theme";

export function AppNavigation() {
  const { scheme, colors } = useTheme();

  const navTheme = {
    ...(scheme === "dark" ? DarkTheme : DefaultTheme),
    colors: {
      ...(scheme === "dark" ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.accent,
      background: colors.paper,
      card: colors.paperElevated,
      text: colors.ink,
      border: colors.line,
      notification: colors.accent,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <RootTabs />
    </NavigationContainer>
  );
}
