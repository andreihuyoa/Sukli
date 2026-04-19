import { FlashList } from "@shopify/flash-list";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Entrance } from "@/components/animation/Entrance";
import { ImageWithFallback } from "@/components/media/ImageWithFallback";
import { AppIcon } from "@/components/ui/AppIcon";
import { useVendors } from "@/hooks/useVendors";
import type { Supplier, VendorCatalogLine, VendorPriceListRow } from "@/types";

const GLASS_BG = "rgba(255,255,255,0.82)";
const TAB_BAR = 88;
const TOP_CONTENT_INSET = 16;

export function VendorsScreen() {
  const insets = useSafeAreaInsets();
  const { suppliers, priceList } = useVendors();
  const [catalogQuery, setCatalogQuery] = useState("");
  const [expandedSupplierId, setExpandedSupplierId] = useState<string | null>(
    null
  );

  const filteredList = useMemo(() => {
    const q = catalogQuery.trim().toLowerCase();
    if (!q) return priceList;
    return priceList.filter(
      (item) =>
        item.productName.toLowerCase().includes(q) ||
        item.vendorName.toLowerCase().includes(q)
    );
  }, [catalogQuery, priceList]);

  return (
    <View className="flex-1" style={{ backgroundColor: "#f2f2f7" }}>
      <FlashList
        data={suppliers}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + TOP_CONTENT_INSET,
          paddingBottom: TAB_BAR + insets.bottom + 80,
          paddingHorizontal: 16,
        }}
        keyExtractor={(s) => s.id}
        ListHeaderComponent={
          <View>
            <Entrance delayMs={40}>
              <View className="px-1 pt-1 pb-3" style={{ marginBottom: 10 }}>
                <Text
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: "#8e8e93" }}
                >
                  Supply Chain
                </Text>
                <Text
                  style={{
                    color: "#1b4332",
                    fontSize: 30,
                    fontWeight: "900",
                    letterSpacing: -0.2,
                    lineHeight: 34,
                  }}
                >
                  Vendors & Partners
                </Text>
                <Text
                  style={{
                    color: "#6b6b6b",
                    fontWeight: "600",
                    fontSize: 13,
                    marginTop: 4,
                  }}
                >
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
                <AppIcon
                  name="search"
                  size={16}
                  color="#8e8e93"
                  strokeWidth={2}
                />
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
                  <AppIcon
                    name="person_add"
                    size={18}
                    color="#fff"
                    strokeWidth={2.5}
                  />
                  <Text
                    style={{ color: "#fff", fontWeight: "900", fontSize: 14 }}
                  >
                    Add Supplier
                  </Text>
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
              onToggle={() =>
                setExpandedSupplierId((prev) =>
                  prev === supplier.id ? null : supplier.id
                )
              }
              filteredList={filteredList}
            />
          </Entrance>
        )}
        ListEmptyComponent={
          <View className="px-2 py-10 items-center">
            <Text className="text-sm text-center" style={{ color: "#8e8e93" }}>
              No vendors yet. Sync suppliers from your back office when
              available.
            </Text>
          </View>
        }
      />
    </View>
  );
}

export default VendorsScreen;

type CatalogRow = VendorPriceListRow | VendorCatalogLine;

function SupplierCard(props: {
  supplier: Supplier;
  expanded: boolean;
  onToggle: () => void;
  filteredList: VendorPriceListRow[];
}) {
  const { supplier, expanded, onToggle, filteredList } = props;
  const catalogMatches = filteredList.filter(
    (p) => p.vendorName === supplier.name
  );

  return (
    <View
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: GLASS_BG,
        borderBottomWidth: supplier.accent ? 3 : 0,
        borderBottomColor: supplier.accent
          ? "rgba(106,51,66,0.3)"
          : "transparent",
        marginBottom: 12,
      }}
    >
      <View style={{ padding: 16 }}>
        <View className="flex-row items-start justify-between mb-4">
          <View className="flex-row items-center gap-3">
            <View
              className="h-12 w-12 rounded-xl overflow-hidden"
              style={{ backgroundColor: "rgba(0,0,0,0.03)" }}
            >
              <ImageWithFallback
                src={supplier.imageUrl}
                alt={supplier.name}
                style={{ width: "100%", height: "100%" }}
              />
            </View>
            <View>
              <Text
                numberOfLines={1}
                style={{
                  color: "#1c1c1e",
                  fontWeight: "900",
                  fontSize: 16,
                  letterSpacing: -0.1,
                }}
              >
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
              <AppIcon
                name="call"
                size={16}
                color="#1b4332"
                strokeWidth={2.5}
              />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Message supplier"
              className="h-10 w-10 rounded-full items-center justify-center"
              style={{ backgroundColor: "rgba(27,67,50,0.08)" }}
            >
              <AppIcon
                name="chat"
                size={16}
                color="#1b4332"
                strokeWidth={2.5}
              />
            </Pressable>
          </View>
        </View>

        <View className="flex-row flex-wrap gap-2" style={{ marginBottom: 12 }}>
          {supplier.tags.map((tag) => (
            <View
              key={tag.label}
              className="rounded-full px-2.5 py-1"
              style={{
                backgroundColor: tag.backgroundColor,
                alignItems: "center",
              }}
            >
              <Text
                style={{ color: tag.color, fontWeight: "900", fontSize: 12 }}
              >
                {tag.label}
              </Text>
            </View>
          ))}
        </View>

        <View
          className="rounded-xl p-3"
          style={{ backgroundColor: "rgba(242,242,247,0.9)" }}
        >
          <Text
            style={{
              color: "#8e8e93",
              fontWeight: "900",
              letterSpacing: 1,
              fontSize: 12,
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            Price Catalog
          </Text>
          {expanded ? (
            <View style={{ gap: 10 }}>
              {(catalogMatches.length ? catalogMatches : supplier.catalog)
                .slice(0, 3)
                .map((entry, idx) => (
                  <CatalogRowView key={rowKey(entry, idx)} row={entry} />
                ))}
              <Text
                style={{ color: "#8e8e93", fontWeight: "600", fontSize: 12 }}
              >
                {catalogMatches.length
                  ? `${catalogMatches.length} match(es) in your search`
                  : "Showing featured items"}
              </Text>
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              {supplier.catalog.slice(0, 2).map((c) => (
                <View
                  key={c.productName}
                  className="flex-row items-center justify-between"
                >
                  <Text
                    numberOfLines={1}
                    style={{
                      color: "#1c1c1e",
                      fontWeight: "700",
                      fontSize: 13,
                    }}
                  >
                    {c.productName}
                  </Text>
                  <Text
                    style={{
                      color: "#1b4332",
                      fontWeight: "900",
                      fontSize: 13,
                    }}
                  >
                    {c.priceDisplay}
                  </Text>
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
          <Text style={{ color: "#1b4332", fontWeight: "900", fontSize: 13 }}>
            {expanded ? "Hide Catalog" : "View Catalog"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function rowKey(entry: CatalogRow, idx: number): string {
  return `${entry.productName}-${idx}`;
}

function CatalogRowView(props: { row: CatalogRow }) {
  const { row } = props;
  const product = row.productName;
  const price = row.priceDisplay;
  return (
    <View className="flex-row items-center justify-between">
      <Text
        style={{ color: "#1c1c1e", fontWeight: "700", fontSize: 13 }}
        numberOfLines={1}
      >
        {product}
      </Text>
      <Text style={{ color: "#1b4332", fontWeight: "900", fontSize: 13 }}>
        {price}
      </Text>
    </View>
  );
}
