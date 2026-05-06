import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Entrance } from "@/components/animation/Entrance";
import { ImageWithFallback } from "@/components/media/ImageWithFallback";
import { AppIcon } from "@/components/ui/AppIcon";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { usePosCatalog } from "@/lib/hooks/api/catalog/usePosCatalog";
import { useStoreTaxRate } from "@/lib/hooks/api/store/useStoreTaxRate";
import { POS_ALL_CATEGORY, type PosProduct } from "@/lib/types/api/catalog";

const TAB_BAR = 88;

interface PosCartLine {
  product: PosProduct;
  qty: number;
}

function useCart(taxRate: number) {
  const [items, setItems] = useState<PosCartLine[]>([]);

  const add = (product: PosProduct) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const remove = (id: string) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === id);
      if (!existing) return prev;
      if (existing.qty > 1) {
        return prev.map((item) =>
          item.product.id === id ? { ...item, qty: item.qty - 1 } : item
        );
      }
      return prev.filter((item) => item.product.id !== id);
    });
  };

  const clear = () => setItems([]);
  const qty = (id: string) =>
    items.find((item) => item.product.id === id)?.qty ?? 0;
  const total = items.reduce(
    (sum, item) => sum + item.product.storePricePhp * item.qty,
    0
  );
  const count = items.reduce((sum, item) => sum + item.qty, 0);
  const tax = total * taxRate;

  return { items, add, remove, clear, qty, total, tax, count };
}

export default function SalesPOSScreen() {
  const { products } = usePosCatalog();
  const {
    taxRate,
    isLoading: isTaxLoading,
    error: taxError,
  } = useStoreTaxRate();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] =
    useState<string>(POS_ALL_CATEGORY);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutDone, setCheckoutDone] = useState(false);

  const insets = useSafeAreaInsets();
  const cart = useCart(taxRate ?? Number.NaN);

  const categories = useMemo(() => {
    const unique = [
      ...new Set(products.map((product) => product.category).filter(Boolean)),
    ];
    return [POS_ALL_CATEGORY, ...unique] as const;
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory =
        activeCategory === POS_ALL_CATEGORY ||
        product.category === activeCategory;
      const matchesQuery =
        !q ||
        product.name.toLowerCase().includes(q) ||
        product.variant.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, products, query]);

  const handleCheckout = () => {
    if (cart.count <= 0) return;
    setCheckoutDone(true);
    setTimeout(() => {
      cart.clear();
      setCartOpen(false);
      setCheckoutDone(false);
    }, 1800);
  };

  if (isTaxLoading) {
    return (
      <View className="flex-1 bg-screen-grouped items-center justify-center px-6">
        <Text className="text-sm font-body-medium text-label-muted text-center">
          Loading store tax configuration...
        </Text>
      </View>
    );
  }

  if (taxRate === null || taxError) {
    return (
      <View className="flex-1 bg-screen-grouped px-4 pt-10">
        <View className="rounded-2xl border border-accent-warn-border bg-accent-warn-soft p-4">
          <Text className="text-base font-body-semibold text-label-primary">
            Sales is blocked
          </Text>
          <Text className="mt-1 text-sm font-body text-label-muted">
            {taxError ??
              "Tax configuration is missing. Please update setup before using sales."}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open setup"
            onPress={() =>
              router.push({ pathname: "/onboarding", params: { mode: "edit" } })
            }
            className="mt-4 rounded-xl bg-revenue-hero px-4 py-3 items-center"
          >
            <Text className="text-sm font-label font-bold text-on-primary">
              Open Setup
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-screen-grouped">
      <ScreenShell
        bottomExtra={2}
        scrollable={false}
        withHeaderOffset={false}
        horizontalPadding={0}
      >
        <FlashList
          data={filtered}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 140,
            paddingHorizontal: 16,
          }}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View>
              <View className="px-1 pt-1 pb-3">
                <Text className="text-xs font-label font-bold uppercase tracking-widest text-label-muted">
                  Point of Sale
                </Text>
                <Text className="text-[30px] font-black leading-[34px] tracking-[-0.2px] text-forest">
                  Register Sales
                </Text>
              </View>

              <Entrance delayMs={40}>
                <View className="flex-row items-center rounded-2xl border border-outline bg-glass-surface px-4 py-3">
                  <AppIcon
                    name="search"
                    size={15}
                    className="text-label-muted"
                    strokeWidth={2}
                  />
                  <TextInput
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Search inventory, categories or SKUs..."
                    placeholderTextColor="#5f675f"
                    className="ml-2 flex-1 bg-transparent text-sm font-body-medium text-label-primary"
                  />
                </View>
              </Entrance>

              <View className="mb-3 mt-4 px-0.5">
                <ScrollCategories
                  categories={categories}
                  active={activeCategory}
                  onChange={setActiveCategory}
                />
              </View>
            </View>
          }
          renderItem={({ item, index }) => (
            <ProductCard product={item} index={index} cart={cart} />
          )}
          ListEmptyComponent={
            <View className="items-center px-2 py-8">
              <Text className="text-center text-sm text-label-muted">
                No products loaded. Connect your catalog to sell from the
                register.
              </Text>
            </View>
          }
        />

        {cart.count > 0 && !cartOpen ? (
          <View
            className="flex-row items-center justify-between rounded-[14px] bg-revenue-hero px-[14px] py-3"
            style={{
              position: "absolute",
              left: 16,
              right: 16,
              bottom: TAB_BAR + insets.bottom + 4,
            }}
          >
            <View className="flex-row items-center gap-2">
              <View className="h-7 w-7 items-center justify-center rounded-full bg-hero-cta-ghost">
                <Text className="text-xs font-label font-bold text-on-primary">
                  {cart.count}
                </Text>
              </View>
              <View>
                <Text className="text-[10px] font-body-semibold text-on-hero-muted">
                  {cart.count} item{cart.count !== 1 ? "s" : ""}
                </Text>
                <Text className="text-sm font-label font-bold text-on-primary">
                  ₱{cart.total.toLocaleString("en-PH")}
                </Text>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View cart"
              onPress={() => setCartOpen(true)}
              className="flex-row items-center gap-2 rounded-xl border border-hero-cta-ghost-border bg-hero-cta-ghost px-4 py-2"
            >
              <AppIcon
                name="cart"
                size={14}
                className="text-on-primary"
                strokeWidth={2.5}
              />
              <Text className="text-[13px] font-label font-bold text-on-primary">
                View Cart
              </Text>
            </Pressable>
          </View>
        ) : null}

        {cartOpen ? (
          <Entrance delayMs={30} fromY={18}>
            <View
              className="absolute inset-0"
              style={{ backgroundColor: "rgba(0,0,0,0.12)", zIndex: 50 }}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close cart"
                onPress={() => setCartOpen(false)}
                style={{ flex: 1 }}
              />

              <View
                className="bg-surface px-5 pt-[10px]"
                style={{
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  paddingBottom: 120 + insets.bottom,
                }}
              >
                <View className="items-center pb-4 pt-2">
                  <View className="h-1 w-10 rounded-full bg-overlay-muted" />
                </View>

                <View className="mb-4 flex-row items-center justify-between">
                  <View>
                    <Text className="text-[22px] font-black tracking-[-0.2px] text-forest">
                      Current Order
                    </Text>
                    <Text className="text-xs font-body-medium text-label-muted">
                      {cart.count} item{cart.count !== 1 ? "s" : ""} in cart
                    </Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                    onPress={() => setCartOpen(false)}
                    className="h-10 w-10 items-center justify-center rounded-full border border-outline bg-surface-container"
                  >
                    <AppIcon
                      name="x"
                      size={16}
                      className="text-label-primary"
                      strokeWidth={2.5}
                    />
                  </Pressable>
                </View>

                <View className="mb-4 gap-3">
                  {cart.items.map((line) => (
                    <View
                      key={line.product.id}
                      className="flex-row items-center gap-3"
                    >
                      <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-overlay-soft">
                        <ImageWithFallback
                          src={line.product.imageUrl}
                          alt={line.product.name}
                          style={{ width: "100%", height: "100%" }}
                        />
                      </View>

                      <View className="min-w-0 flex-1">
                        <Text
                          numberOfLines={1}
                          className="text-sm font-body font-bold text-label-primary"
                        >
                          {line.product.name}
                        </Text>
                        <Text className="text-xs font-body-medium text-label-muted">
                          ₱{line.product.storePricePhp.toLocaleString("en-PH")}{" "}
                          / unit
                        </Text>
                      </View>

                      <View className="flex-row items-center gap-2 rounded-full bg-forest-alpha-10 px-2 py-1">
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel="Decrease quantity"
                          onPress={() => cart.remove(line.product.id)}
                          className="h-7 w-7 items-center justify-center rounded-full bg-forest-alpha-14"
                        >
                          <AppIcon
                            name="remove"
                            size={12}
                            className="text-forest"
                            strokeWidth={3}
                          />
                        </Pressable>
                        <Text className="min-w-[18px] text-center text-sm font-label font-bold text-forest">
                          {line.qty}
                        </Text>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel="Increase quantity"
                          onPress={() => cart.add(line.product)}
                          className="h-7 w-7 items-center justify-center rounded-full bg-forest-alpha-14"
                        >
                          <AppIcon
                            name="add"
                            size={12}
                            className="text-forest"
                            strokeWidth={3}
                          />
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </View>

                <View className="mb-4 rounded-2xl border border-outline bg-glass-surface p-4">
                  <View className="mb-2 flex-row items-center justify-between">
                    <Text className="text-[13px] font-body-medium text-label-muted">
                      Subtotal
                    </Text>
                    <Text className="text-[13px] font-body font-bold text-label-primary">
                      ₱{cart.total.toLocaleString("en-PH")}
                    </Text>
                  </View>
                  <View className="mb-3 flex-row items-center justify-between">
                    <Text className="text-[13px] font-body-medium text-label-muted">
                      Tax ({Math.round(taxRate * 100)}%)
                    </Text>
                    <Text className="text-[13px] font-body font-bold text-label-primary">
                      ₱{cart.tax.toFixed(2)}
                    </Text>
                  </View>
                  <View className="flex-row items-center justify-between border-t border-separator pt-2">
                    <Text className="text-base font-label font-bold text-forest">
                      Total Amount
                    </Text>
                    <Text className="text-[22px] font-black text-forest">
                      ₱
                      {(cart.total + cart.tax).toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                      })}
                    </Text>
                  </View>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Complete sale"
                  onPress={handleCheckout}
                  className={`mb-3 w-full items-center justify-center rounded-2xl py-4 ${
                    checkoutDone ? "bg-forest" : "bg-revenue-hero"
                  }`}
                  style={{
                    shadowColor: "#1b4332",
                    shadowOpacity: 0.28,
                    shadowRadius: 10,
                  }}
                >
                  <View className="flex-row items-center gap-2.5">
                    <AppIcon
                      name="cart"
                      size={18}
                      className="text-on-primary"
                      strokeWidth={2}
                    />
                    <Text className="text-[15px] font-label font-bold text-on-primary">
                      {checkoutDone ? "Sale Complete!" : "Complete Sale"}
                    </Text>
                  </View>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Cancel and clear cart"
                  onPress={() => {
                    cart.clear();
                    setCartOpen(false);
                  }}
                  className="w-full items-center rounded-2xl py-3"
                >
                  <Text className="text-sm font-body font-bold text-critical">
                    Cancel & Clear Cart
                  </Text>
                </Pressable>
              </View>
            </View>
          </Entrance>
        ) : null}
      </ScreenShell>
    </View>
  );
}

function ScrollCategories(props: {
  categories: readonly string[];
  active: string;
  onChange: (category: string) => void;
}) {
  const { categories, active, onChange } = props;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingRight: 4 }}
    >
      <View className="flex-row">
        {categories.map((category) => (
          <Pressable
            key={category}
            accessibilityRole="button"
            accessibilityLabel={`Filter ${category}`}
            onPress={() => onChange(category)}
            className={`mr-[10px] rounded-full border px-4 py-1.5 ${
              active === category
                ? "border-revenue-hero bg-revenue-hero"
                : "border-outline bg-glass-surface"
            }`}
          >
            <Text
              className={`text-[13px] font-label font-bold ${
                active === category ? "text-on-primary" : "text-label-primary"
              }`}
            >
              {category}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

type CartApi = ReturnType<typeof useCart>;

function ProductCard(props: {
  product: PosProduct;
  index: number;
  cart: CartApi;
}) {
  const { product, index, cart } = props;
  const inCart = cart.qty(product.id);

  return (
    <Entrance delayMs={40 + index * 30}>
      <View
        className="mb-3 overflow-hidden rounded-2xl border border-outline bg-glass-surface"
        style={{
          borderBottomWidth: product.stockLevel === "low" ? 3 : 0,
          borderBottomColor:
            product.stockLevel === "low" ? "#6a3342" : "transparent",
        }}
      >
        <View className="items-center p-3">
          <View className="h-24 w-24 overflow-hidden rounded-xl bg-overlay-soft">
            <ImageWithFallback
              src={product.imageUrl}
              alt={product.name}
              style={{ width: "100%", height: "100%" }}
            />
          </View>

          <Text
            className="mt-3 text-sm font-body font-bold text-label-primary"
            numberOfLines={1}
          >
            {product.name}
          </Text>
          <Text
            numberOfLines={1}
            className="text-xs font-body-medium text-label-muted"
          >
            {product.variant}
          </Text>

          <View className="mt-3 w-full flex-row items-center justify-between">
            <Text className="text-[15px] font-label font-bold text-forest">
              ₱{product.storePricePhp.toLocaleString("en-PH")}
            </Text>

            {inCart > 0 ? (
              <View className="flex-row items-center gap-2 rounded-full bg-forest-alpha-10 px-2 py-1">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Remove"
                  onPress={() => cart.remove(product.id)}
                  className="h-7 w-7 items-center justify-center rounded-full bg-forest-alpha-14"
                >
                  <AppIcon
                    name="remove"
                    size={12}
                    className="text-forest"
                    strokeWidth={3}
                  />
                </Pressable>
                <Text className="min-w-[18px] text-center text-sm font-label font-bold text-forest">
                  {inCart}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Add"
                  onPress={() => cart.add(product)}
                  className="h-7 w-7 items-center justify-center rounded-full bg-forest"
                >
                  <AppIcon
                    name="add"
                    size={12}
                    className="text-on-primary"
                    strokeWidth={3}
                  />
                </Pressable>
              </View>
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Add to cart"
                onPress={() => cart.add(product)}
                className="h-12 w-12 items-center justify-center rounded-full bg-forest-alpha-14"
              >
                <AppIcon
                  name="add"
                  size={16}
                  className="text-forest"
                  strokeWidth={2.5}
                />
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Entrance>
  );
}
