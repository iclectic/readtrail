import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { LibraryStackParamList } from "../../types/navigation";
type Props = NativeStackScreenProps<LibraryStackParamList, "LibraryHome">;

export function LibraryHomeScreen({ navigation }: Props) {
    return (
        <View style={styles.container}>
          <Text style={styles.title}>Your Library</Text>
        <Button
          title="Open a book"
          onPress={() => navigation.navigate("BookDetails", {bookId: "demo-1" })}
        />
        </View>
    );
}
const styles = StyleSheet.create({
    container: {flex: 1, padding: 16, justifyContent: "center", gap: 12 },
    title: { fontSize: 24, fontWeight: "700", textAlign: "center" },
});