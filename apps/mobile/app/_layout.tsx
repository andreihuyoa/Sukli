import { getDb } from "@/lib/db/client";
import { migrations } from "@/lib/db/migrations";
import { ensureDatabaseCompatibility } from "@/lib/db/setup";
import {
  NotoSans_400Regular,
  NotoSans_500Medium,
  NotoSans_600SemiBold,
  NotoSans_700Bold,
  useFonts,
} from "@expo-google-fonts/noto-sans";
import {
  Vollkorn_400Regular,
  Vollkorn_700Bold,
  Vollkorn_800ExtraBold,
} from "@expo-google-fonts/vollkorn";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    NotoSans_400Regular,
    NotoSans_500Medium,
    NotoSans_600SemiBold,
    NotoSans_700Bold,
    Vollkorn_400Regular,
    Vollkorn_700Bold,
    Vollkorn_800ExtraBold,
  });

  // getDb() opens the SQLite file and enables foreign keys; useMigrations()
  // applies any outstanding migration SQL before the first screen renders.
  const db = getDb();
  const { success: dbReady, error: dbError } = useMigrations(db, migrations);
  const [setupReady, setSetupReady] = useState(false);
  const [setupError, setSetupError] = useState<Error | null>(null);

  useEffect(() => {
    if (!dbReady || setupReady || setupError) return;

    try {
      ensureDatabaseCompatibility(db);
      setSetupReady(true);
    } catch (error) {
      setSetupError(error instanceof Error ? error : new Error(String(error)));
    }
  }, [db, dbReady, setupError, setupReady]);

  useEffect(() => {
    if (
      (fontsLoaded || fontError) &&
      ((dbReady && setupReady) || dbError || setupError)
    ) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, dbReady, dbError, setupReady, setupError]);

  const databaseError = dbError ?? setupError;

  // Hard-fail screen for migration errors (shouldn't happen in production but
  // surfaces clearly during development / schema changes).
  if (databaseError) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "red", padding: 16 }}>
          DB setup error: {databaseError.message}
        </Text>
      </View>
    );
  }

  // Keep splash visible while fonts or migrations are pending.
  if ((!fontsLoaded && !fontError) || !dbReady || !setupReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="smart-restock" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
