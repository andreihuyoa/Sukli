# Dashboard Components

Production-ready components for the Tindahan retail management dashboard.

## Components Overview

### RevenueSummaryCard

Display revenue metrics with optional trend indicators and configurable variants.

```tsx
import { RevenueSummaryCard } from '@/components/dashboard/RevenueSummaryCard';

// Today's Revenue (Primary)
<RevenueSummaryCard
  label="Today's Revenue"
  amount="₱42,850.00"
  trend={{ percentage: 12, direction: "up" }}
  variant="primary"
/>

// Weekly Sales (Secondary)
<RevenueSummaryCard
  label="Weekly Sales"
  amount="₱78,290"
  variant="secondary"
/>

// GCash Revenue (Tertiary)
<RevenueSummaryCard
  label="GCash Revenue"
  amount="₱18,450"
  variant="tertiary"
/>

// With Subtitle
<RevenueSummaryCard
  label="Monthly Target"
  amount="₱850,000"
  subtitle="On track for Q4"
  variant="primary"
/>

// With Negative Trend
<RevenueSummaryCard
  label="Expenses"
  amount="₱24,120"
  trend={{ percentage: 5, direction: "down" }}
  variant="secondary"
/>
```

**Props**:
- `label` (string) - Required. Section label
- `amount` (string) - Required. Main metric value
- `subtitle?` (string) - Optional supporting text
- `trend?` ({ percentage: number, direction: 'up' | 'down' }) - Optional trend indicator
- `variant?` ('primary' | 'secondary' | 'tertiary') - Default: 'primary'

**Colors**:
- **primary**: Green (#386641) - Main metrics
- **secondary**: Light green (#baee99) - Alternative metrics
- **tertiary**: Yellow-green (#4b6500) - Payment/specialty metrics

---

### MetricCard

Compact metric display with icon, label, value, and subtitle.

```tsx
import { MetricCard } from '@/components/dashboard/MetricCard';

// Stock Inventory
<MetricCard
  icon="inventory_2"
  label="Stock"
  value="1,284"
  subtitle="Items in store"
/>

// Profit Estimate
<MetricCard
  icon="payments"
  label="Profit"
  value="₱14,210"
  subtitle="Est. margin 33.1%"
/>

// Custom Colors
<MetricCard
  icon="warning"
  label="Low Stock"
  value="8 Items"
  subtitle="Needs restocking"
  iconColor="#ba1a1a"
  backgroundColor="bg-error-container"
/>

// In Grid Layout
<View className="flex-row gap-3">
  <MetricCard
    icon="inventory_2"
    label="Stock"
    value="1,284"
    subtitle="Items"
  />
  <MetricCard
    icon="payments"
    label="Profit"
    value="₱14,210"
    subtitle="Estimated"
  />
</View>
```

**Props**:
- `icon` (string) - Required. Material Symbol name
- `label` (string) - Required. Metric label
- `value` (string) - Required. Main value
- `subtitle` (string) - Required. Supporting text
- `iconColor?` (string) - Default: '#204e2b'
- `backgroundColor?` (string) - Default: 'bg-surface-container-lowest'

---

### WeeklySalesChart

7-day sales trend visualization with automatic scaling.

```tsx
import { WeeklySalesChart } from '@/components/dashboard/WeeklySalesChart';

// Default (auto-generates sample data)
<WeeklySalesChart />

// Custom Data
<WeeklySalesChart
  data={[
    { day: "Mon", value: 8400 },
    { day: "Tue", value: 6210 },
    { day: "Wed", value: 7290 },
    { day: "Thu", value: 9200 },
    { day: "Fri", value: 7240 },
    { day: "Sat", value: 12900 },
    { day: "Sun", value: 8940, isToday: true },
  ]}
  maxValue={13000}
/>

// With Real-Time Data
const [weeklyData, setWeeklyData] = useState(initialData);

useEffect(() => {
  const interval = setInterval(async () => {
    const data = await fetchWeeklyData();
    setWeeklyData(data);
  }, 30000); // Update every 30 seconds

  return () => clearInterval(interval);
}, []);

<WeeklySalesChart data={weeklyData} />
```

**Props**:
- `data?` (WeeklyData[]) - Array of {day, value, isToday?}
- `maxValue?` (number) - Y-axis maximum for scaling

**Features**:
- Auto-calculates max value from data
- Highlights "today" bar in primary color
- Displays weekly total below chart
- Responsive bar widths

---

### RestockAlerts

Inventory alert list with quick reorder actions.

```tsx
import { RestockAlerts } from '@/components/dashboard/RestockAlerts';

<RestockAlerts
  items={[
    { id: "1", name: "Artisan Mango Jam", unitsLeft: 4 },
    { id: "2", name: "Mountain Arabica (250g)", unitsLeft: 2 },
  ]}
  onQuickReorder={(itemId) => {
    console.log(`Reorder ${itemId}`);
    // Navigate to reorder flow or trigger API
  }}
/>

// With Custom Icons
<RestockAlerts
  items={[
    { 
      id: "1", 
      name: "Coffee Beans", 
      unitsLeft: 3,
      icon: "local_cafe" 
    },
    { 
      id: "2", 
      name: "Sugar", 
      unitsLeft: 1,
      icon: "inventory_2" 
    },
  ]}
  onQuickReorder={handleReorder}
/>

// Connected to API
const handleQuickReorder = async (itemId: string) => {
  try {
    const response = await api.createReorderRequest(itemId);
    showSuccessMessage(`Reorder created: ${response.orderId}`);
  } catch (error) {
    showErrorMessage("Failed to create reorder");
  }
};

<RestockAlerts items={lowStockItems} onQuickReorder={handleQuickReorder} />
```

**Props**:
- `items` (RestockItem[]) - Array of {id, name, unitsLeft, icon?}
- `onQuickReorder?` (callback) - Called with item ID on reorder action

**Item Type**:
```tsx
type RestockItem = {
  id: string;
  name: string;
  unitsLeft: number;
  icon?: string; // Material Symbol name, defaults to inventory_2
};
```

---

### QuickActionButtons

Primary call-to-action buttons with icons and navigation.

```tsx
import { QuickActionButtons } from '@/components/dashboard/QuickActionButtons';
import { router } from 'expo-router';

// Basic Setup
<QuickActionButtons
  actions={[
    {
      icon: "point_of_sale",
      label: "Add Sale",
      onPress: () => router.push("/sales"),
      variant: "primary",
    },
    {
      icon: "add_box",
      label: "Add Product",
      onPress: () => router.push("/inventory"),
      variant: "secondary",
    },
  ]}
/>

// With Custom Handlers
<QuickActionButtons
  actions={[
    {
      icon: "shopping_cart",
      label: "New Order",
      onPress: () => {
        haptics.notificationAsync(HapticTypes.Success);
        router.push("/orders/new");
      },
      variant: "primary",
    },
    {
      icon: "group",
      label: "Customers",
      onPress: () => router.push("/customers"),
      variant: "secondary",
    },
    {
      icon: "trending_up",
      label: "Analytics",
      onPress: () => router.push("/stats"),
      variant: "tertiary",
    },
  ]}
/>

// With Modal Trigger
<QuickActionButtons
  actions={[
    {
      icon: "edit",
      label: "Edit Profile",
      onPress: () => setShowProfileModal(true),
      variant: "secondary",
    },
  ]}
/>
```

**Props**:
- `actions` (ActionButton[]) - Array of action configurations

**Action Type**:
```tsx
type ActionButton = {
  icon: string;
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary'; // default: 'primary'
};
```

---

## Usage Examples

### Complete Dashboard Section
```tsx
export default function DashboardScreen() {
  return (
    <View className="flex-1 bg-background">
      <AppHeader syncPill />
      <ScreenShell>
        {/* Primary KPI */}
        <RevenueSummaryCard
          label="Today's Revenue"
          amount="₱42,850.00"
          trend={{ percentage: 12, direction: "up" }}
          variant="primary"
        />

        {/* Secondary KPIs */}
        <View className="mb-6 flex-row gap-3">
          <View className="flex-1">
            <RevenueSummaryCard
              label="Weekly Sales"
              amount="₱78,290"
              variant="secondary"
            />
          </View>
          <View className="flex-1">
            <RevenueSummaryCard
              label="GCash Revenue"
              amount="₱18,450"
              variant="tertiary"
            />
          </View>
        </View>

        {/* Actions & Metrics */}
        <QuickActionButtons actions={actions} />
        
        <View className="flex-row gap-3">
          <MetricCard icon="inventory_2" label="Stock" value="1,284" subtitle="Items" />
          <MetricCard icon="payments" label="Profit" value="₱14,210" subtitle="Est." />
        </View>

        {/* Charts & Alerts */}
        <WeeklySalesChart />
        <RestockAlerts items={restockItems} />
      </ScreenShell>
    </View>
  );
}
```

---

## Styling & Customization

All components use NativeWind (Tailwind CSS for React Native):

```tsx
// Custom styling example
<View className="rounded-3xl bg-primary-container p-6 shadow-lg">
  {/* Custom styles apply to all child components */}
</View>

// Responsive design
<View className="md:flex-row flex-col gap-3">
  {/* Stacks on mobile, rows on tablet/web */}
</View>
```

---

## Performance Tips

1. **Memoize Static Components**:
   ```tsx
   const MemoizedCard = React.memo(RevenueSummaryCard);
   ```

2. **Use FlatList for Large Lists**:
   ```tsx
   <FlatList
     data={transactions}
     renderItem={({ item }) => <TransactionCard {...item} />}
     keyExtractor={(item) => item.id}
   />
   ```

3. **Lazy Load Charts**:
   ```tsx
   const WeeklySalesChartLazy = React.lazy(() => 
     import('./WeeklySalesChart')
   );
   ```

---

## Accessibility

All components follow Apple's Human Interface Guidelines:

- **Touch Targets**: Minimum 44pt (iOS) / 48pt (Android)
- **Color Contrast**: WCAG AA standard (4.5:1 for text)
- **Semantic Labels**: All buttons have `accessibilityLabel`
- **Haptic Feedback**: Actions trigger haptic feedback on press

```tsx
// Example with accessibility
<QuickActionButtons
  actions={[
    {
      icon: "add_box",
      label: "Add New Sale",
      onPress: () => {
        haptics.notificationAsync(HapticTypes.Success);
        router.push("/sales");
      },
      variant: "primary",
    },
  ]}
/>
```

---

## Color Palette Reference

```
Primary Colors:
- Primary:      #204e2b (Dark Green)
- Primary-Lg:   #386641 (Medium Green)
- Primary-Fx:   #bcefc0 (Light Green)

Secondary:
- Secondary:    #3d6924 (Olive Green)
- Sec-Lg:       #baee99 (Light Lime)

Tertiary:
- Tertiary:     #384c00 (Yellow-Green)
- Tertiary-Lg:  #4b6500 (Green-Gold)

Surfaces:
- Background:   #faf9f9 (Off White)
- Surface:      #faf9f9 (Off White)
- Surface-Lg:   #f4f3f3 (Light Gray)
- Surface-Hg:   #e3e2e2 (Medium Gray)

Semantic:
- Error:        #ba1a1a (Red)
- Success:      #386641 (Green)
```

---

## Need Help?

- **Architecture**: See `DASHBOARD_ARCHITECTURE.md`
- **Icons**: Available Material Symbols at fonts.google.com/icons
- **Tailwind**: Reference at tailwindcss.com/docs

