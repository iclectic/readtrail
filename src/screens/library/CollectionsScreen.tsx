import React, { useCallback, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { Collection } from "../../domain/types";
import { createId } from "../../domain";
import {
  createCollection,
  deleteCollection,
  getAllCollections,
  getBookIdsInCollection,
} from "../../db";
import { Button, EmptyState, TextField } from "../../components";
import { useTheme } from "../../theme";
import { successHaptic, warningHaptic } from "../../utils/haptics";
import { logger } from "../../utils/logger";

export function CollectionsScreen() {
  const { colors, typography, spacing, radii } = useTheme();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const rows = await getAllCollections();
      setCollections(rows);
      const next: Record<string, number> = {};
      for (const c of rows) {
        next[c.id] = (await getBookIdsInCollection(c.id)).length;
      }
      setCounts(next);
    } catch (e) {
      logger.error("[collections] load failed", e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  async function onCreate() {
    if (!name.trim()) {
      Alert.alert("Name required", "Please enter a collection name.");
      return;
    }
    setSaving(true);
    try {
      await createCollection({ id: createId("collection"), name: name.trim() });
      setName("");
      successHaptic();
      await load();
    } catch (e) {
      Alert.alert(
        "Could not create collection",
        e instanceof Error ? e.message : "A collection with that name may already exist."
      );
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(collection: Collection) {
    warningHaptic();
    Alert.alert("Delete collection", `Delete “${collection.name}”? Books stay in your library.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteCollection(collection.id);
          successHaptic();
          await load();
        },
      },
    ]);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.paper, padding: spacing.md, gap: spacing.sm }]}>
      <Text style={[typography.body, { color: colors.inkMuted }]}>
        Group books into unlimited custom collections.
      </Text>
      <TextField label="New collection" value={name} onChangeText={setName} />
      <Button label="Create collection" loading={saving} onPress={onCreate} />
      <FlatList
        data={collections}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <EmptyState title="No collections yet" body="Create one to organise your library." />
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              {
                borderColor: colors.line,
                backgroundColor: colors.paperElevated,
                borderRadius: radii.md,
              },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[typography.bodyStrong, { color: colors.ink }]}>{item.name}</Text>
              <Text style={[typography.caption, { color: colors.inkMuted }]}>
                {counts[item.id] ?? 0} book{(counts[item.id] ?? 0) === 1 ? "" : "s"}
              </Text>
            </View>
            <Button label="Delete" variant="ghost" onPress={() => confirmDelete(item)} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
