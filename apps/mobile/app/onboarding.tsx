import * as ImagePicker from "expo-image-picker";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppIcon } from "@/components/ui/AppIcon";
import { getDb } from "@/lib/db/client";
import {
  getCurrentUserId,
  getSetupProfile,
  isSetupComplete,
  saveSetupProfile,
} from "@/lib/db/repositories/setup.repository";

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ mode?: string }>();
  const isEditMode = params.mode === "edit";
  const initialSetupState = useMemo(() => {
    const db = getDb();
    const userId = getCurrentUserId();
    const profile = getSetupProfile(db, userId);

    return {
      setupComplete: isSetupComplete(db, userId),
      storeName: profile?.storeName ?? "",
      iconUri: profile?.iconUri ?? null,
      displayName: profile?.displayName ?? "",
    };
  }, []);
  const isLoading = false;
  const [setupComplete] = useState(initialSetupState.setupComplete);
  const [step, setStep] = useState(1);
  const [storeName, setStoreName] = useState(initialSetupState.storeName);
  const [iconUri, setIconUri] = useState<string | null>(
    initialSetupState.iconUri
  );
  const [displayName, setDisplayName] = useState(initialSetupState.displayName);
  const [isSaving, setIsSaving] = useState(false);

  const lastStep = isEditMode ? 3 : 4;
  const isWelcomeStep = !isEditMode && step === 1;
  const isStoreNameStep = isEditMode ? step === 1 : step === 2;
  const isIconStep = isEditMode ? step === 2 : step === 3;
  const isProfileStep = isEditMode ? step === 3 : step === 4;

  const validateCurrentStep = useCallback((): boolean => {
    if (isWelcomeStep) {
      return true;
    }

    if (isStoreNameStep && !storeName.trim()) {
      Alert.alert("Store name required", "Enter your store name.");
      return false;
    }

    if (isProfileStep) {
      if (!displayName.trim()) {
        Alert.alert("Display name required", "Enter your display name.");
        return false;
      }
    }

    return true;
  }, [displayName, isProfileStep, isStoreNameStep, isWelcomeStep, storeName]);

  const finishSetup = useCallback(async () => {
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
  }, [displayName, iconUri, storeName]);

  const goNext = useCallback(() => {
    if (!validateCurrentStep()) {
      return;
    }

    setStep((current) => Math.min(current + 1, lastStep));
  }, [lastStep, validateCurrentStep]);

  const goBack = useCallback(() => {
    setStep((current) => Math.max(current - 1, 1));
  }, []);

  const handleSwipeForward = useCallback(() => {
    if (isSaving) {
      return;
    }

    if (step === lastStep) {
      if (validateCurrentStep()) {
        void finishSetup();
      }
      return;
    }

    goNext();
  }, [finishSetup, goNext, isSaving, lastStep, step, validateCurrentStep]);

  const handleSwipeBack = useCallback(() => {
    if (isSaving || step === 1) {
      return;
    }

    goBack();
  }, [goBack, isSaving, step]);

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-48, 48])
        .onEnd((event) => {
          if (event.translationX <= -48) {
            runOnJS(handleSwipeForward)();
            return;
          }

          if (event.translationX >= 48) {
            runOnJS(handleSwipeBack)();
          }
        }),
    [handleSwipeBack, handleSwipeForward]
  );

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
    });

    if (!result.canceled) {
      setIconUri(result.assets[0]?.uri ?? null);
    }
  }

  const stepTitle = getOnboardingStepTitle(step, isEditMode);
  const stepDescription = getOnboardingStepDescription(step, isEditMode);

  return (
    <View
      className="flex-1 bg-background px-5"
      style={{ paddingTop: insets.top + 32, paddingBottom: insets.bottom + 24 }}
    >
      <View className="mb-6">
        <Text className="mt-2 font-headline text-[32px] leading-9 text-foreground">
          {stepTitle}
        </Text>
        {stepDescription ? (
          <Text className="mt-2 text-[14px] font-body-medium leading-5 text-muted-foreground">
            {stepDescription}
          </Text>
        ) : null}
      </View>

      <View className="mb-6 h-2 overflow-hidden rounded-full bg-surface">
        <View
          className="h-full rounded-full bg-accent"
          style={{ width: `${(step / lastStep) * 100}%` }}
        />
      </View>

      <GestureDetector gesture={panGesture}>
        <View className="flex-1 justify-center">
          {isWelcomeStep ? (
            <View className="gap-5 rounded-3xl p-2">
              <View className="h-32 w-32 self-center items-center justify-center p-4">
                <Text className="font-headline text-[96px] leading-none text-primary">
                  S
                </Text>
              </View>
              <Text className="font-headline-regular text-[22px] leading-8 text-foreground">
                <Text className="font-headline text-[28px] text-primary">
                  Sukli
                </Text>{" "}
                is your local point of sale companion for inventory, sales, and
                daily store insights—built for Philippine sari-sari stores and
                small businesses.
              </Text>
              <View className="gap-3">
                <View className="flex-row items-start gap-3">
                  <View className="mt-0.5 h-9 w-9 items-center justify-center rounded-2xl border border-border bg-surface">
                    <AppIcon
                      name="inventory_2"
                      size={18}
                      className="text-accent"
                    />
                  </View>
                  <Text className="flex-1 text-[16px] font-body-medium leading-6 text-muted-foreground">
                    Track stock levels and know what needs restocking.
                  </Text>
                </View>
                <View className="flex-row items-start gap-3">
                  <View className="mt-0.5 h-9 w-9 items-center justify-center rounded-2xl border border-border bg-surface">
                    <AppIcon
                      name="receipt_long"
                      size={18}
                      className="text-accent"
                    />
                  </View>
                  <Text className="flex-1 text-[16px] font-body-medium leading-6 text-muted-foreground">
                    Record sales quickly and review how your day is going.
                  </Text>
                </View>
                <View className="flex-row items-start gap-3">
                  <View className="mt-0.5 h-9 w-9 items-center justify-center rounded-2xl border border-border bg-surface">
                    <AppIcon
                      name="smartphone"
                      size={18}
                      className="text-accent"
                    />
                  </View>
                  <Text className="flex-1 text-[16px] font-body-medium leading-6 text-muted-foreground">
                    Keep everything on this device so you can work without a
                    connection.
                  </Text>
                </View>
              </View>
            </View>
          ) : null}

          {isStoreNameStep ? (
            <View className="gap-3">
              <TextInput
                autoCapitalize="sentences"
                className="rounded-2xl border border-border bg-surface px-4 py-4 text-[18px] font-body-semibold text-foreground"
                onChangeText={setStoreName}
                placeholder="Store name"
                placeholderTextColor="#8a8f87"
                value={storeName}
              />
            </View>
          ) : null}

          {isIconStep ? (
            <View className="gap-3">
              <Pressable
                accessibilityRole="button"
                onPress={pickIcon}
                className="h-44 items-center justify-center overflow-hidden rounded-3xl border border-border bg-surface"
              >
                {iconUri ? (
                  <Image source={{ uri: iconUri }} className="h-full w-full" />
                ) : (
                  <View className="items-center gap-3">
                    <AppIcon
                      name="photo_library"
                      size={30}
                      className="text-accent"
                    />
                    <Text className="text-[15px] font-body-semibold text-foreground">
                      Choose image
                    </Text>
                  </View>
                )}
              </Pressable>
            </View>
          ) : null}

          {isProfileStep ? (
            <View className="gap-3">
              <TextInput
                autoCapitalize="words"
                className="rounded-2xl border border-border bg-surface px-4 py-4 text-[18px] font-body-semibold text-foreground"
                onChangeText={setDisplayName}
                placeholder="Display name"
                placeholderTextColor="#8a8f87"
                value={displayName}
              />
            </View>
          ) : null}
        </View>
      </GestureDetector>

      <StepDots
        currentStep={step}
        disabled={isSaving}
        isLastStepComplete={step === lastStep}
        onSelectStep={(targetStep) => {
          if (targetStep < step) {
            setStep(targetStep);
            return;
          }

          if (targetStep === step + 1) {
            if (step === lastStep) {
              if (validateCurrentStep()) {
                void finishSetup();
              }
              return;
            }

            goNext();
            return;
          }

          if (targetStep === lastStep && step === lastStep) {
            if (validateCurrentStep()) {
              void finishSetup();
            }
          }
        }}
        totalSteps={lastStep}
      />

      {/* <Text className="mt-4 text-center text-[12px] font-body-medium text-muted-foreground">
        Swipe left for next · Swipe right to go back
        {step === lastStep ? " · Swipe again to finish" : ""}
      </Text> */}
    </View>
  );
}

type StepDotsProps = {
  currentStep: number;
  totalSteps: number;
  disabled?: boolean;
  isLastStepComplete?: boolean;
  onSelectStep: (step: number) => void;
};

function StepDots({
  currentStep,
  totalSteps,
  disabled = false,
  isLastStepComplete = false,
  onSelectStep,
}: StepDotsProps) {
  return (
    <View className="flex-row items-center justify-center gap-2.5">
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isComplete = stepNumber < currentStep;

        return (
          <Pressable
            key={stepNumber}
            accessibilityRole="button"
            accessibilityLabel={`Step ${stepNumber}`}
            disabled={disabled}
            onPress={() => onSelectStep(stepNumber)}
            className="items-center justify-center rounded-full disabled:opacity-40"
            hitSlop={10}
          >
            <View
              className={`rounded-full ${
                isActive
                  ? "h-2.5 w-8 bg-accent"
                  : isComplete
                    ? "h-2.5 w-2.5 bg-primary"
                    : "h-2.5 w-2.5 bg-outline"
              }`}
            />
          </Pressable>
        );
      })}
      {isLastStepComplete ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Finish setup"
          disabled={disabled}
          onPress={() => onSelectStep(totalSteps)}
          className="ml-1 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 disabled:opacity-40"
        >
          <Text className="text-[11px] font-label uppercase tracking-[0.14em] text-accent">
            Done
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function getOnboardingStepTitle(step: number, isEditMode: boolean): string {
  if (!isEditMode && step === 1) {
    return "Welcome to Sukli";
  }

  if (isEditMode) {
    switch (step) {
      case 1:
        return "Store name";
      case 2:
        return "Store icon";
      case 3:
        return "Display name";
      default:
        return "Setup";
    }
  }

  switch (step) {
    case 2:
      return "Store name";
    case 3:
      return "Store icon";
    case 4:
      return "Display name";
    default:
      return "Setup";
  }
}

function getOnboardingStepDescription(
  step: number,
  isEditMode: boolean
): string | null {
  if (!isEditMode && step === 1) {
    return null;
  }

  if (isEditMode) {
    switch (step) {
      case 1:
        return "Update the name shown on your store profile and reports.";
      case 2:
        return "Choose a square image for your store. You can skip this and add one later.";
      case 3:
        return "Set how you appear on sales and reports.";
      default:
        return null;
    }
  }

  switch (step) {
    case 2:
      return "Start with the name customers recognize on receipts and summaries.";
    case 3:
      return "Choose a square image for your store. You can skip this and add one later.";
    case 4:
      return "Set how you appear on sales and reports.";
    default:
      return null;
  }
}
