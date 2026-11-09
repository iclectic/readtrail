import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "../../components";
import { useTheme } from "../../theme";
import { t } from "../../i18n";
import { trackEvent } from "../../services/analyticsEvents";

type Props = {
  onComplete: () => void | Promise<void>;
  onSkip: () => void | Promise<void>;
};

export function OnboardingScreen({ onComplete, onSkip }: Props) {
  const insets = useSafeAreaInsets();
  const { colors, typography, spacing } = useTheme();
  const copy = t();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.paper,
          paddingTop: insets.top + spacing.xl,
          paddingBottom: insets.bottom + spacing.lg,
          paddingHorizontal: spacing.lg,
        },
      ]}
    >
      <View style={{ flex: 1, justifyContent: "center", gap: spacing.md }}>
        <Text style={[typography.caption, { color: colors.accent, fontWeight: "700" }]}>
          {copy.appName}
        </Text>
        <Text style={[typography.display, { color: colors.ink }]}>{copy.onboarding.title}</Text>
        <Text style={[typography.body, { color: colors.inkMuted }]}>{copy.onboarding.body}</Text>
        <View style={[styles.points, { gap: spacing.sm }]}>
          <Text style={[typography.body, { color: colors.ink }]}>
            · Track physical books, ebooks and audiobooks
          </Text>
          <Text style={[typography.body, { color: colors.ink }]}>
            · Keep notes, goals and insights offline
          </Text>
          <Text style={[typography.body, { color: colors.ink }]}>
            · Export your library whenever you like
          </Text>
        </View>
      </View>
      <View style={{ gap: spacing.sm }}>
        <Button
          label={copy.onboarding.cta}
          onPress={() => {
            void trackEvent("onboarding_completed");
            void onComplete();
          }}
        />
        <Button
          label={copy.onboarding.skip}
          variant="ghost"
          onPress={() => {
            void trackEvent("onboarding_skipped");
            void onSkip();
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  points: { marginTop: 8 },
});
