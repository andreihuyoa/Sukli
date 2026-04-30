import { FlashList } from "@shopify/flash-list";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Entrance } from "@/components/animation/Entrance";
import { ImageWithFallback } from "@/components/media/ImageWithFallback";
import { AppIcon } from "@/components/ui/AppIcon";
import { useVendors } from "@/lib/hooks/api/procurement/useVendors";
import type { Supplier, VendorCatalogLine, VendorPriceListRow } from "@/types";

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
    <View className="flex-1 bg-screen-grouped">
      <FlashList
        data={suppliers}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + TOP_CONTENT_INSET,
          paddingBottom: TAB_BAR + insets.bottom + 80,
          paddingHorizontal: 16,
        }}
        keyExtractor={(supplier) => supplier.id}
        ListHeaderComponent={
          <View>
            <Entrance delayMs={40}>
              <View className="mb-[10px] px-1 pb-3 pt-1">
                <Text className="text-xs font-label font-bold uppercase tracking-widest text-label-muted">
                  Supply Chain
                </Text>
                <Text className="text-[30px] font-black leading-[34px] tracking-[-0.2px] text-forest">
                  Vendors & Partners
                </Text>
                <Text className="mt-1 text-[13px] font-body-semibold text-label-muted">
                  Manage your trusted local and regional distributors.
                </Text>
              </View>
            </Entrance>

            <Entrance delayMs={70}>
              <View className="flex-row items-center rounded-2xl border border-outline bg-glass-surface px-4 py-3">
                <AppIcon
                  name="search"
                  size={16}
                  className="text-label-muted"
                  strokeWidth={2}
                />
                <TextInput
                  value={catalogQuery}
                  onChangeText={setCatalogQuery}
                  placeholder="Search catalog or vendor..."
                  placeholderTextColor="#5f675f"
                  className="ml-2 flex-1 bg-transparent text-sm font-body-medium text-label-primary"
                />
              </View>
            </Entrance>

            <Entrance delayMs={110}>
              <View className="mb-[14px] mt-3">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Add supplier"
                  onPress={() => {}}
                  className="w-full flex-row items-center justify-center gap-2 rounded-2xl bg-revenue-hero py-3.5"
                >
                  <AppIcon
                    name="person_add"
                    size={18}
                    className="text-on-primary"
                    strokeWidth={2.5}
                  />
                  <Text className="text-sm font-label font-bold text-on-primary">
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
          <View className="items-center px-2 py-10">
            <Text className="text-center text-sm text-label-muted">
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
    (priceRow) => priceRow.vendorName === supplier.name
  );

  return (
    <View
      className="mb-3 overflow-hidden rounded-2xl border border-outline bg-glass-surface"
      style={{
        borderBottomWidth: supplier.accent ? 3 : 0,
        borderBottomColor: supplier.accent ? "#6a3342" : "transparent",
      }}
    >
      <View className="p-4">
        <View className="mb-4 flex-row items-start justify-between">
          <View className="flex-row items-center gap-3">
            <View className="h-12 w-12 overflow-hidden rounded-xl bg-overlay-soft">
              <ImageWithFallback
                src={supplier.imageUrl}
                alt={supplier.name}
                style={{ width: "100%", height: "100%" }}
              />
            </View>
            <View>
              <Text
                numberOfLines={1}
                className="text-base font-body font-bold tracking-[-0.1px] text-label-primary"
              >
                {supplier.name}
              </Text>
              <Text
                numberOfLines={1}
                className="text-xs font-label font-bold uppercase tracking-[0.1em]"
                style={{ color: supplier.roleColor }}
              >
                {supplier.role}
              </Text>
            </View>
          </View>

          <View className="flex-row gap-2">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Call supplier"
              className="h-10 w-10 items-center justify-center rounded-full bg-forest-alpha-10"
            >
              <AppIcon
                name="call"
                size={16}
                className="text-forest"
                strokeWidth={2.5}
              />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Message supplier"
              className="h-10 w-10 items-center justify-center rounded-full bg-forest-alpha-10"
            >
              <AppIcon
                name="chat"
                size={16}
                className="text-forest"
                strokeWidth={2.5}
              />
            </Pressable>
          </View>
        </View>

        <View className="mb-3 flex-row flex-wrap gap-2">
          {supplier.tags.map((tag) => (
            <View
              key={tag.label}
              className="items-center rounded-full border px-2.5 py-1"
              style={{
                backgroundColor: tag.backgroundColor,
                borderColor: "#d7d2c8",
              }}
            >
              <Text
                className="text-xs font-label font-bold"
                style={{ color: tag.color }}
              >
                {tag.label}
              </Text>
            </View>
          ))}
        </View>

        <View className="rounded-xl border border-outline bg-table-header-bg p-3">
          <Text className="mb-[10px] text-xs font-label font-bold uppercase tracking-[0.1em] text-label-muted">
            Price Catalog
          </Text>
          {expanded ? (
            <View className="gap-[10px]">
              {(catalogMatches.length ? catalogMatches : supplier.catalog)
                .slice(0, 3)
                .map((entry, idx) => (
                  <CatalogRowView key={rowKey(entry, idx)} row={entry} />
                ))}
              <Text className="text-xs font-body-semibold text-label-muted">
                {catalogMatches.length
                  ? `${catalogMatches.length} match(es) in your search`
                  : "Showing featured items"}
              </Text>
            </View>
          ) : (
            <View className="gap-2">
              {supplier.catalog.slice(0, 2).map((catalogItem) => (
                <View
                  key={catalogItem.productName}
                  className="flex-row items-center justify-between"
                >
                  <Text
                    numberOfLines={1}
                    className="text-[13px] font-body-semibold text-label-primary"
                  >
                    {catalogItem.productName}
                  </Text>
                  <Text className="text-[13px] font-label font-bold text-forest">
                    {catalogItem.priceDisplay}
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
          className="mt-3 w-full items-center justify-center rounded-xl border border-outline bg-surface-container py-3"
        >
          <Text className="text-[13px] font-label font-bold text-forest">
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

  return (
    <View className="flex-row items-center justify-between">
      <Text
        className="text-[13px] font-body-semibold text-label-primary"
        numberOfLines={1}
      >
        {row.productName}
      </Text>
      <Text className="text-[13px] font-label font-bold text-forest">
        {row.priceDisplay}
      </Text>
    </View>
  );
}
