import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import type { LibraryStackParamList } from "../types/navigation";
import { LibraryHomeScreen } from "../screens/library/LibraryHomeScreen";
import { BookDetailsScreen } from "../screens/library/BookDetailsScreen";
import { AddEditBookScreen } from "../screens/library/AddEditBookScreen";
import { UpdateProgressScreen } from "../screens/library/UpdateProgressScreen";
import { ReadingSessionScreen } from "../screens/library/ReadingSessionScreen";
import { NotesListScreen } from "../screens/notes/NotesListScreen";
import { NoteEditorScreen } from "../screens/notes/NoteEditorScreen";
import { CollectionsScreen } from "../screens/library/CollectionsScreen";
import { useTheme } from "../theme";

const Stack = createNativeStackNavigator<LibraryStackParamList>();

export function LibraryStack() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.paper },
        headerTintColor: colors.accent,
        headerTitleStyle: { color: colors.ink, fontWeight: "700" },
        contentStyle: { backgroundColor: colors.paper },
      }}
    >
      <Stack.Screen
        name="LibraryHome"
        component={LibraryHomeScreen}
        options={({ navigation }) => ({
          title: "Library",
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add book"
              style={styles.headerButton}
              onPress={() => navigation.navigate("AddEditBook")}
            >
              <Ionicons name="add-circle-outline" size={26} color={colors.accent} />
            </Pressable>
          ),
        })}
      />
      <Stack.Screen
        name="BookDetails"
        component={BookDetailsScreen}
        options={({ navigation, route }) => ({
          title: "Book details",
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit book"
              style={styles.headerButton}
              onPress={() =>
                navigation.navigate("AddEditBook", { bookId: route.params.bookId })
              }
            >
              <Ionicons name="pencil-outline" size={22} color={colors.accent} />
            </Pressable>
          ),
        })}
      />
      <Stack.Screen name="AddEditBook" component={AddEditBookScreen} />
      <Stack.Screen
        name="UpdateProgress"
        component={UpdateProgressScreen}
        options={{ title: "Update progress" }}
      />
      <Stack.Screen
        name="ReadingSession"
        component={ReadingSessionScreen}
        options={{ title: "Reading session" }}
      />
      <Stack.Screen
        name="NotesList"
        component={NotesListScreen}
        options={{ title: "Notes" }}
      />
      <Stack.Screen name="NoteEditor" component={NoteEditorScreen} />
      <Stack.Screen
        name="Collections"
        component={CollectionsScreen}
        options={{ title: "Collections" }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  headerButton: { padding: 4 },
});
