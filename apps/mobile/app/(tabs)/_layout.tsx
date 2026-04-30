import { TabsNavigator } from "@/components/navigation/NavigationBar";
import { useSetupGate } from "@/lib/hooks/api/setup/useSetupGate";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function TabsLayout() {
  const setupGate = useSetupGate();

  if (setupGate === "blocked") {
    return <Redirect href="/onboarding" />;
  }

  if (setupGate === "loading") {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  return <TabsNavigator />;
}
