import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import type { RootTabParamList } from "../types/navigation";
import { LibraryStack } from "./LibraryStack";
import { SettingsScreen } from "../screens/settings/SettingsScreen";

const Tab = createBottomTabNavigator<RootTabParamList>();

export function RootTabs() {
    return (
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ color, size }) => {
                const iconName =
                  route.name === "LibraryTab"
                    ? "library-outline"
                    : 'settings-outline';
                return <Ionicons name={iconName} size={size} color={color} />;
            },
          })}
        >
            <Tab.Screen
             name="LibraryTab"
             component={LibraryStack}
             options={{ title: "library"}}
            />
            <Tab.Screen
             name="SettingsTab"
             component={SettingsScreen}
             options={{ title: "Settings" }}
            />
            </Tab.Navigator>
    );
}