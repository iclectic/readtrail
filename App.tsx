import React, { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppNavigation } from "./src/navigation";
import { ThemeProvider, palette } from "./src/theme";
import { useAppBootstrap } from "./src/hooks/useAppBootstrap";
import { OnboardingScreen } from "./src/screens/onboarding/OnboardingScreen";
import { AppSettingsProvider, useAppSettings } from "./src/context/AppSettingsContext";

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
  const bootstrap = useAppBootstrap();
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
      <View style={styles.boot}>
        <StatusBar style="dark" />
        <Text style={styles.brand}>ReadTrail</Text>
        <Text style={styles.error}>{bootstrap.message}</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AppSettingsProvider initial={bootstrap.settings}>
        <RootExperience
          onboardingDismissed={onboardingDismissed}
          setOnboardingDismissed={setOnboardingDismissed}
        />
      </AppSettingsProvider>
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
  devSkip: { position: "absolute", bottom: 24, right: 16, padding: 8 },
  devSkipText: { color: palette.inkSubtle, fontSize: 12 },
});
