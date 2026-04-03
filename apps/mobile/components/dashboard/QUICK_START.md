# Dashboard Components - Quick Start

## 30-Second Overview

The dashboard now consists of **5 reusable components** that build a beautiful, production-ready mobile interface for retail metrics.

## The 5 Components

### 1️⃣ **RevenueSummaryCard**
Display revenue metrics with optional trends.
```tsx
<RevenueSummaryCard
  label="Today's Revenue"
  amount="₱42,850.00"
  trend={{ percentage: 12, direction: "up" }}
  variant="primary"
/>
```
**Variants**: `primary` (green) | `secondary` (light green) | `tertiary` (yellow-green)

---

### 2️⃣ **MetricCard**
Compact metric displays (Stock, Profit, etc).
```tsx
<MetricCard
  icon="inventory_2"
  label="Stock"
  value="1,284"
  subtitle="Items in store"
/>
```
**Use for**: KPIs that need quick reference

---

### 3️⃣ **QuickActionButtons**
Primary CTA buttons for navigation.
```tsx
<QuickActionButtons
  actions={[
    {
      icon: "point_of_sale",
      label: "Add Sale",
      onPress: () => router.push("/sales"),
    },
  ]}
/>
```
**Variants**: `primary` (green) | `secondary` (olive)

---

### 4️⃣ **WeeklySalesChart**
7-day sales trend visualization.
```tsx
<WeeklySalesChart
  data={[
    { day: "Mon", value: 8400 },
    { day: "Fri", value: 7240 },
    { day: "Sun", value: 8940, isToday: true },
  ]}
/>
```
**Features**: Auto-scaling, highlights today, shows weekly total

---

### 5️⃣ **RestockAlerts**
Inventory items needing restock.
```tsx
<RestockAlerts
  items={[
    { id: "1", name: "Coffee", unitsLeft: 3 },
    { id: "2", name: "Sugar", unitsLeft: 1 },
  ]}
  onQuickReorder={(id) => console.log(id)}
/>
```
**Features**: Compact list with quick reorder actions

---

## Complete Dashboard Example

```tsx
export default function DashboardScreen() {
  return (
    <View className="flex-1 bg-background">
      <AppHeader syncPill />
      <ScreenShell>
        {/* 1. Primary Revenue */}
        <RevenueSummaryCard
          label="Today's Revenue"
          amount="₱42,850.00"
          trend={{ percentage: 12, direction: "up" }}
          variant="primary"
        />

        {/* 2. Secondary Metrics */}
        <View className="mb-6 flex-row gap-3">
          <View className="flex-1">
            <RevenueSummaryCard label="Weekly Sales" amount="₱78,290" variant="secondary" />
          </View>
          <View className="flex-1">
            <RevenueSummaryCard label="GCash Revenue" amount="₱18,450" variant="tertiary" />
          </View>
        </View>

        {/* 3. Actions */}
        <QuickActionButtons
          actions={[
            { icon: "point_of_sale", label: "Add Sale", onPress: () => router.push("/sales") },
            { icon: "add_box", label: "Add Product", onPress: () => router.push("/inventory") },
          ]}
        />

        {/* 4. Key Metrics */}
        <View className="flex-row gap-3">
          <MetricCard icon="inventory_2" label="Stock" value="1,284" subtitle="Items" />
          <MetricCard icon="payments" label="Profit" value="₱14,210" subtitle="Est." />
        </View>

        {/* 5. Chart */}
        <WeeklySalesChart data={weeklyData} />

        {/* 6. Alerts */}
        <RestockAlerts items={lowStockItems} onQuickReorder={handleReorder} />
      </ScreenShell>
    </View>
  );
}
```

---

## Common Patterns

### Loading State
```tsx
const { data, isLoading } = useSWR('/api/metrics', fetcher);
return isLoading ? <LoadingSpinner /> : <Dashboard data={data} />;
```

### Error Handling
```tsx
const { data, error } = useSWR('/api/metrics', fetcher);
return error ? <ErrorMessage /> : <Dashboard data={data} />;
```

### Real-Time Updates
```tsx
const { data } = useSWR('/api/metrics', fetcher, {
  refreshInterval: 30000, // Update every 30s
});
```

### Custom Colors
```tsx
<MetricCard
  icon="warning"
  label="Alert"
  value="8"
  subtitle="Items"
  backgroundColor="bg-error-container"
  iconColor="#ba1a1a"
/>
```

---

## Icon Reference

**Available Icons** (from Lucide):
- Navigation: `home`, `arrow_back`
- Commerce: `point_of_sale`, `shopping_bag`, `payments`, `receipt_long`
- Inventory: `inventory_2`, `category`, `package`, `local_shipping`
- Utility: `search`, `filter_list`, `more_vert`, `sync`, `warning`
- Symbols: `trending_up`, `check`, `add_box`, `add`, `remove`

Full list in `/components/ui/AppIcon.tsx`

---

## Styling

All components use **NativeWind** (Tailwind CSS for React Native):

```tsx
// Spacing
gap-3     // 12px between items
p-4       // 16px padding
p-6       // 24px padding
mb-6      // 24px margin-bottom

// Colors
bg-primary         // Green
bg-secondary       // Olive green
bg-tertiary        // Yellow-green
bg-surface-container-lowest  // Off-white
text-on-surface    // Dark text
text-outline       // Medium gray text
```

---

## Performance Tips

```tsx
// ✅ GOOD: Memoized components
const MemoCard = React.memo(MetricCard);

// ✅ GOOD: FlatList for large lists
<FlatList data={transactions} renderItem={renderTx} />

// ❌ BAD: Map in View (inefficient)
<View>{items.map(item => ...)}</View>

// ✅ GOOD: Lazy loading
const ChartLazy = React.lazy(() => import('./Chart'));
```

---

## Colors Cheat Sheet

```
Primary Actions:  bg-primary (dark green)
Secondary:        bg-secondary (olive)
Tertiary:         bg-tertiary (yellow-green)

Backgrounds:      bg-surface-container-lowest (off-white)
Text:             text-on-surface (dark)
Subtle:           text-on-surface-variant (medium gray)

Alerts:           bg-error-container (light red)
Success:          text-primary (green)
```

---

## File Locations

```
📁 apps/mobile/
├── 📁 components/
│   ├── 📁 dashboard/
│   │   ├── RevenueSummaryCard.tsx    ← Primary metrics
│   │   ├── MetricCard.tsx            ← KPI cards
│   │   ├── WeeklySalesChart.tsx      ← Sales trend
│   │   ├── RestockAlerts.tsx         ← Inventory alerts
│   │   ├── QuickActionButtons.tsx    ← CTA buttons
│   │   ├── README.md                 ← Full docs
│   │   └── QUICK_START.md            ← This file
│   └── 📁 ui/
│       ├── AppHeader.tsx
│       ├── ScreenShell.tsx
│       └── AppIcon.tsx
├── 📁 app/
│   └── 📁 (tabs)/
│       └── index.tsx                 ← Home screen
└── DASHBOARD_ARCHITECTURE.md         ← Full architecture
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Icon not showing | Check icon name in `AppIcon.tsx` |
| Colors look wrong | Check Tailwind class names (no typos) |
| Layout broken | Ensure parent has `flex-1` or explicit height |
| Text wrapping | Use `text-pretty` or adjust font size |
| Slow performance | Use `FlatList` instead of `map()` |

---

## Next Steps

1. **Explore Components**: Run `npm run mobile:start` and navigate to dashboard
2. **Read Full Docs**: Check `DASHBOARD_ARCHITECTURE.md`
3. **Customize Data**: Replace hardcoded data with API calls
4. **Add Features**: Create new components following the same pattern

---

## Questions?

- 📖 Full architecture: `DASHBOARD_ARCHITECTURE.md`
- 📚 Component docs: `components/dashboard/README.md`
- 🔄 Migration guide: `MIGRATION_GUIDE.md`
- 💻 Live example: `app/(tabs)/index.tsx`

