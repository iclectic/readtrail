import React, { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppNavigation } from "./src/navigation";
import { ThemeProvider, palette } from "./src/theme";
import { useAppBootstrap } from "./src/hooks/useAppBootstrap";
import { OnboardingScreen } from "./src/screens/onboarding/OnboardingScreen";
import { AppSettingsProvider, useAppSettings } from "./src/context/AppSettingsContext";
import { AppErrorBoundary } from "./src/components/AppErrorBoundary";

function RootExperience({
  onboardingDismissed,
  setOnboardingDismissed,
}: {
  onboardingDismissed: boolean;
  setOnboardingDismissed: (value: boolean) => void;
}) {
  const { settings, save } = useAppSettings();
  const showOnboarding = !settings.onboardingCompleted && !onboardingDismissed;

  return (
    <ThemeProvider preference={settings.theme} reduceMotion={settings.reduceMotion}>
      <StatusBar style="auto" />
      {showOnboarding ? (
        <OnboardingScreen
          onComplete={async () => {
            await save({ onboardingCompleted: true });
            setOnboardingDismissed(true);
          }}
          onSkip={async () => {
            await save({ onboardingCompleted: true });
            setOnboardingDismissed(true);
          }}
        />
      ) : (
        <AppNavigation />
      )}
      {__DEV__ && showOnboarding ? (
        <Pressable style={styles.devSkip} onPress={() => setOnboardingDismissed(true)}>
          <Text style={styles.devSkipText}>Dev skip</Text>
        </Pressable>
      ) : null}
    </ThemeProvider>
  );
}

export default function App() {
  const [bootAttempt, setBootAttempt] = useState(0);
  const [boundaryKey, setBoundaryKey] = useState(0);
  const bootstrap = useAppBootstrap(bootAttempt);
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);

  if (bootstrap.status === "loading") {
    return (
      <View style={styles.boot} accessibilityLabel="Loading ReadTrail">
        <StatusBar style="dark" />
        <Text style={styles.brand}>ReadTrail</Text>
        <ActivityIndicator color={palette.accent} />
        <Text style={styles.helper}>Preparing your library…</Text>
      </View>
    );
  }

  if (bootstrap.status === "error") {
    return (
      <View style={styles.boot} accessibilityRole="alert">
        <StatusBar style="dark" />
        <Text style={styles.brand}>ReadTrail</Text>
        <Text style={styles.error}>{bootstrap.message}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Try again"
          onPress={() => setBootAttempt((n) => n + 1)}
          style={({ pressed }) => [styles.retry, { opacity: pressed ? 0.88 : 1 }]}
        >
          <Text style={styles.retryLabel}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AppErrorBoundary
        key={boundaryKey}
        onReset={() => setBoundaryKey((n) => n + 1)}
      >
        <AppSettingsProvider initial={bootstrap.settings}>
          <RootExperience
            onboardingDismissed={onboardingDismissed}
            setOnboardingDismissed={setOnboardingDismissed}
          />
        </AppSettingsProvider>
      </AppErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
    backgroundColor: palette.paper,
  },
  brand: {
    fontSize: 32,
    fontWeight: "700",
    color: palette.ink,
    letterSpacing: -0.5,
  },
  helper: { color: palette.inkMuted },
  error: { color: palette.danger, textAlign: "center", lineHeight: 22 },
  retry: {
    marginTop: 8,
    minHeight: 44,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: palette.accent,
    justifyContent: "center",
  },
  retryLabel: {
    color: palette.accentInk,
    fontWeight: "700",
    fontSize: 16,
  },
  devSkip: { position: "absolute", bottom: 24, right: 16, padding: 8 },
  devSkipText: { color: palette.inkSubtle, fontSize: 12 },
});
