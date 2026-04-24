import { StoreProvider } from "@/context/StoreContext";
import { getDb } from "@/lib/db/client";
import { migrations } from "@/lib/db/migrations";
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
import { useEffect } from "react";
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

  useEffect(() => {
    if ((fontsLoaded || fontError) && (dbReady || dbError)) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, dbReady, dbError]);

  // Hard-fail screen for migration errors (shouldn't happen in production but
  // surfaces clearly during development / schema changes).
  if (dbError) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "red", padding: 16 }}>
          DB migration error: {dbError.message}
        </Text>
      </View>
    );
  }

  // Keep splash visible while fonts or migrations are pending.
  if ((!fontsLoaded && !fontError) || !dbReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StoreProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="smart-restock" />
          </Stack>
        </StoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
