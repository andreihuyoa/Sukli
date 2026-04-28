import * as ImagePicker from "expo-image-picker";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppIcon } from "@/components/ui/AppIcon";
import { getDb } from "@/lib/db/client";
import {
  getCurrentUserId,
  getSetupProfile,
  isSetupComplete,
  saveSetupProfile,
} from "@/lib/db/repositories/setup.repository";

const TOTAL_STEPS = 3;

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ mode?: string }>();
  const isEditMode = params.mode === "edit";
  const [isLoading, setIsLoading] = useState(true);
  const [setupComplete, setSetupComplete] = useState(false);
  const [step, setStep] = useState(1);
  const [storeName, setStoreName] = useState("");
  const [iconUri, setIconUri] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const db = getDb();
    const userId = getCurrentUserId();
    const profile = getSetupProfile(db, userId);

    if (profile) {
      setStoreName(profile.storeName);
      setIconUri(profile.iconUri);
      setDisplayName(profile.displayName);
    }

    setSetupComplete(isSetupComplete(db, userId));
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  if (setupComplete && !isEditMode) {
    return <Redirect href="/(tabs)" />;
  }

  async function pickIcon() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Photo access needed", "Choose an image for your store.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      mediaTypes: ["images"],
      quality: 0.85,
    });

    if (!result.canceled) {
      setIconUri(result.assets[0]?.uri ?? null);
    }
  }

  function goNext() {
    if (step === 1 && !storeName.trim()) {
      Alert.alert("Store name required", "Enter your store name.");
      return;
    }

    setStep((current) => Math.min(current + 1, TOTAL_STEPS));
  }

  async function finishSetup() {
    const db = getDb();
    const userId = getCurrentUserId();

    setIsSaving(true);

    try {
      saveSetupProfile(db, userId, {
        storeName,
        iconUri,
        displayName,
      });
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert(
        "Setup failed",
        error instanceof Error ? error.message : "Unable to save setup."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <View
      className="flex-1 bg-screen-grouped px-5"
      style={{ paddingTop: insets.top + 32, paddingBottom: insets.bottom + 24 }}
    >
      <View className="mb-8">
        <Text className="text-xs font-label font-bold uppercase tracking-[0.18em] text-label-muted">
          Step {step} of {TOTAL_STEPS}
        </Text>
        <Text className="mt-2 text-[32px] font-black leading-9 text-label-primary">
          {isEditMode ? "Update setup" : "Set up Sukli"}
        </Text>
      </View>

      <View className="mb-6 h-2 overflow-hidden rounded-full bg-surface-container">
        <View
          className="h-full rounded-full bg-accent-focus"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        />
      </View>

      <View className="flex-1 justify-center">
        {step === 1 ? (
          <View className="gap-3">
            <Text className="text-[17px] font-body-semibold text-label-primary">
              Store name
            </Text>
            <TextInput
              autoCapitalize="words"
              className="rounded-2xl border border-outline bg-glass-surface px-4 py-4 text-[18px] font-body-semibold text-label-primary"
              onChangeText={setStoreName}
              placeholder="Store name"
              placeholderTextColor="#8a8f87"
              value={storeName}
            />
          </View>
        ) : null}

        {step === 2 ? (
          <View className="gap-3">
            <Text className="text-[17px] font-body-semibold text-label-primary">
              Store icon
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={pickIcon}
              className="h-44 items-center justify-center overflow-hidden rounded-3xl border border-outline bg-glass-surface"
            >
              {iconUri ? (
                <Image source={{ uri: iconUri }} className="h-full w-full" />
              ) : (
                <View className="items-center gap-3">
                  <AppIcon
                    name="photo_library"
                    size={30}
                    className="text-accent-focus"
                  />
                  <Text className="text-[15px] font-body-semibold text-label-primary">
                    Choose image
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
        ) : null}

        {step === 3 ? (
          <View className="gap-3">
            <Text className="text-[17px] font-body-semibold text-label-primary">
              Display name
            </Text>
            <TextInput
              autoCapitalize="words"
              className="rounded-2xl border border-outline bg-glass-surface px-4 py-4 text-[18px] font-body-semibold text-label-primary"
              onChangeText={setDisplayName}
              placeholder="Display name"
              placeholderTextColor="#8a8f87"
              value={displayName}
            />
          </View>
        ) : null}
      </View>

      <View className="flex-row gap-3">
        <Pressable
          accessibilityRole="button"
          disabled={step === 1 || isSaving}
          onPress={() => setStep((current) => Math.max(current - 1, 1))}
          className="flex-1 items-center rounded-2xl border border-outline bg-glass-surface py-4 disabled:opacity-40"
        >
          <Text className="text-[15px] font-body-semibold text-label-primary">
            Back
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={isSaving}
          onPress={step === TOTAL_STEPS ? finishSetup : goNext}
          className="flex-1 items-center rounded-2xl bg-accent-focus py-4 disabled:opacity-40"
        >
          <Text className="text-[15px] font-body-semibold text-white">
            {step === TOTAL_STEPS ? "Finish" : "Next"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
