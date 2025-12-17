import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { LibraryStackParamList } from "../types/navigation";
import { LibraryHomeScreen } from "../screens/library/LibraryHomeScreen";
import { BookDetailsScreen } from "../screens/library/BookDetailsScreen";

const Stack = createNativeStackNavigator<LibraryStackParamList>();
export function LibraryStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
              name="LibraryHome"
              component={LibraryHomeScreen}
              options={{ title: "Library" }}
            />
            <Stack.Screen
             name="BookDetails"
             component={BookDetailsScreen}
             options={{ title: "Book Details"}}
            />
        </Stack.Navigator>
    );
}