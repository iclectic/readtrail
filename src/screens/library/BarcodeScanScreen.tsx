import React, { useCallback, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { LibraryStackParamList } from "../../types/navigation";
import { lookupBookByIsbn } from "../../services/metadata";
import { Button } from "../../components";
import { useTheme } from "../../theme";
import { successHaptic } from "../../utils/haptics";
import { logger } from "../../utils/logger";

type Props = NativeStackScreenProps<LibraryStackParamList, "BarcodeScan">;

function looksLikeIsbn(value: string): boolean {
  const clean = value.replace(/[^0-9Xx]/g, "");
  return clean.length === 10 || clean.length === 13;
}

export function BarcodeScanScreen({ navigation }: Props) {
  const { colors, typography, spacing } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [busy, setBusy] = useState(false);
  const [torch, setTorch] = useState(false);

  const onBarcode = useCallback(
    async ({ data }: { data: string }) => {
      if (busy) return;
      if (!looksLikeIsbn(data)) return;

      setBusy(true);
      try {
        const isbn = data.replace(/[^0-9Xx]/g, "");
        const { result, errors } = await lookupBookByIsbn(isbn);
        successHaptic();

        if (result) {
          navigation.replace("AddEditBook", {
            prefill: {
              title: result.title,
              author: result.authors.join(", "),
              totalPages: result.pageCount ?? undefined,
              isbn: result.isbn ?? isbn,
              publisher: result.publisher ?? undefined,
              publishedYear: result.publishedYear ?? undefined,
              description: result.description ?? undefined,
              coverUri: result.coverUrl ?? undefined,
              genre: result.subjects?.[0],
            },
          });
          return;
        }

        Alert.alert(
          "ISBN scanned",
          errors[0] ??
            "No catalogue match was found. You can still save the ISBN and fill in the details.",
          [
            {
              text: "Enter manually",
              onPress: () =>
                navigation.replace("AddEditBook", { prefill: { isbn } }),
            },
            {
              text: "Scan again",
              onPress: () => setBusy(false),
            },
          ]
        );
      } catch (e) {
        logger.error("[barcode] lookup failed", e);
        Alert.alert(
          "Lookup unavailable",
          "The ISBN was scanned, but catalogue lookup failed. Continue with manual entry?",
          [
            {
              text: "Manual entry",
              onPress: () =>
                navigation.replace("AddEditBook", {
                  prefill: { isbn: data.replace(/[^0-9Xx]/g, "") },
                }),
            },
            { text: "Try again", onPress: () => setBusy(false) },
          ]
        );
      }
    },
    [busy, navigation]
  );

  if (!permission) {
    return (
      <View style={[styles.center, { backgroundColor: colors.paper }]}>
        <Text style={{ color: colors.inkMuted }}>Checking camera permission…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View
        style={[
          styles.center,
          { backgroundColor: colors.paper, padding: spacing.lg, gap: spacing.md },
        ]}
      >
        <Text style={[typography.title, { color: colors.ink, textAlign: "center" }]}>
          Camera access
        </Text>
        <Text style={[typography.body, { color: colors.inkMuted, textAlign: "center" }]}>
          ReadTrail uses the camera only to scan ISBN barcodes on physical books. Nothing is
          uploaded except the optional catalogue lookup you already use when entering an ISBN.
        </Text>
        <Button label="Allow camera" onPress={() => void requestPermission()} />
        <Button
          label="Enter ISBN manually"
          variant="ghost"
          onPress={() => navigation.replace("AddEditBook")}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torch}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"],
        }}
        onBarcodeScanned={busy ? undefined : onBarcode}
      />
      <View style={[styles.overlay, { padding: spacing.md, gap: spacing.sm }]}>
        <Text style={[typography.bodyStrong, { color: "#fff", textAlign: "center" }]}>
          Align the ISBN barcode inside the frame
        </Text>
        <View style={styles.frame} />
        <Button
          label={torch ? "Torch off" : "Torch on"}
          variant="secondary"
          onPress={() => setTorch((v) => !v)}
        />
        <Button
          label="Enter ISBN manually"
          variant="ghost"
          onPress={() => navigation.replace("AddEditBook")}
        />
        {busy ? (
          <Text style={{ color: "#fff", textAlign: "center" }}>Looking up ISBN…</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  frame: {
    alignSelf: "center",
    width: "80%",
    height: 140,
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 12,
    marginBottom: 24,
  },
});
