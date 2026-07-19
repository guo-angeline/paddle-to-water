import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ALL_SPOTS } from "@/lib/spots";
import { REGIONS } from "@/lib/types";
import { colors, fonts } from "../theme/tokens";

/**
 * M1 placeholder screen: proves the Metro @/ alias resolves the shared web
 * modules (spots.json via lib/spots) and that the brand fonts render.
 * Replaced by the real Home screen (map + list + filters) in M2.
 */
export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.wordmark}>Paddle to Water</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.count}>{ALL_SPOTS.length} spots</Text>
        <Text style={styles.subtitle}>
          across {REGIONS.length} regions, shared straight from web/data
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  wordmark: {
    fontFamily: fonts.displaySemibold,
    fontSize: 20,
    color: colors.dark,
  },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  count: {
    fontFamily: fonts.displaySemibold,
    fontSize: 44,
    color: colors.accent,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.muted,
  },
});
