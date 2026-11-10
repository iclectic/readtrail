import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Book } from "../../domain/types";
import type { RootTabParamList } from "../../types/navigation";
import { getAllBooks } from "../../db";
import { recommendFromLibrary } from "../../services/recommendations";
import {
  lookupBookByIsbn,
  searchBookMetadata,
  type BookMetadataResult,
} from "../../services/metadata";
import { Button, EmptyState, TextField } from "../../components";
import { useTheme } from "../../theme";
import { logger } from "../../utils/logger";

export function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const { colors, typography, spacing, radii } = useTheme();
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const [recommendations, setRecommendations] = useState<
    { book: Book; reason: string }[]
  >([]);
  const [query, setQuery] = useState("");
  const [isbn, setIsbn] = useState("");
  const [results, setResults] = useState<BookMetadataResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const books = await getAllBooks();
          setRecommendations(recommendFromLibrary(books));
        } catch (e) {
          logger.error("[discover] recommendations failed", e);
        }
      })();
    }, [])
  );

  async function onSearch() {
    setLoading(true);
    setError(null);
    try {
      const { results: found, errors } = await searchBookMetadata(query);
      setResults(found);
      if (found.length === 0) {
        setError(
          errors[0] ??
            "No catalogue matches. Try another title or add the book manually."
        );
      }
    } catch {
      setError("Catalogue search is unavailable offline.");
    } finally {
      setLoading(false);
    }
  }

  async function onIsbn() {
    setLoading(true);
    setError(null);
    try {
      const { result, errors } = await lookupBookByIsbn(isbn);
      setResults(result ? [result] : []);
      if (!result) {
        setError(errors[0] ?? "No book found for that ISBN.");
      }
    } catch {
      setError("ISBN lookup is unavailable offline.");
    } finally {
      setLoading(false);
    }
  }

  function openPrefill(item: BookMetadataResult) {
    navigation.navigate("LibraryTab", {
      screen: "AddEditBook",
      params: {
        prefill: {
          title: item.title,
          author: item.authors.join(", "),
          totalPages: item.pageCount ?? undefined,
          isbn: item.isbn ?? undefined,
          publisher: item.publisher ?? undefined,
          publishedYear: item.publishedYear ?? undefined,
          description: item.description ?? undefined,
          coverUri: item.coverUrl ?? undefined,
          genre: item.subjects?.[0],
        },
      },
    });
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.paper,
          paddingTop: insets.top + spacing.md,
          paddingHorizontal: spacing.md,
          paddingBottom: insets.bottom + spacing.md,
          gap: spacing.sm,
        },
      ]}
    >
      <Text style={[typography.title, { color: colors.ink }]}>Discover</Text>
      <Text style={[typography.body, { color: colors.inkMuted }]}>
        Search catalogues when online, or follow personal recommendations from your own
        library.
      </Text>

      <TextField
        label="Search titles"
        value={query}
        onChangeText={setQuery}
        placeholder="e.g. Middlemarch"
        autoCapitalize="sentences"
      />
      <Button label="Search catalogues" loading={loading} onPress={onSearch} />

      <TextField
        label="ISBN"
        value={isbn}
        onChangeText={setIsbn}
        placeholder="978..."
        autoCapitalize="characters"
      />
      <Button label="Look up ISBN" variant="secondary" loading={loading} onPress={onIsbn} />
      <Button
        label="Scan ISBN barcode"
        variant="ghost"
        onPress={() =>
          navigation.navigate("LibraryTab", { screen: "BarcodeScan" })
        }
      />

      {loading ? <ActivityIndicator color={colors.accent} /> : null}
      {error ? <Text style={{ color: colors.warning }}>{error}</Text> : null}

      {results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item, index) => `${item.source}-${item.isbn ?? item.title}-${index}`}
          initialNumToRender={10}
          windowSize={9}
          removeClippedSubviews
          ListHeaderComponent={
            <Text style={[typography.subtitle, { color: colors.ink, marginBottom: 8 }]}>
              Catalogue results
            </Text>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => openPrefill(item)}
              accessibilityRole="button"
              accessibilityLabel={`Add ${item.title} to library`}
              style={[
                styles.card,
                {
                  borderColor: colors.line,
                  backgroundColor: colors.paperElevated,
                  borderRadius: radii.md,
                },
              ]}
            >
              <Text style={[typography.bodyStrong, { color: colors.ink }]}>{item.title}</Text>
              <Text style={[typography.caption, { color: colors.inkMuted }]}>
                {item.authors.join(", ") || "Unknown author"}
                {item.publishedYear ? ` · ${item.publishedYear}` : ""}
              </Text>
              <Text style={[typography.caption, { color: colors.accent }]}>Add to library</Text>
            </Pressable>
          )}
        />
      ) : (
        <FlatList
          data={recommendations}
          keyExtractor={(item) => item.book.id}
          initialNumToRender={8}
          windowSize={7}
          removeClippedSubviews
          ListHeaderComponent={
            <Text style={[typography.subtitle, { color: colors.ink, marginVertical: 8 }]}>
              From your library
            </Text>
          }
          ListEmptyComponent={
            <EmptyState
              title="Nothing to recommend yet"
              body="Finish a few books or add titles to Want to read for personalised suggestions."
            />
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
              <Text style={[typography.bodyStrong, { color: colors.ink }]}>
                {item.book.title}
              </Text>
              <Text style={[typography.caption, { color: colors.inkMuted }]}>
                {item.reason}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    marginBottom: 10,
    gap: 4,
  },
});
