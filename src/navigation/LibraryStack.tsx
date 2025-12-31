import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import type { LibraryStackParamList } from "../types/navigation";
import { LibraryHomeScreen } from "../screens/library/LibraryHomeScreen";
import { BookDetailsScreen } from "../screens/library/BookDetailsScreen";
import { AddEditBookScreen } from "../screens/library/AddEditBookScreen";
import { UpdateProgressScreen } from "../screens/library/UpdateProgressScreen";

const Stack = createNativeStackNavigator<LibraryStackParamList>();
export function LibraryStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
              name="LibraryHome"
              component={LibraryHomeScreen}
              options={({ navigation }) => ({
                title: "Library",
                headerRight: () => (
                  <Pressable
                    style={styles.headerButton}
                    onPress={() => navigation.navigate("AddEditBook")}
                  >
                    <Ionicons name="add-circle-outline" size={26} color="#007AFF" />
                  </Pressable>
                ),
              })}
            />
            <Stack.Screen
             name="BookDetails"
             component={BookDetailsScreen}
             options={({ navigation, route }) => ({
               title: "Book Details",
               headerRight: () => (
                 <Pressable
                   style={styles.headerButton}
                   onPress={() =>
                     navigation.navigate("AddEditBook", { bookId: route.params.bookId })
                   }
                 >
                   <Ionicons name="pencil-outline" size={22} color="#007AFF" />
                 </Pressable>
               ),
             })}
            />
            <Stack.Screen
             name="AddEditBook"
             component={AddEditBookScreen}
            />
            <Stack.Screen
             name="UpdateProgress"
             component={UpdateProgressScreen}
             options={{ title: "Update Progress" }}
            />
        </Stack.Navigator>
    );
}

const styles = StyleSheet.create({
  headerButton: {
    padding: 4,
  },
});