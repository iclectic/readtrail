import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Chip } from "../ui/Chip";
import { TextField } from "../ui/TextField";
import { Button } from "../ui/Button";
import { useTheme } from "../../theme";
import { parseTagNames } from "../../domain/tags";

type Props = {
  value: string[];
  suggestions?: string[];
  onChange: (tags: string[]) => void;
};

export function TagEditor({ value, suggestions = [], onChange }: Props) {
  const { colors, typography, spacing } = useTheme();
  const [draft, setDraft] = useState("");

  const unusedSuggestions = useMemo(
    () =>
      suggestions.filter(
        (s) => !value.some((v) => v.toLowerCase() === s.toLowerCase())
      ),
    [suggestions, value]
  );

  function addFromDraft() {
    const next = [...value];
    for (const name of parseTagNames(draft)) {
      if (!next.some((v) => v.toLowerCase() === name.toLowerCase())) {
        next.push(name);
      }
    }
    onChange(next);
    setDraft("");
  }

  return (
    <View style={{ gap: spacing.sm }} accessibilityLabel="Book tags">
      <Text style={[typography.label, { color: colors.ink }]}>Tags</Text>
      <View style={styles.row}>
        {value.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            selected
            onPress={() => onChange(value.filter((t) => t !== tag))}
          />
        ))}
      </View>
      <TextField
        label="Add tags (comma separated)"
        value={draft}
        onChangeText={setDraft}
        autoCapitalize="none"
        placeholder="e.g. favourites, classics"
        onSubmitEditing={addFromDraft}
      />
      <Button label="Add tags" variant="secondary" onPress={addFromDraft} />
      {unusedSuggestions.length > 0 ? (
        <View style={styles.row}>
          {unusedSuggestions.slice(0, 8).map((tag) => (
            <Chip
              key={tag}
              label={`+ ${tag}`}
              onPress={() => onChange([...value, tag])}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
