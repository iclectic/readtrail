import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { NativeStackScreenProps} from "@react-navigation/native-stack";
import type { LibraryStackParamList } from "../../types/navigation";
type Props = NativeStackScreenProps<LibraryStackParamList, "BookDetails">;

export function BookDetailsScreen({ route }: Props) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Book Details</Text>
            <Text>bookId: {route.params.bookId}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, padding: 16, justifyContent: "center", gap: 12 },
    title: { fontSize: 20, fontWeight: "700", textAlign: "center" },
});