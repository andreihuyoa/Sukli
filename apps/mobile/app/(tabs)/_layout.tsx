import { Tabs } from "expo-router";
import { TindahanTabBar } from "@/components/navigation/TindahanTabBar";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TindahanTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        animation: "shift",
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="sales" options={{ title: "Sales" }} />
      <Tabs.Screen name="inventory" options={{ title: "Stock" }} />
      <Tabs.Screen name="vendors" options={{ title: "Vendors" }} />
      <Tabs.Screen name="stats" options={{ title: "Stats" }} />
    </Tabs>
  );
}
