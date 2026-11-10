import React from "react";
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "../../components";
import { privacyPolicyUrl, SUPPORT_EMAIL } from "../../config/release";
import { useTheme } from "../../theme";

const SECTIONS: { title: string; body: string }[] = [
  {
    title: "Summary",
    body: "ReadTrail is an offline-first personal reading companion. Core library, progress, notes, goals and statistics are stored locally on your device in SQLite.",
  },
  {
    title: "Data stored on this device",
    body: "Book metadata you enter or import; reading progress, sessions and notes; goals, achievements and preferences; optional backup files you create; optional local product event counts that never leave the device unless you export files yourself.",
  },
  {
    title: "Network use",
    body: "No account is required for offline reading tracking. If you choose Search catalogues, Look up ISBN, or Scan barcode with online lookup, ReadTrail requests metadata from Open Library. Feedback email opens your mail client and is handled by the operating system.",
  },
  {
    title: "Sharing and export",
    body: "Export creates JSON, CSV or Markdown files you control via the system share sheet. Import replaces or merges local data only after explicit confirmation.",
  },
  {
    title: "Permissions",
    body: "Camera is used only to scan ISBN barcodes. Notifications are used only for an optional daily reading reminder you can disable at any time. Document picker access is used only when you import a backup or CSV.",
  },
  {
    title: "Artificial intelligence",
    body: "ReadTrail does not send your private notes to third-party AI services. Any future AI feature will be optional and will require informed consent before private text leaves the device.",
  },
  {
    title: "Accounts",
    body: "ReadTrail does not create user accounts for core use. There is no cloud account deletion flow because there is no cloud account. Clearing local data is available in Settings.",
  },
  {
    title: "Contact",
    body: SUPPORT_EMAIL,
  },
];

export function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  const { colors, typography, spacing, radii } = useTheme();
  const publicUrl = privacyPolicyUrl();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.paper }}
      contentContainerStyle={{
        paddingTop: spacing.md,
        paddingBottom: insets.bottom + spacing.md,
        paddingHorizontal: spacing.md,
        gap: spacing.sm,
      }}
      accessibilityLabel="Privacy notice"
    >
      <Text style={[typography.title, { color: colors.ink }]}>Privacy notice</Text>
      <Text style={[typography.body, { color: colors.inkMuted }]}>
        This in-app notice mirrors the hostable draft in docs/site/privacy. Host that page
        publicly before store submission, then set PRIVACY_POLICY_URL in the release config.
      </Text>
      {publicUrl ? (
        <Button
          label="Open hosted privacy policy"
          variant="secondary"
          onPress={() => {
            Linking.openURL(publicUrl).catch(() => {
              Alert.alert("Error", "Could not open the privacy policy URL.");
            });
          }}
        />
      ) : null}
      {SECTIONS.map((section) => (
        <View
          key={section.title}
          style={[
            styles.card,
            {
              borderColor: colors.line,
              backgroundColor: colors.paperElevated,
              borderRadius: radii.lg,
              padding: spacing.md,
              gap: spacing.xs,
            },
          ]}
        >
          <Text style={[typography.subtitle, { color: colors.ink }]}>{section.title}</Text>
          <Text style={[typography.body, { color: colors.inkMuted, lineHeight: 22 }]}>
            {section.body}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: StyleSheet.hairlineWidth },
});
