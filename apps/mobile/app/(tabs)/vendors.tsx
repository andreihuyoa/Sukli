import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { AppHeader } from "@/components/ui/AppHeader";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { AppIcon } from "@/components/ui/AppIcon";

const SUPPLIERS = [
  {
    id: "1",
    name: "San Miguel Corp.",
    phone: "+63 917 123 4567",
    badge: "Active",
    badgeTone: "tertiary" as const,
    tags: ["Pale Pilsen", "Ginebra San Miguel", "+4 others"],
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB1YKQN7PZbsrV5T5dJFgOHqoMMI45_ZCGNRlc1_Cd84hdlTyAwBSnPLB-wwOIe7Uw5qjdpKXhh_Q-qiHnZVNJrlDHTg0ZldFgmWDeBo3njDuyEd3BB_yD7jhAtQeUe0jdNf-c3u2lanQouqVa9YP6ZgwbjqJ1D3vN5pRhsy0gk5-pmJy7b_oEOt1P4ZSf-i-Z8-E6Ssyi09JX_LTzks6vuazbMLGOlFkU0C-MaiFS-cOXoicsUKSH6w0rRo-QI1Ks2b6rbiwwdl64",
  },
  {
    id: "2",
    name: "Aling Rosa Wholesale",
    phone: "+63 908 987 6543",
    badge: "Daily Delivery",
    badgeTone: "secondary" as const,
    tags: ["Rice 25kg", "Cooking Oil", "+12 others"],
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA_cJIa3rdF1wFGRqfXIKIRdoxhrBNJ2MP4hcVADBrwzYq7msXwPvMmI0J4NcSvhRfD5FiFW0sbJzvUCEYS4RAjErsqC8Fdlpy7UCnsJ2PtMUoVuaaxiCKvXdogCN-YhODWSJjlm9Vzl5827FR_MwcOAwcCw8yHm7PYPqB9u9yw2PsxuAdwJyNfsZ_pBPVowAdnf2PYhnxou_mfCqy3sb_Xw7KfPbwvhkYzw02T2r5j40hHJ7LCfm5G34rZ0hIsPUoGNtFk7yzJFHE",
  },
];

export default function VendorsScreen() {
  return (
    <View className="flex-1 bg-background">
      <AppHeader />
      <ScreenShell>
        <View className="mb-8 flex-row items-end justify-between">
          <View>
            <Text className="mb-1 text-xs font-bold uppercase tracking-widest text-secondary">Supply Chain</Text>
            <Text className="font-headline text-4xl font-extrabold tracking-tight text-on-background">Vendors</Text>
          </View>
          <Pressable className="flex-row items-center gap-2 rounded-full bg-primary px-6 py-4 shadow-lg shadow-primary/20 active:opacity-90">
            <AppIcon name="person_add" size={22} color="#ffffff" />
            <Text className="text-sm font-bold text-white">Add Supplier</Text>
          </Pressable>
        </View>

        <View className="gap-6">
          {SUPPLIERS.map((s) => (
            <View key={s.id} className="gap-4 rounded-xl bg-surface-container-lowest p-6">
              <View className="flex-row items-start justify-between">
                <View className="flex-row gap-4">
                  <View className="h-14 w-14 overflow-hidden rounded-xl bg-surface-variant">
                    <Image
                      source={{ uri: s.image }}
                      style={{ width: 56, height: 56 }}
                      contentFit="cover"
                      accessibilityLabel={s.name}
                    />
                  </View>
                  <View>
                    <Text className="font-headline text-lg font-bold text-on-background">{s.name}</Text>
                    <View className="mt-1 flex-row items-center gap-1">
                      <AppIcon name="call" size={16} color="#414941" />
                      <Text className="text-sm text-on-surface-variant">{s.phone}</Text>
                    </View>
                  </View>
                </View>
                <View className="flex-row gap-2">
                  <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-surface-container-high active:opacity-80">
                    <AppIcon name="call" size={18} color="#204e2b" />
                  </Pressable>
                  <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-surface-container-high active:opacity-80">
                    <AppIcon name="chat" size={18} color="#204e2b" />
                  </Pressable>
                </View>
              </View>
              <View className="rounded-lg bg-surface-container-low/50 p-4">
                <View className="mb-2 flex-row items-center justify-between">
                  <Text className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Top Supplies
                  </Text>
                  <View
                    className={`rounded px-2 py-0.5 ${
                      s.badgeTone === "tertiary" ? "bg-tertiary-fixed" : "bg-secondary"
                    }`}
                  >
                    <Text
                      className={`text-[10px] font-bold ${
                        s.badgeTone === "tertiary" ? "text-on-tertiary-fixed" : "text-white"
                      }`}
                    >
                      {s.badge}
                    </Text>
                  </View>
                </View>
                <View className="flex-row flex-wrap gap-2">
                  {s.tags.map((t) => (
                    <View key={t} className="rounded bg-surface-container-highest px-2 py-1">
                      <Text className="text-[11px] font-medium text-on-surface">{t}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScreenShell>
    </View>
  );
}
