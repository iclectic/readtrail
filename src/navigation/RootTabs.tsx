import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import type { RootTabParamList } from "../types/navigation";
import { LibraryStack } from "./LibraryStack";
import { StatsScreen } from "../screens/library/StatsScreen";
import { SettingsScreen } from "../screens/settings/SettingsScreen";
import { GoalsScreen } from "../screens/goals/GoalsScreen";
import { DiscoverScreen } from "../screens/discover/DiscoverScreen";
import { useTheme } from "../theme";
import { t } from "../i18n";

const Tab = createBottomTabNavigator<RootTabParamList>();

export function RootTabs() {
  const { colors } = useTheme();
  const copy = t();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.inkSubtle,
        tabBarStyle: {
          backgroundColor: colors.paperElevated,
          borderTopColor: colors.line,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "library-outline";
          if (route.name === "LibraryTab") iconName = "library-outline";
          else if (route.name === "DiscoverTab") iconName = "compass-outline";
          else if (route.name === "GoalsTab") iconName = "flag-outline";
          else if (route.name === "StatsTab") iconName = "stats-chart-outline";
          else if (route.name === "SettingsTab") iconName = "settings-outline";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="LibraryTab"
        component={LibraryStack}
        options={{ title: copy.tabs.library }}
      />
      <Tab.Screen
        name="DiscoverTab"
        component={DiscoverScreen}
        options={{ title: copy.tabs.discover, headerShown: true }}
      />
      <Tab.Screen
        name="GoalsTab"
        component={GoalsScreen}
        options={{ title: copy.tabs.goals, headerShown: true }}
      />
      <Tab.Screen
        name="StatsTab"
        component={StatsScreen}
        options={{ title: copy.tabs.stats, headerShown: true }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{ title: copy.tabs.settings, headerShown: true }}
      />
    </Tab.Navigator>
  );
}
