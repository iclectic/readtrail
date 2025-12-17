import React from "react";
import { NavigationContainer } from "@react-navigation/native"
import { RootTabs } from "./RootTabs";

export function AppNavigation() {
    return (
        <NavigationContainer>
            <RootTabs/>
        </NavigationContainer>
    );
}