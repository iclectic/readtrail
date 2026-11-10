import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { palette } from "../theme/tokens";
import { logger } from "../utils/logger";

type Props = {
  children: ReactNode;
  onReset?: () => void;
};

type State = {
  hasError: boolean;
  message: string;
};

/**
 * Catches render errors so a single screen failure does not white-screen the app.
 * Class component required for componentDidCatch.
 */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message || "Something went wrong while rendering the screen.",
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logger.error("[ui] render error", error, info.componentStack);
  }

  private handleReset = () => {
    this.setState({ hasError: false, message: "" });
    this.props.onReset?.();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={styles.wrap} accessibilityRole="alert">
        <Text style={styles.brand}>ReadTrail</Text>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.body}>
          The screen hit an unexpected error. Your library data on this device has not been
          cleared. You can try again or reopen the app.
        </Text>
        <Text style={styles.detail} numberOfLines={4}>
          {this.state.message}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Try again"
          onPress={this.handleReset}
          style={({ pressed }) => [styles.button, { opacity: pressed ? 0.88 : 1 }]}
        >
          <Text style={styles.buttonLabel}>Try again</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
    backgroundColor: palette.paper,
  },
  brand: {
    fontSize: 28,
    fontWeight: "700",
    color: palette.accent,
    letterSpacing: -0.4,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: palette.ink,
  },
  body: {
    color: palette.inkMuted,
    textAlign: "center",
    lineHeight: 22,
  },
  detail: {
    color: palette.inkSubtle,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 18,
  },
  button: {
    marginTop: 8,
    minHeight: 44,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: palette.accent,
    justifyContent: "center",
  },
  buttonLabel: {
    color: palette.accentInk,
    fontWeight: "700",
    fontSize: 16,
  },
});
