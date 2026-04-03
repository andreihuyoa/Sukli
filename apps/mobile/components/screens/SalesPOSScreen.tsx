import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppIcon } from "@/components/ui/AppIcon";
import { Entrance } from "@/components/animation/Entrance";
import { AppHeader } from "@/components/ui/AppHeader";
import { ImageWithFallback } from "@/components/media/ImageWithFallback";

type Product = {
  id: number;
  name: string;
  variant: string;
  price: number;
  status: "in-stock" | "low";
  category: string;
  image: string;
};

const products: Product[] = [
  {
    id: 1,
    name: "Wild Highland Honey",
    variant: "500ml Artisanal Jar",
    price: 850,
    status: "in-stock",
    category: "Fresh Harvest",
    image: "https://images.unsplash.com/photo-1584389344735-f73aa9678f6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  },
  {
    id: 2,
    name: "Heritage Sourdough",
    variant: "Whole Grain Loaf",
    price: 320,
    status: "low",
    category: "Artisanal Grains",
    image: "https://images.unsplash.com/photo-1767065888075-59d3bf3f02d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  },
  {
    id: 3,
    name: "Cold-Pressed Olive Oil",
    variant: "250ml Extra Virgin",
    price: 1200,
    status: "in-stock",
    category: "Bottled Oils",
    image: "https://images.unsplash.com/photo-1707827914998-0d56ee13c161?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  },
  {
    id: 4,
    name: "Smoked Sea Salt",
    variant: "100g Bamboo Tin",
    price: 450,
    status: "in-stock",
    category: "Ferments",
    image: "https://images.unsplash.com/photo-1591272216626-b09e38519371?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  },
  {
    id: 5,
    name: "Cold Brew Reserve",
    variant: "Craft Brewed 500ml",
    price: 180,
    status: "low",
    category: "Fresh Harvest",
    image: "https://images.unsplash.com/photo-1702647104850-64f1c3ccf549?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  },
  {
    id: 6,
    name: "Dark Cacao Bars",
    variant: "70% Premium Single Origin",
    price: 285,
    status: "in-stock",
    category: "Artisanal Grains",
    image: "https://images.unsplash.com/photo-1735504645719-92a09b6ea365?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  },
];

const categories = ["All Items", "Artisanal Grains", "Fresh Harvest", "Ferments", "Bottled Oils"] as const;

type CartItem = {
  product: Product;
  qty: number;
};

function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  const add = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) => (i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const remove = (id: number) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === id);
      if (!existing) return prev;
      if (existing.qty > 1) {
        return prev.map((i) => (i.product.id === id ? { ...i, qty: i.qty - 1 } : i));
      }
      return prev.filter((i) => i.product.id !== id);
    });
  };

  const clear = () => setItems([]);

  const qty = (id: number) => items.find((i) => i.product.id === id)?.qty ?? 0;

  const total = items.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);
  const tax = total * 0.12;

  return { items, add, remove, clear, qty, total, tax, count };
}

const GLASS = {
  backgroundColor: "rgba(255,255,255,0.82)",
};

const HEADER_BODY = 56;
const TAB_BAR = 88;

export function SalesPOSScreen() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]>("All Items");
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutDone, setCheckoutDone] = useState(false);

  const cart = useCart();
  const insets = useSafeAreaInsets();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchCat = activeCategory === "All Items" || p.category === activeCategory;
      const matchQ = !q || p.name.toLowerCase().includes(q) || p.variant.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [activeCategory, query]);

  const handleCheckout = () => {
    if (cart.count <= 0) return;
    setCheckoutDone(true);
    setTimeout(() => {
      cart.clear();
      setCartOpen(false);
      setCheckoutDone(false);
    }, 1800);
  };

  return (
    <View className="flex-1" style={{ backgroundColor: "#f2f2f7" }}>
      <AppHeader />

      <FlashList
        data={filtered}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + HEADER_BODY + 8,
          paddingBottom: TAB_BAR + insets.bottom + 140,
          paddingHorizontal: 16,
        }}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={
          <View>
            <View className="px-1 pt-1 pb-3">
              <Text className="text-xs font-label font-bold uppercase tracking-widest" style={{ color: "#8e8e93", fontWeight: 600 }}>
                Point of Sale
              </Text>
              <Text style={{ color: "#1b4332", fontSize: 30, fontWeight: "900", letterSpacing: -0.2, lineHeight: 34 }}>
                Register Sales
              </Text>
            </View>

            <Entrance delayMs={40}>
              <View
                className="flex-row items-center rounded-2xl px-4 py-3"
                style={{
                  ...GLASS,
                  borderRadius: 16,
                }}
              >
                <AppIcon name="search" size={15} color="#8e8e93" strokeWidth={2} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search inventory, categories or SKUs..."
                  placeholderTextColor="#8e8e93"
                  className="flex-1 bg-transparent text-sm font-body"
                  style={{ color: "#1c1c1e", fontWeight: "500", marginLeft: 8 }}
                />
              </View>
            </Entrance>

            <View className="mt-4 mb-3" style={{ paddingHorizontal: 2 }}>
              <ScrollCategories
                categories={categories as readonly string[]}
                active={activeCategory}
                onChange={(c) => setActiveCategory(c as (typeof categories)[number])}
              />
            </View>
          </View>
        }
        renderItem={({ item, index }) => <ProductCard product={item} index={index} cart={cart} />}
      />

      {cart.count > 0 && !cartOpen ? (
        <View
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            bottom: TAB_BAR + insets.bottom + 4,
            backgroundColor: "#2d6a4f",
            borderRadius: 14,
            paddingHorizontal: 14,
            paddingVertical: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View className="flex-row items-center gap-2">
            <View className="h-7 w-7 rounded-full items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
              <Text style={{ color: "#fff", fontWeight: "900", fontSize: 12 }}>{cart.count}</Text>
            </View>
            <View>
              <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 10, fontWeight: "600" }}>
                {cart.count} item{cart.count !== 1 ? "s" : ""}
              </Text>
              <Text style={{ color: "#fff", fontSize: 14, fontWeight: "900" }}>₱{cart.total.toLocaleString("en-PH")}</Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View cart"
            onPress={() => setCartOpen(true)}
            className="flex-row items-center gap-2 px-4 py-2 rounded-xl"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            <AppIcon name="cart" size={14} color="#fff" strokeWidth={2.5} />
            <Text style={{ color: "#fff", fontWeight: "900", fontSize: 13 }}>View Cart</Text>
          </Pressable>
        </View>
      ) : null}

      {cartOpen ? (
        <Entrance delayMs={30} fromY={18}>
          <View className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.12)", zIndex: 50 }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close cart"
              onPress={() => setCartOpen(false)}
              style={{ flex: 1 }}
            />

            <View
              style={{
                backgroundColor: "rgba(248,250,248,0.98)",
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                paddingHorizontal: 20,
                paddingTop: 10,
                paddingBottom: 120 + insets.bottom,
              }}
            >
              <View className="items-center pt-2 pb-4">
                <View style={{ width: 40, height: 4, borderRadius: 10, backgroundColor: "rgba(0,0,0,0.15)" }} />
              </View>

              <View className="flex-row items-center justify-between mb-4">
                <View>
                  <Text style={{ color: "#1b4332", fontSize: 22, fontWeight: "900", letterSpacing: -0.2 }}>Current Order</Text>
                  <Text style={{ color: "#8e8e93", fontWeight: "500", fontSize: 12 }}>
                    {cart.count} item{cart.count !== 1 ? "s" : ""} in cart
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                  onPress={() => setCartOpen(false)}
                  className="h-10 w-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: "rgba(0,0,0,0.06)" }}
                >
                  <AppIcon name="x" size={16} color="#1c1c1e" strokeWidth={2.5} />
                </Pressable>
              </View>

              <View style={{ gap: 12, marginBottom: 16 }}>
                {cart.items.map((ci) => (
                  <View key={ci.product.id} className="flex-row items-center gap-3">
                    <View className="h-12 w-12 rounded-xl overflow-hidden items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.03)" }}>
                      <ImageWithFallback src={ci.product.image} alt={ci.product.name} style={{ width: "100%", height: "100%" }} />
                    </View>

                    <View className="flex-1 min-w-0">
                      <Text numberOfLines={1} style={{ color: "#1c1c1e", fontWeight: "800", fontSize: 14, fontFamily: "System" }}>
                        {ci.product.name}
                      </Text>
                      <Text style={{ color: "#8e8e93", fontWeight: "500", fontSize: 12 }}>
                        ₱{ci.product.price.toLocaleString("en-PH")} / unit
                      </Text>
                    </View>

                    <View
                      className="flex-row items-center gap-2 px-2 py-1 rounded-full"
                      style={{ backgroundColor: "rgba(27,67,50,0.08)" }}
                    >
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Decrease quantity"
                        onPress={() => cart.remove(ci.product.id)}
                        className="h-7 w-7 rounded-full items-center justify-center"
                        style={{ backgroundColor: "rgba(27,67,50,0.12)" }}
                      >
                        <AppIcon name="remove" size={12} color="#1b4332" strokeWidth={3} />
                      </Pressable>
                      <Text style={{ fontSize: 14, fontWeight: "900", color: "#1b4332", minWidth: 18, textAlign: "center" }}>
                        {ci.qty}
                      </Text>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Increase quantity"
                        onPress={() => cart.add(ci.product)}
                        className="h-7 w-7 rounded-full items-center justify-center"
                        style={{ backgroundColor: "rgba(27,67,50,0.12)" }}
                      >
                        <AppIcon name="add" size={12} color="#1b4332" strokeWidth={3} />
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>

              <View
                className="rounded-2xl p-4 mb-4"
                style={{ backgroundColor: "rgba(255,255,255,0.7)", borderWidth: 1, borderColor: "rgba(0,0,0,0.05)" }}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text style={{ color: "#8e8e93", fontWeight: "500", fontSize: 13 }}>Subtotal</Text>
                  <Text style={{ color: "#1c1c1e", fontWeight: "800", fontSize: 13 }}>₱{cart.total.toLocaleString("en-PH")}</Text>
                </View>
                <View className="flex-row items-center justify-between mb-3">
                  <Text style={{ color: "#8e8e93", fontWeight: "500", fontSize: 13 }}>Tax (12%)</Text>
                  <Text style={{ color: "#1c1c1e", fontWeight: "800", fontSize: 13 }}>₱{cart.tax.toFixed(2)}</Text>
                </View>
                <View className="flex-row items-center justify-between pt-2 border-t" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                  <Text style={{ color: "#1b4332", fontWeight: "900", fontSize: 16 }}>Total Amount</Text>
                  <Text style={{ color: "#1b4332", fontWeight: "900", fontSize: 22 }}>
                    ₱{(cart.total + cart.tax).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Complete sale"
                onPress={handleCheckout}
                className="w-full items-center justify-center py-4 rounded-2xl mb-3"
                style={{
                  backgroundColor: checkoutDone ? "#1b4332" : "#2d6a4f",
                  shadowColor: "#1b4332",
                  shadowOpacity: 0.28,
                  shadowRadius: 10,
                }}
              >
                <View className="flex-row items-center gap-2.5">
                  <AppIcon name="cart" size={18} color="#fff" strokeWidth={2} />
                  <Text style={{ color: "#fff", fontWeight: "900", fontSize: 15 }}>
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
                className="w-full py-3 rounded-2xl items-center"
                style={{ backgroundColor: "transparent" }}
              >
                <Text style={{ color: "#6a3342", fontWeight: "700", fontSize: 14 }}>Cancel & Clear Cart</Text>
              </Pressable>
            </View>
          </View>
        </Entrance>
      ) : null}
    </View>
  );
}

export default SalesPOSScreen;

function ScrollCategories(props: {
  categories: readonly string[];
  active: string;
  onChange: (c: string) => void;
}) {
  const { categories, active, onChange } = props;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 4 }}>
      <View style={{ flexDirection: "row" }}>
        {categories.map((cat) => (
          <Pressable
            key={cat}
            accessibilityRole="button"
            accessibilityLabel={`Filter ${cat}`}
            onPress={() => onChange(cat)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 6,
              borderRadius: 999,
              backgroundColor: active === cat ? "#1b4332" : "rgba(255,255,255,0.82)",
              marginRight: 10,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "900", color: active === cat ? "#fff" : "#1c1c1e" }}>{cat}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

function ProductCard(props: { product: Product; index: number; cart: ReturnType<typeof useCart> }) {
  const { product, index, cart } = props;
  const inCart = cart.qty(product.id);

  return (
    <Entrance delayMs={40 + index * 30}>
      <View
        className="rounded-2xl overflow-hidden"
        style={{
          ...GLASS,
          borderBottomWidth: product.status === "low" ? 3 : 0,
          borderBottomColor: product.status === "low" ? "rgba(106,51,66,0.3)" : "transparent",
          marginBottom: 12,
        }}
      >
        <View className="items-center" style={{ padding: 12 }}>
          <View className="h-24 w-24 rounded-xl overflow-hidden" style={{ backgroundColor: "rgba(0,0,0,0.03)" }}>
            <ImageWithFallback src={product.image} alt={product.name} style={{ width: "100%", height: "100%" }} />
          </View>

          <Text className="mt-3" numberOfLines={1} style={{ color: "#1c1c1e", fontWeight: "800", fontSize: 14 }}>
            {product.name}
          </Text>
          <Text numberOfLines={1} style={{ color: "#8e8e93", fontWeight: "500", fontSize: 12 }}>
            {product.variant}
          </Text>

          <View className="flex-row items-center justify-between w-full mt-3">
            <Text style={{ color: "#1b4332", fontWeight: "900", fontSize: 15 }}>₱{product.price.toLocaleString("en-PH")}</Text>

            {inCart > 0 ? (
              <View className="flex-row items-center gap-2 px-2 py-1 rounded-full" style={{ backgroundColor: "rgba(27,67,50,0.08)" }}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Remove"
                  onPress={() => cart.remove(product.id)}
                  className="h-7 w-7 rounded-full items-center justify-center"
                  style={{ backgroundColor: "rgba(27,67,50,0.12)" }}
                >
                  <AppIcon name="remove" size={12} color="#1b4332" strokeWidth={3} />
                </Pressable>
                <Text style={{ color: "#1b4332", fontWeight: "900", fontSize: 14, minWidth: 18, textAlign: "center" }}>{inCart}</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Add"
                  onPress={() => cart.add(product)}
                  className="h-7 w-7 rounded-full items-center justify-center"
                  style={{ backgroundColor: "#1b4332" }}
                >
                  <AppIcon name="add" size={12} color="#fff" strokeWidth={3} />
                </Pressable>
              </View>
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Add to cart"
                onPress={() => cart.add(product)}
                className="h-12 w-12 rounded-full items-center justify-center"
                style={{ backgroundColor: "rgba(27,67,50,0.12)" }}
              >
                <AppIcon name="add" size={16} color="#1b4332" strokeWidth={2.5} />
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Entrance>
  );
}

