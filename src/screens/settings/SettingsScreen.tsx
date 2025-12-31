import React, { useMemo, useState } from "react";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as Application from "expo-application";
import { clearAllData, getAllBooks, getAllProgressEntries } from "../../db";
import { lightHaptic, warningHaptic, successHaptic } from "../../utils/haptics";
import { logger } from "../../utils/logger";

export function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [exporting, setExporting] = useState(false);
  const [clearing, setClearing] = useState(false);

  const appVersionText = useMemo(() => {
    const v = Application.nativeApplicationVersion ?? "unknown";
    const b = Application.nativeBuildVersion;
    return b ? `${v} (${b})` : v;
  }, []);

  async function onExport() {
    try {
      setExporting(true);

      const [books, progressEntries] = await Promise.all([
        getAllBooks(),
        getAllProgressEntries(),
      ]);

      const payload = {
        exportedAt: new Date().toISOString(),
        appVersion: appVersionText,
        books,
        progressEntries,
      };

      const json = JSON.stringify(payload, null, 2);
      const fileName = `readtrail-export-${Date.now()}.json`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, json, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert(
          "Sharing not available",
          "Sharing is not available on this device. The file was created in the app cache."
        );
        return;
      }

      await Sharing.shareAsync(fileUri, {
        mimeType: "application/json",
        dialogTitle: "Export your ReadTrail data",
      });
    } catch (e) {
      logger.error("[settings] export failed", e);
      Alert.alert("Export failed", "Could not export your data.");
    } finally {
      setExporting(false);
    }
  }

  function confirmClearData() {
    warningHaptic();
    Alert.alert(
      "Clear All Data",
      "Are you sure you want to delete all your books and progress history? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Everything",
          style: "destructive",
          onPress: handleClearData,
        },
      ]
    );
  }

  async function handleClearData() {
    try {
      setClearing(true);
      await clearAllData();
      successHaptic();
      Alert.alert("Done", "All your data has been deleted.");
    } catch (e) {
      logger.error("[settings] clear data failed", e);
      Alert.alert("Error", "Could not clear your data.");
    } finally {
      setClearing(false);
    }
  }

  function handleRateApp() {
    lightHaptic();
    // Replace these with your actual App Store / Play Store URLs when published
    const iosUrl = "https://apps.apple.com/app/idYOUR_APP_ID";
    const androidUrl = "https://play.google.com/store/apps/details?id=com.iclectic.readtrail";

    // For now, show an alert since the app isn't published yet
    Alert.alert(
      "Rate ReadTrail",
      "The app isn't published yet. Once it's live, this will open the App Store or Play Store.",
      [{ text: "OK" }]
    );

    // When published, uncomment this:
    // const url = Platform.OS === "ios" ? iosUrl : androidUrl;
    // Linking.openURL(url).catch(() => {
    //   Alert.alert("Error", "Could not open the store.");
    // });
  }

  function handleContact() {
    lightHaptic();
    Linking.openURL("mailto:support@readtrail.app?subject=ReadTrail%20Feedback").catch(() => {
      Alert.alert("Error", "Could not open email app.");
    });
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 },
      ]}
    >
      <Text style={styles.title}>Settings</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Export local data</Text>
        <Text style={styles.cardText}>
          This exports your books and progress history to a JSON file.
        </Text>
        <Pressable
          style={[styles.button, exporting ? styles.buttonDisabled : null]}
          onPress={onExport}
          disabled={exporting}
        >
          <Text style={styles.buttonText}>{exporting ? "Exporting…" : "Export JSON"}</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Clear all data</Text>
        <Text style={styles.cardText}>
          Delete all books and progress history from this device.
        </Text>
        <Pressable
          style={[styles.dangerButton, clearing ? styles.buttonDisabled : null]}
          onPress={confirmClearData}
          disabled={clearing}
        >
          <Text style={styles.dangerButtonText}>
            {clearing ? "Clearing…" : "Clear All Data"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Rate this app</Text>
        <Text style={styles.cardText}>
          Enjoying ReadTrail? Leave a review to help others discover it.
        </Text>
        <Pressable style={styles.outlineButton} onPress={handleRateApp}>
          <Text style={styles.outlineButtonText}>Rate on App Store</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Contact & Feedback</Text>
        <Text style={styles.cardText}>
          Have questions or suggestions? We'd love to hear from you.
        </Text>
        <Pressable style={styles.outlineButton} onPress={handleContact}>
          <Text style={styles.outlineButtonText}>Send Feedback</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>App version</Text>
        <Text style={styles.cardText}>{appVersionText}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Privacy</Text>
        <Text style={styles.cardText}>
          Your data stays on your device. This app does not use cloud sync or authentication.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 12 },
  title: { fontSize: 24, fontWeight: "700" },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  cardText: { opacity: 0.8 },
  button: {
    backgroundColor: "#111",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontWeight: "700" },
  dangerButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#B00020",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  dangerButtonText: { color: "#B00020", fontWeight: "700" },
  outlineButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#111",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  outlineButtonText: { color: "#111", fontWeight: "700" },
});