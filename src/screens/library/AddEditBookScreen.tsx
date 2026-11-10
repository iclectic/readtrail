import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { LibraryStackParamList } from "../../types/navigation";
import {
  BOOK_FORMATS,
  BOOK_STATUSES,
  OWNERSHIP_TYPES,
  type BookFormat,
  type BookStatus,
  type OwnershipType,
} from "../../domain/types";
import { createId } from "../../domain";
import { statusLabel } from "../../domain/progress";
import { createBook, getAllTags, getBookById, getTagsForBook, updateBook } from "../../db";
import { Button, Chip, TextField } from "../../components";
import { TagEditor } from "../../components/library/TagEditor";
import { useTheme } from "../../theme";
import { searchBookMetadata, lookupBookByIsbn } from "../../services/metadata";
import { setBookTagsFromNames } from "../../services/tagsService";
import { trackEvent } from "../../services/analyticsEvents";
import { successHaptic } from "../../utils/haptics";
import { logger } from "../../utils/logger";

type Props = NativeStackScreenProps<LibraryStackParamList, "AddEditBook">;

export function AddEditBookScreen({ navigation, route }: Props) {
  const bookId = route.params?.bookId;
  const prefill = route.params?.prefill;
  const isEdit = Boolean(bookId);
  const { colors, typography, spacing } = useTheme();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);

  const [title, setTitle] = useState(prefill?.title ?? "");
  const [author, setAuthor] = useState(prefill?.author ?? "");
  const [totalPages, setTotalPages] = useState(
    prefill?.totalPages != null ? String(prefill.totalPages) : ""
  );
  const [isbn, setIsbn] = useState(prefill?.isbn ?? "");
  const [genre, setGenre] = useState(prefill?.genre ?? "");
  const [publisher, setPublisher] = useState(prefill?.publisher ?? "");
  const [publishedYear, setPublishedYear] = useState(
    prefill?.publishedYear != null ? String(prefill.publishedYear) : ""
  );
  const [description, setDescription] = useState(prefill?.description ?? "");
  const [coverUri, setCoverUri] = useState(prefill?.coverUri ?? "");
  const [status, setStatus] = useState<BookStatus>("want_to_read");
  const [format, setFormat] = useState<BookFormat>("physical");
  const [ownership, setOwnership] = useState<OwnershipType>("owned");
  const [rating, setRating] = useState("");
  const [tagNames, setTagNames] = useState<string[]>([]);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);

  const titleError = useMemo(() => {
    if (title.trim().length === 0) return "Title is required.";
    return null;
  }, [title]);

  const totalPagesNumber = useMemo(() => {
    if (!totalPages) return 0;
    const parsed = Number(totalPages);
    return parsed;
  }, [totalPages]);

  const totalPagesError = useMemo(() => {
    if (!totalPages) return null;
    if (!Number.isInteger(totalPagesNumber) || totalPagesNumber < 0) {
      return "Total pages must be a whole number.";
    }
    return null;
  }, [totalPages, totalPagesNumber]);

  useEffect(() => {
    navigation.setOptions({ title: isEdit ? "Edit book" : "Add book" });
  }, [isEdit, navigation]);

  useEffect(() => {
    if (!isEdit) return;
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const book = await getBookById(bookId!);
        if (!mounted) return;
        if (!book) {
          Alert.alert("Not found", "That book no longer exists.", [
            { text: "OK", onPress: () => navigation.goBack() },
          ]);
          return;
        }
        setTitle(book.title);
        setAuthor(book.author);
        setTotalPages(String(book.totalPages));
        setStatus(book.status);
        setFormat(book.format);
        setOwnership(book.ownership);
        setIsbn(book.isbn ?? "");
        setGenre(book.genre ?? "");
        setPublisher(book.publisher ?? "");
        setPublishedYear(book.publishedYear != null ? String(book.publishedYear) : "");
        setDescription(book.description ?? "");
        setCoverUri(book.coverUri ?? "");
        setRating(book.rating != null ? String(book.rating) : "");
        const tags = await getTagsForBook(book.id);
        if (mounted) setTagNames(tags.map((t) => t.name));
      } catch (e) {
        logger.error("[book] failed to load for edit", e);
        if (mounted) Alert.alert("Error", "Could not load this book.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [bookId, isEdit, navigation]);

  useEffect(() => {
    void getAllTags()
      .then((tags) => setTagSuggestions(tags.map((t) => t.name)))
      .catch(() => undefined);
  }, []);

  async function onLookupIsbn() {
    const value = isbn.trim();
    if (!value) {
      Alert.alert("ISBN required", "Enter an ISBN to look up metadata.");
      return;
    }
    setLookingUp(true);
    try {
      const { result, errors } = await lookupBookByIsbn(value);
      if (!result) {
        Alert.alert(
          "No match",
          errors[0] ??
            "No metadata found for that ISBN. You can still save the book manually."
        );
        return;
      }
      setTitle(result.title);
      if (result.authors.length) setAuthor(result.authors.join(", "));
      if (result.pageCount) setTotalPages(String(result.pageCount));
      if (result.publisher) setPublisher(result.publisher);
      if (result.publishedYear) setPublishedYear(String(result.publishedYear));
      if (result.description) setDescription(result.description);
      if (result.coverUrl) setCoverUri(result.coverUrl);
      if (result.subjects?.[0]) setGenre(result.subjects[0]);
      if (result.isbn) setIsbn(result.isbn);
      successHaptic();
    } catch (e) {
      logger.error("[book] isbn lookup failed", e);
      Alert.alert(
        "Lookup unavailable",
        "Could not reach the metadata service. Check your connection or enter details manually."
      );
    } finally {
      setLookingUp(false);
    }
  }

  async function onSearchTitle() {
    const query = title.trim();
    if (!query) {
      Alert.alert("Title required", "Enter a title to search online catalogues.");
      return;
    }
    setLookingUp(true);
    try {
      const { results, errors } = await searchBookMetadata(query);
      if (results.length === 0) {
        Alert.alert(
          "No results",
          errors[0] ?? "No matches found. You can continue with manual entry."
        );
        return;
      }
      const top = results[0]!;
      Alert.alert(
        "Use this match?",
        `${top.title}${top.authors.length ? ` — ${top.authors.join(", ")}` : ""}`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Apply",
            onPress: () => {
              setTitle(top.title);
              if (top.authors.length) setAuthor(top.authors.join(", "));
              if (top.pageCount) setTotalPages(String(top.pageCount));
              if (top.publisher) setPublisher(top.publisher);
              if (top.publishedYear) setPublishedYear(String(top.publishedYear));
              if (top.description) setDescription(top.description);
              if (top.coverUrl) setCoverUri(top.coverUrl);
              if (top.isbn) setIsbn(top.isbn);
              if (top.subjects?.[0]) setGenre(top.subjects[0]);
            },
          },
        ]
      );
    } catch (e) {
      logger.error("[book] title search failed", e);
      Alert.alert("Search unavailable", "Could not search catalogues right now.");
    } finally {
      setLookingUp(false);
    }
  }

  async function onSave() {
    if (titleError) {
      Alert.alert("Missing title", titleError);
      return;
    }
    if (totalPagesError) {
      Alert.alert("Invalid total pages", totalPagesError);
      return;
    }

    const ratingValue = rating.trim() ? Number(rating) : null;
    if (ratingValue != null && (ratingValue < 0 || ratingValue > 5 || Number.isNaN(ratingValue))) {
      Alert.alert("Invalid rating", "Rating must be between 0 and 5.");
      return;
    }

    setSaving(true);
    try {
      const year = publishedYear.trim() ? Number(publishedYear) : null;
      const payload = {
        title: title.trim(),
        author: author.trim(),
        totalPages: totalPages ? totalPagesNumber : 0,
        status,
        format,
        ownership,
        isbn: isbn.trim() || null,
        genre: genre.trim() || null,
        publisher: publisher.trim() || null,
        publishedYear: year != null && Number.isFinite(year) ? year : null,
        description: description.trim() || null,
        coverUri: coverUri.trim() || null,
        rating: ratingValue,
      };

      let savedId = bookId;
      if (isEdit) {
        const result = await updateBook(bookId!, payload);
        if (!result) {
          Alert.alert("Not found", "That book no longer exists.");
          return;
        }
      } else {
        savedId = createId("book");
        await createBook({
          id: savedId,
          currentPage: 0,
          ...payload,
        });
        await trackEvent("book_added");
      }
      if (savedId) await setBookTagsFromNames(savedId, tagNames);
      successHaptic();
      navigation.goBack();
    } catch (e) {
      logger.error("[book] save failed", e);
      Alert.alert("Error", "Could not save the book.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text style={{ color: colors.inkMuted }}>Loading…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.paper }}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <ScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }} keyboardShouldPersistTaps="handled">
        <TextField label="Title *" value={title} onChangeText={setTitle} error={titleError} autoCapitalize="sentences" />
        <Button label="Search catalogues" variant="secondary" loading={lookingUp} onPress={onSearchTitle} />

        <TextField label="Author" value={author} onChangeText={setAuthor} autoCapitalize="words" />
        <TextField
          label="Total pages"
          value={totalPages}
          onChangeText={setTotalPages}
          error={totalPagesError}
          keyboardType={Platform.select({ ios: "number-pad", android: "numeric" })}
        />
        <TextField label="ISBN" value={isbn} onChangeText={setIsbn} autoCapitalize="characters" />
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Button label="Look up ISBN" variant="secondary" loading={lookingUp} onPress={onLookupIsbn} />
          </View>
          {!isEdit ? (
            <View style={{ flex: 1 }}>
              <Button
                label="Scan barcode"
                variant="secondary"
                onPress={() => navigation.navigate("BarcodeScan")}
              />
            </View>
          ) : null}
        </View>

        <Text style={[typography.label, { color: colors.ink }]}>Status</Text>
        <View style={styles.row}>
          {BOOK_STATUSES.map((s) => (
            <Chip key={s} label={statusLabel(s)} selected={status === s} onPress={() => setStatus(s)} />
          ))}
        </View>

        <Text style={[typography.label, { color: colors.ink }]}>Format</Text>
        <View style={styles.row}>
          {BOOK_FORMATS.map((f) => (
            <Chip
              key={f}
              label={f === "ebook" ? "Ebook" : f[0]!.toUpperCase() + f.slice(1)}
              selected={format === f}
              onPress={() => setFormat(f)}
            />
          ))}
        </View>

        <Text style={[typography.label, { color: colors.ink }]}>Ownership</Text>
        <View style={styles.row}>
          {OWNERSHIP_TYPES.map((o) => (
            <Chip
              key={o}
              label={o[0]!.toUpperCase() + o.slice(1)}
              selected={ownership === o}
              onPress={() => setOwnership(o)}
            />
          ))}
        </View>

        <TextField label="Genre" value={genre} onChangeText={setGenre} />
        <TextField label="Publisher" value={publisher} onChangeText={setPublisher} />
        <TextField
          label="Published year"
          value={publishedYear}
          onChangeText={setPublishedYear}
          keyboardType={Platform.select({ ios: "number-pad", android: "numeric" })}
        />
        <TextField
          label="Rating (0–5)"
          value={rating}
          onChangeText={setRating}
          keyboardType={Platform.select({ ios: "decimal-pad", android: "numeric" })}
        />
        <TextField
          label="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          style={{ minHeight: 90, textAlignVertical: "top" }}
        />

        <TagEditor
          value={tagNames}
          suggestions={tagSuggestions}
          onChange={setTagNames}
        />

        <Button label={saving ? "Saving…" : "Save"} loading={saving} onPress={onSave} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
