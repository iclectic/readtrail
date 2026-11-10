import React, { useMemo, useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Application from "expo-application";
import { clearAllData } from "../../db";
import {
  exportBackupToShareSheet,
  importBackup,
  parseBackupJson,
} from "../../services/backupService";
import { exportLibraryCsv, importLibraryCsv } from "../../services/csvService";
import { exportNotesMarkdown } from "../../services/notesExportService";
import { trackEvent } from "../../services/analyticsEvents";
import { AppText, Button, Chip, TextField } from "../../components";
import { useTheme } from "../../theme";
import { useAppSettings } from "../../context/AppSettingsContext";
import { syncReminderSchedule } from "../../services/reminderService";
import { lightHaptic, warningHaptic, successHaptic } from "../../utils/haptics";
import { logger } from "../../utils/logger";
import type { AppSettings } from "../../domain/types";
import {
  backupReminderCopy,
  shouldPromptBackup,
} from "../../domain/backupReminder";
import type { SettingsStackParamList } from "../../navigation/SettingsStack";
import {
  appStoreUrl,
  playStoreUrl,
  privacyPolicyUrl,
  supportMailto,
} from "../../config/release";
import { seedScreenshotLibrary } from "../../db/seedScreenshot";

export function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<SettingsStackParamList>>();
  const { colors, typography, spacing } = useTheme();
  const { settings, save } = useAppSettings();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [csvBusy, setCsvBusy] = useState(false);
  const [notesBusy, setNotesBusy] = useState(false);

  const appVersionText = useMemo(() => {
    const v = Application.nativeApplicationVersion ?? "1.0.0";
    const b = Application.nativeBuildVersion;
    return b ? `${v} (${b})` : v;
  }, []);

  const showBackupReminder = shouldPromptBackup(settings?.lastBackupAt);

  async function markBackupCompleted() {
    await save({ lastBackupAt: new Date().toISOString() });
  }

  async function onExport() {
    try {
      setExporting(true);
      await exportBackupToShareSheet(appVersionText);
      await markBackupCompleted();
      await trackEvent("export_completed", { format: "json" });
      successHaptic();
    } catch (e) {
      logger.error("[settings] export failed", e);
      Alert.alert(
        "Export failed",
        e instanceof Error ? e.message : "Could not export your data."
      );
    } finally {
      setExporting(false);
    }
  }

  async function onExportCsv() {
    try {
      setCsvBusy(true);
      await exportLibraryCsv();
      await markBackupCompleted();
      await trackEvent("export_completed", { format: "csv" });
      successHaptic();
    } catch (e) {
      Alert.alert(
        "CSV export failed",
        e instanceof Error ? e.message : "Could not export CSV."
      );
    } finally {
      setCsvBusy(false);
    }
  }

  async function onImportCsv() {
    try {
      setCsvBusy(true);
      const picked = await DocumentPicker.getDocumentAsync({
        type: ["text/csv", "text/comma-separated-values", "text/plain", "*/*"],
        copyToCacheDirectory: true,
      });
      if (picked.canceled || !picked.assets?.[0]) return;
      const raw = await FileSystem.readAsStringAsync(picked.assets[0].uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      const result = await importLibraryCsv(raw, "skip_existing");
      await trackEvent("import_completed", { format: "csv", imported: result.imported });
      successHaptic();
      Alert.alert(
        "CSV import complete",
        `Imported ${result.imported} book${result.imported === 1 ? "" : "s"}; skipped ${result.skipped} existing.`
      );
    } catch (e) {
      Alert.alert(
        "CSV import failed",
        e instanceof Error ? e.message : "Could not import this CSV file."
      );
    } finally {
      setCsvBusy(false);
    }
  }

  async function onExportNotes() {
    try {
      setNotesBusy(true);
      await exportNotesMarkdown();
      await markBackupCompleted();
      successHaptic();
    } catch (e) {
      Alert.alert(
        "Notes export failed",
        e instanceof Error ? e.message : "Could not export notes."
      );
    } finally {
      setNotesBusy(false);
    }
  }

  async function onImport() {
    try {
      setImporting(true);
      const picked = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });
      if (picked.canceled || !picked.assets?.[0]) return;

      warningHaptic();
      Alert.alert(
        "Replace local data?",
        "Importing a backup will replace books, progress, notes, goals and settings on this device. This cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Import",
            style: "destructive",
            onPress: async () => {
              try {
                const uri = picked.assets![0]!.uri;
                const raw = await FileSystem.readAsStringAsync(uri, {
                  encoding: FileSystem.EncodingType.UTF8,
                });
                const backup = parseBackupJson(raw);
                const result = await importBackup(backup);
                await trackEvent("import_completed", {
                  format: "json",
                  books: result.books,
                });
                successHaptic();
                Alert.alert(
                  "Import complete",
                  `Restored ${result.books} books, ${result.progressEntries} progress entries, ${result.notes} notes and ${result.sessions} sessions.`
                );
              } catch (e) {
                logger.error("[settings] import failed", e);
                Alert.alert(
                  "Import failed",
                  e instanceof Error ? e.message : "Could not import this file."
                );
              }
            },
          },
        ]
      );
    } catch (e) {
      logger.error("[settings] document picker failed", e);
      Alert.alert("Import unavailable", "Could not open a backup file.");
    } finally {
      setImporting(false);
    }
  }

  function confirmClearData() {
    warningHaptic();
    Alert.alert(
      "Clear all data",
      "Are you sure you want to delete all books, progress, notes, sessions and goals? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete everything",
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
      Alert.alert("Done", "All your local data has been deleted.");
    } catch (e) {
      logger.error("[settings] clear data failed", e);
      Alert.alert("Error", "Could not clear your data.");
    } finally {
      setClearing(false);
    }
  }

  function handleRateApp() {
    lightHaptic();
    const url =
      Platform.OS === "ios" ? appStoreUrl() : Platform.OS === "android" ? playStoreUrl() : null;
    if (!url) {
      Alert.alert(
        "Rate ReadTrail",
        "The app is not published yet. Once the store listing is live, set the IDs in the release config and this button will open the store page.",
        [{ text: "OK" }]
      );
      return;
    }
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Could not open the store page.");
    });
  }

  function handleContact() {
    lightHaptic();
    Linking.openURL(supportMailto()).catch(() => {
      Alert.alert("Error", "Could not open the email app.");
    });
  }

  function handleOpenPrivacyUrl() {
    lightHaptic();
    const url = privacyPolicyUrl();
    if (!url) {
      navigation.navigate("Privacy");
      return;
    }
    Linking.openURL(url).catch(() => {
      navigation.navigate("Privacy");
    });
  }

  async function setTheme(theme: AppSettings["theme"]) {
    await save({ theme });
  }

  async function setDailyReminder(enabled: boolean) {
    const next = await save({ dailyReminderEnabled: enabled });
    const result = await syncReminderSchedule(next);
    if (enabled && !result.ok) {
      await save({ dailyReminderEnabled: false });
      Alert.alert("Reminders unavailable", result.message ?? "Permission was not granted.");
      return;
    }
    if (enabled) {
      await trackEvent("reminder_enabled");
      successHaptic();
      Alert.alert(
        "Daily reminder on",
        `You will get a gentle prompt around ${String(next.dailyReminderHour).padStart(2, "0")}:${String(next.dailyReminderMinute).padStart(2, "0")} each day. Turn it off anytime.`
      );
    }
  }

  async function saveReminderTime(hourText: string, minuteText: string) {
    const hour = Number(hourText);
    const minute = Number(minuteText);
    if (
      !Number.isInteger(hour) ||
      !Number.isInteger(minute) ||
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59
    ) {
      Alert.alert("Invalid time", "Use a 24-hour time such as 20:00.");
      return;
    }
    const next = await save({ dailyReminderHour: hour, dailyReminderMinute: minute });
    if (next.dailyReminderEnabled) {
      const result = await syncReminderSchedule(next);
      if (!result.ok) {
        Alert.alert("Could not update reminder", result.message ?? "Please try again.");
        return;
      }
    }
    successHaptic();
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.paper }}
      contentContainerStyle={{
        paddingTop: insets.top + spacing.md,
        paddingBottom: insets.bottom + spacing.md,
        paddingHorizontal: spacing.md,
        gap: spacing.sm,
      }}
    >
      <Text style={[typography.title, { color: colors.ink }]}>Settings</Text>

      <Card title="Appearance">
        <Text style={[typography.body, { color: colors.inkMuted }]}>
          Choose light, dark, or follow the system setting.
        </Text>
        <View style={styles.row}>
          {(["system", "light", "dark"] as const).map((theme) => (
            <Chip
              key={theme}
              label={theme[0]!.toUpperCase() + theme.slice(1)}
              selected={(settings?.theme ?? "system") === theme}
              onPress={() => void setTheme(theme)}
            />
          ))}
        </View>
      </Card>

      <Card title="Habits">
        <RowSwitch
          label="Streak tracking"
          value={settings?.streakTrackingEnabled ?? true}
          onValueChange={(value) => void save({ streakTrackingEnabled: value })}
        />
        <RowSwitch
          label="Daily reminder"
          value={settings?.dailyReminderEnabled ?? false}
          onValueChange={(value) => void setDailyReminder(value)}
        />
        <Text style={[typography.caption, { color: colors.inkSubtle }]}>
          Optional local notifications only. ReadTrail asks for permission when you enable
          reminders, and you can disable them here at any time.
        </Text>
        <ReminderTimeEditor
          hour={settings?.dailyReminderHour ?? 20}
          minute={settings?.dailyReminderMinute ?? 0}
          onSave={saveReminderTime}
        />
        <RowSwitch
          label="Reduce motion"
          value={settings?.reduceMotion ?? false}
          onValueChange={(value) => void save({ reduceMotion: value })}
        />
      </Card>

      {showBackupReminder ? (
        <Card title="Backup reminder">
          <AppText style={[typography.body, { color: colors.inkMuted }]}>
            {backupReminderCopy(settings?.lastBackupAt)}
          </AppText>
          <Button
            label="Export JSON now"
            variant="secondary"
            loading={exporting}
            onPress={onExport}
          />
        </Card>
      ) : null}

      <Card title="Backup and restore">
        <Text style={[typography.body, { color: colors.inkMuted }]}>
          Export a full JSON backup, CSV library sheet, or Markdown notes. Import restores
          data you previously exported.
        </Text>
        {settings?.lastBackupAt ? (
          <Text style={[typography.caption, { color: colors.inkSubtle }]}>
            Last backup: {new Date(settings.lastBackupAt).toLocaleString("en-GB")}
          </Text>
        ) : null}
        <Button
          label={exporting ? "Exporting…" : "Export JSON"}
          loading={exporting}
          onPress={onExport}
        />
        <Button
          label={importing ? "Importing…" : "Import JSON"}
          variant="secondary"
          loading={importing}
          onPress={onImport}
        />
        <Button
          label={csvBusy ? "Working…" : "Export CSV"}
          variant="secondary"
          loading={csvBusy}
          onPress={onExportCsv}
        />
        <Button
          label="Import CSV"
          variant="secondary"
          loading={csvBusy}
          onPress={onImportCsv}
        />
        <Button
          label={notesBusy ? "Exporting…" : "Export notes (Markdown)"}
          variant="ghost"
          loading={notesBusy}
          onPress={onExportNotes}
        />
      </Card>

      <Card title="Danger zone">
        <Button
          label={clearing ? "Clearing…" : "Clear all data"}
          variant="danger"
          loading={clearing}
          onPress={confirmClearData}
        />
      </Card>

      <Card title="About">
        <Text style={[typography.body, { color: colors.inkMuted }]}>
          Version {appVersionText}
        </Text>
        <Button label="Send feedback" variant="secondary" onPress={handleContact} />
        <Button label="Rate ReadTrail" variant="ghost" onPress={handleRateApp} />
      </Card>

      {__DEV__ ? (
        <Card title="Developer">
          <Text style={[typography.caption, { color: colors.inkSubtle }]}>
            Loads a rich sample library for store screenshots. Only available in development
            builds. Clear data first if the library is not empty and you want a clean demo set.
          </Text>
          <Button
            label="Load screenshot demo library"
            variant="secondary"
            onPress={() => {
              Alert.alert(
                "Load demo library?",
                "Inserts sample books, sessions, notes and goals if the library is empty.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Load",
                    onPress: () => {
                      void (async () => {
                        try {
                          const result = await seedScreenshotLibrary({ onlyIfEmpty: true });
                          if (!result.inserted) {
                            Alert.alert(
                              "Library not empty",
                              `There are already ${result.bookCount} books. Clear all data first, then try again.`
                            );
                            return;
                          }
                          successHaptic();
                          Alert.alert("Demo library ready", "Capture screenshots from Library, Stats and Notes.");
                        } catch (e) {
                          Alert.alert(
                            "Seed failed",
                            e instanceof Error ? e.message : "Could not insert demo data."
                          );
                        }
                      })();
                    },
                  },
                ]
              );
            }}
          />
        </Card>
      ) : null}

      <Card title="Privacy">
        <Text style={[typography.body, { color: colors.inkMuted }]}>
          Your reading data stays on this device unless you export it. Catalogue search is
          optional and only runs when you request it. ReadTrail does not require an account
          for offline use.
        </Text>
        <Button
          label="Read privacy notice"
          variant="secondary"
          onPress={() => navigation.navigate("Privacy")}
        />
        {privacyPolicyUrl() ? (
          <Button
            label="Open privacy policy online"
            variant="ghost"
            onPress={handleOpenPrivacyUrl}
          />
        ) : null}
      </Card>
    </ScrollView>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors, typography, radii, spacing } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          borderColor: colors.line,
          backgroundColor: colors.paperElevated,
          borderRadius: radii.lg,
          padding: spacing.md,
          gap: spacing.sm,
        },
      ]}
    >
      <Text style={[typography.subtitle, { color: colors.ink }]}>{title}</Text>
      {children}
    </View>
  );
}

function RowSwitch({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  const { colors, typography } = useTheme();
  return (
    <View style={styles.switchRow}>
      <Text style={[typography.body, { color: colors.ink, flex: 1 }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        accessibilityLabel={label}
        trackColor={{ true: colors.accent, false: colors.line }}
      />
    </View>
  );
}

function ReminderTimeEditor({
  hour,
  minute,
  onSave,
}: {
  hour: number;
  minute: number;
  onSave: (hour: string, minute: string) => Promise<void>;
}) {
  const [hourText, setHourText] = useState(String(hour));
  const [minuteText, setMinuteText] = useState(String(minute).padStart(2, "0"));

  return (
    <View style={{ gap: 8 }}>
      <TextField
        label="Reminder hour (0–23)"
        value={hourText}
        onChangeText={setHourText}
        keyboardType="number-pad"
      />
      <TextField
        label="Reminder minute (0–59)"
        value={minuteText}
        onChangeText={setMinuteText}
        keyboardType="number-pad"
      />
      <Button
        label="Save reminder time"
        variant="secondary"
        onPress={() => void onSave(hourText, minuteText)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: StyleSheet.hairlineWidth },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
});
