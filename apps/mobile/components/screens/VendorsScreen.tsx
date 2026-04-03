import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Entrance } from "@/components/animation/Entrance";
import { AppHeader } from "@/components/ui/AppHeader";
import { AppIcon } from "@/components/ui/AppIcon";
import { ImageWithFallback } from "@/components/media/ImageWithFallback";

type Supplier = {
  id: number;
  name: string;
  role: string;
  roleColor: string;
  image: string;
  tags: { label: string; color: string; bg: string }[];
  catalog: { product: string; price: string }[];
  accent?: boolean;
};

const suppliers: Supplier[] = [
  {
    id: 1,
    name: "Green Harvest Co.",
    role: "Primary Vendor",
    roleColor: "#1b4332",
    image: "https://images.unsplash.com/photo-1769181463790-0c5a2a8fea69?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    tags: [
      { label: "Organic Produce", color: "#1b4332", bg: "rgba(27,67,50,0.1)" },
      { label: "Farm Direct", color: "#1b4332", bg: "rgba(27,67,50,0.1)" },
    ],
    catalog: [
      { product: "Premium Arabica (1kg)", price: "₱420.00" },
      { product: "Organic Kale (bundle)", price: "₱85.00" },
    ],
  },
  {
    id: 2,
    name: "Metro Logistics",
    role: "Dry Goods",
    roleColor: "#3d6924",
    image: "https://images.unsplash.com/photo-1644079446600-219068676743?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    tags: [
      { label: "Pantry Staples", color: "#3d6924", bg: "rgba(61,105,36,0.1)" },
      { label: "Bulk Spirits", color: "#3d6924", bg: "rgba(61,105,36,0.1)" },
    ],
    catalog: [
      { product: "Jasmine Rice (25kg)", price: "₱1,250.00" },
      { product: "Soy Sauce (12×1L)", price: "₱640.00" },
    ],
  },
  {
    id: 3,
    name: "Heritage Grains",
    role: "Contract Pending",
    roleColor: "#6a3342",
    image: "https://images.unsplash.com/photo-1634151942706-adf1d42dc7e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    tags: [
      { label: "Artisan Flour", color: "#6a3342", bg: "rgba(106,51,66,0.1)" },
      { label: "Pastry Supplies", color: "#6a3342", bg: "rgba(106,51,66,0.1)" },
    ],
    catalog: [
      { product: "Cake Flour (10kg)", price: "₱890.00" },
      { product: "Unsalted Butter (5kg)", price: "₱2,100.00" },
    ],
    accent: true,
  },
];

const priceList = [
  { product: "Whole Milk (Case of 12)", vendor: "Metro Logistics", price: "₱1,140.00", minOrder: "5 Cases" },
  { product: "White Sugar (50kg)", vendor: "Green Harvest Co.", price: "₱2,850.00", minOrder: "1 Bag" },
  { product: "Baking Powder (2.5kg)", vendor: "Heritage Grains", price: "₱420.00", minOrder: "10 Units" },
];

const GLASS_BG = "rgba(255,255,255,0.82)";
const HEADER_BODY = 56;
const TAB_BAR = 88;

export function VendorsScreen() {
  const insets = useSafeAreaInsets();
  const [catalogQuery, setCatalogQuery] = useState("");
  const [expandedSupplierId, setExpandedSupplierId] = useState<number | null>(null);

  const filteredList = useMemo(() => {
    const q = catalogQuery.trim().toLowerCase();
    if (!q) return priceList;
    return priceList.filter((item) => item.product.toLowerCase().includes(q) || item.vendor.toLowerCase().includes(q));
  }, [catalogQuery]);

  return (
    <View className="flex-1" style={{ backgroundColor: "#f2f2f7" }}>
      <AppHeader />

      <FlashList
        data={suppliers}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + HEADER_BODY + 8,
          paddingBottom: TAB_BAR + insets.bottom + 80,
          paddingHorizontal: 16,
        }}
        keyExtractor={(s) => String(s.id)}
        ListHeaderComponent={
          <View>
            <Entrance delayMs={40}>
              <View className="px-1 pt-1 pb-3" style={{ marginBottom: 10 }}>
                <Text className="text-xs font-bold uppercase tracking-widest" style={{ color: "#8e8e93" }}>
                  Supply Chain
                </Text>
                <Text style={{ color: "#1b4332", fontSize: 30, fontWeight: "900", letterSpacing: -0.2, lineHeight: 34 }}>
                  Vendors & Partners
                </Text>
                <Text style={{ color: "#6b6b6b", fontWeight: "600", fontSize: 13, marginTop: 4 }}>
                  Manage your trusted local and regional distributors.
                </Text>
              </View>
            </Entrance>

            <Entrance delayMs={70}>
              <View
                className="flex-row items-center rounded-2xl px-4 py-3"
                style={{
                  backgroundColor: GLASS_BG,
                  borderRadius: 16,
                }}
              >
                <AppIcon name="search" size={16} color="#8e8e93" strokeWidth={2} />
                <TextInput
                  value={catalogQuery}
                  onChangeText={setCatalogQuery}
                  placeholder="Search catalog or vendor..."
                  placeholderTextColor="#8e8e93"
                  className="flex-1 bg-transparent text-sm font-body"
                  style={{ color: "#1c1c1e", fontWeight: "500", marginLeft: 8 }}
                />
              </View>
            </Entrance>

            <Entrance delayMs={110}>
              <View style={{ marginTop: 12, marginBottom: 14 }}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Add supplier"
                  onPress={() => {}}
                  className="w-full flex-row items-center justify-center gap-2 py-3.5 rounded-2xl"
                  style={{ backgroundColor: "#1b4332", borderRadius: 16 }}
                >
                  <AppIcon name="person_add" size={18} color="#fff" strokeWidth={2.5} />
                  <Text style={{ color: "#fff", fontWeight: "900", fontSize: 14 }}>Add Supplier</Text>
                </Pressable>
              </View>
            </Entrance>
          </View>
        }
        renderItem={({ item: supplier, index }) => (
          <Entrance delayMs={150 + index * 70}>
            <SupplierCard
              supplier={supplier}
              expanded={expandedSupplierId === supplier.id}
              onToggle={() => setExpandedSupplierId((prev) => (prev === supplier.id ? null : supplier.id))}
              filteredList={filteredList}
            />
          </Entrance>
        )}
      />

      {/* The reference also implies a catalog query, but to keep this port focused on UI,
          we show the filtered result count only inside each supplier’s “View Catalog” section. */}
    </View>
  );
}

export default VendorsScreen;

function SupplierCard(props: {
  supplier: Supplier;
  expanded: boolean;
  onToggle: () => void;
  filteredList: { product: string; vendor: string; price: string; minOrder: string }[];
}) {
  const { supplier, expanded, onToggle, filteredList } = props;
  const catalogMatches = filteredList.filter((p) => p.vendor === supplier.name);

  return (
    <View
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: GLASS_BG,
        borderBottomWidth: supplier.accent ? 3 : 0,
        borderBottomColor: supplier.accent ? "rgba(106,51,66,0.3)" : "transparent",
        marginBottom: 12,
      }}
    >
      <View style={{ padding: 16 }}>
        <View className="flex-row items-start justify-between mb-4">
          <View className="flex-row items-center gap-3">
            <View className="h-12 w-12 rounded-xl overflow-hidden" style={{ backgroundColor: "rgba(0,0,0,0.03)" }}>
              <ImageWithFallback src={supplier.image} alt={supplier.name} style={{ width: "100%", height: "100%" }} />
            </View>
            <View>
              <Text numberOfLines={1} style={{ color: "#1c1c1e", fontWeight: "900", fontSize: 16, letterSpacing: -0.1 }}>
                {supplier.name}
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  color: supplier.roleColor,
                  fontWeight: "900",
                  fontSize: 12,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                {supplier.role}
              </Text>
            </View>
          </View>

          <View className="flex-row gap-2">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Call supplier"
              className="h-10 w-10 rounded-full items-center justify-center"
              style={{ backgroundColor: "rgba(27,67,50,0.08)" }}
            >
              <AppIcon name="call" size={16} color="#1b4332" strokeWidth={2.5} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Message supplier"
              className="h-10 w-10 rounded-full items-center justify-center"
              style={{ backgroundColor: "rgba(27,67,50,0.08)" }}
            >
              <AppIcon name="chat" size={16} color="#1b4332" strokeWidth={2.5} />
            </Pressable>
          </View>
        </View>

        <View className="flex-row flex-wrap gap-2" style={{ marginBottom: 12 }}>
          {supplier.tags.map((tag) => (
            <View
              key={tag.label}
              className="rounded-full px-2.5 py-1"
              style={{ backgroundColor: tag.bg, alignItems: "center" }}
            >
              <Text style={{ color: tag.color, fontWeight: "900", fontSize: 12 }}>{tag.label}</Text>
            </View>
          ))}
        </View>

        <View className="rounded-xl p-3" style={{ backgroundColor: "rgba(242,242,247,0.9)" }}>
          <Text style={{ color: "#8e8e93", fontWeight: "900", letterSpacing: 1, fontSize: 12, textTransform: "uppercase", marginBottom: 10 }}>
            Price Catalog
          </Text>
          {expanded ? (
            <View style={{ gap: 10 }}>
              {(catalogMatches.length ? catalogMatches : supplier.catalog).slice(0, 3).map((entry, idx) => (
                <View key={idx} className="flex-row items-center justify-between">
                  <Text style={{ color: "#1c1c1e", fontWeight: "700", fontSize: 13 }} numberOfLines={1}>
                    {entry.product}
                  </Text>
                  <Text style={{ color: "#1b4332", fontWeight: "900", fontSize: 13 }}>{entry.price}</Text>
                </View>
              ))}
              <Text style={{ color: "#8e8e93", fontWeight: "600", fontSize: 12 }}>
                {catalogMatches.length ? `${catalogMatches.length} match(es) in your search` : "Showing featured items"}
              </Text>
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              {supplier.catalog.slice(0, 2).map((c) => (
                <View key={c.product} className="flex-row items-center justify-between">
                  <Text numberOfLines={1} style={{ color: "#1c1c1e", fontWeight: "700", fontSize: 13 }}>
                    {c.product}
                  </Text>
                  <Text style={{ color: "#1b4332", fontWeight: "900", fontSize: 13 }}>{c.price}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={expanded ? "Hide catalog" : "View catalog"}
          onPress={onToggle}
          className="mt-3 w-full py-3 rounded-xl items-center justify-center"
          style={{ backgroundColor: "rgba(27,67,50,0.08)" }}
        >
          <Text style={{ color: "#1b4332", fontWeight: "900", fontSize: 13 }}>{expanded ? "Hide Catalog" : "View Catalog"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

