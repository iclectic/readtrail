import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import type { RootTabParamList } from "../types/navigation";
import { LibraryStack } from "./LibraryStack";
import { StatsScreen } from "../screens/library/StatsScreen";
import { SettingsScreen } from "../screens/settings/SettingsScreen";

const Tab = createBottomTabNavigator<RootTabParamList>();

export function RootTabs() {
    return (
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ color, size }) => {
                let iconName: keyof typeof Ionicons.glyphMap = "library-outline";
                if (route.name === "LibraryTab") {
                  iconName = "library-outline";
                } else if (route.name === "StatsTab") {
                  iconName = "stats-chart-outline";
                } else if (route.name === "SettingsTab") {
                  iconName = "settings-outline";
                }
                return <Ionicons name={iconName} size={size} color={color} />;
            },
          })}
        >
            <Tab.Screen
             name="LibraryTab"
             component={LibraryStack}
             options={{ title: "Library"}}
            />
            <Tab.Screen
             name="StatsTab"
             component={StatsScreen}
             options={{ title: "Stats" }}
            />
            <Tab.Screen
             name="SettingsTab"
             component={SettingsScreen}
             options={{ title: "Settings" }}
            />
            </Tab.Navigator>
    );
}