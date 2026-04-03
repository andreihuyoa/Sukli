import { router } from "expo-router";
import { SmartRestockScreen } from "@/components/screens/SmartRestockScreen";

export default function SmartRestockRoute() {
  return <SmartRestockScreen onBackPress={() => router.back()} />;
}
