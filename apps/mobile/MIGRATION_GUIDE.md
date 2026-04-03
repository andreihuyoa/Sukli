# Dashboard Refactoring Migration Guide

## What Changed

The Tindahan dashboard has been refactored into a production-ready React Native implementation with the following improvements:

### Before
- Monolithic dashboard screen with mixed concerns
- Hardcoded layout without reusable components
- Limited metric visibility (3 cards in a column)
- No clear visual hierarchy
- Difficult to extend with new metrics

### After
- Component-based architecture with 5 reusable dashboard components
- Clear information hierarchy with primary/secondary/tertiary metrics
- Improved mobile-first layout optimized for quick scanning
- Added GCash revenue tracking
- Easy to extend and customize
- Production-ready with accessibility and performance optimizations

## New Component Structure

```
Before (Monolithic):
index.tsx → All dashboard code in one file

After (Modular):
index.tsx → Screen logic
├── RevenueSummaryCard.tsx → Revenue metrics
├── MetricCard.tsx → KPI indicators
├── QuickActionButtons.tsx → Primary actions
├── WeeklySalesChart.tsx → 7-day trends
└── RestockAlerts.tsx → Inventory alerts
```

## Visual Layout Changes

### Old Layout
```
┌──────────────────────────────┐
│ Smart Restock Alert          │ ← Promo
├──────────────────────────────┤
│ Today's Revenue (Large)      │ ← Primary KPI
├──────────────────────────────┤
│ [Add Sale] [Add Product]     │
├──────────────────────────────┤
│ Stock Card (Vertical)        │
├──────────────────────────────┤
│ Profit Card (Vertical)       │
├──────────────────────────────┤
│ Alerts Card (Vertical)       │
├──────────────────────────────┤
│ Weekly Chart (Tall)          │
├──────────────────────────────┤
│ Restock Items (Vertical)     │
├──────────────────────────────┤
│ Transactions (Vertical)      │
└──────────────────────────────┘
```

### New Layout (Optimized)
```
┌──────────────────────────────┐
│ Today's Revenue (Large)      │ ← Primary KPI - First glance
├──────────────────────────────┤
│ Weekly Sales | GCash Revenue │ ← Secondary KPIs - Context
├──────────────────────────────┤
│ [Add Sale] [Add Product]     │ ← Quick Actions
├──────────────────────────────┤
│ Stock  │  Profit             │ ← Key Metrics (Compact)
├──────────────────────────────┤
│ Weekly Sales Trend           │ ← Visualization
├──────────────────────────────┤
│ Restock Alerts               │ ← Action Items
├──────────────────────────────┤
│ Recent Transactions          │ ← Activity Log
└──────────────────────────────┘
```

## Component Imports

Update your imports to use the new components:

```tsx
// Old way (all from index.tsx)
// No imports, everything was inline

// New way (modular)
import { RevenueSummaryCard } from '@/components/dashboard/RevenueSummaryCard';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { QuickActionButtons } from '@/components/dashboard/QuickActionButtons';
import { WeeklySalesChart } from '@/components/dashboard/WeeklySalesChart';
import { RestockAlerts } from '@/components/dashboard/RestockAlerts';
```

## Usage Examples

### Old: Single Revenue Card
```tsx
<View className="relative mb-6 overflow-hidden rounded-[2rem] bg-primary-container p-8">
  <Text className="mb-2 font-label text-xs uppercase">Today's Revenue</Text>
  <Text className="font-headline text-5xl font-extrabold">14,280.50</Text>
  {/* ... hardcoded trend logic */}
</View>
```

### New: Reusable Revenue Card
```tsx
<RevenueSummaryCard
  label="Today's Revenue"
  amount="₱42,850.00"
  trend={{ percentage: 12, direction: "up" }}
  variant="primary"
/>
```

---

## Data Integration Steps

### Step 1: Connect to Backend API

Replace hardcoded data with API calls:

```tsx
// Before (hardcoded)
const RECENT_TRANSACTIONS = [
  { id: "1", title: "3-in-1 Coffee Packs", ... },
  // ...
];

// After (API-connected)
const [transactions, setTransactions] = useState([]);

useEffect(() => {
  const fetchTransactions = async () => {
    const data = await api.getRecentTransactions();
    setTransactions(data);
  };
  fetchTransactions();
}, []);
```

### Step 2: Implement Real-Time Updates

Use SWR or React Query for automatic data sync:

```tsx
import useSWR from 'swr';

export default function DashboardScreen() {
  // Fetch with auto-refresh
  const { data: metrics, isLoading } = useSWR(
    '/api/dashboard/metrics',
    (url) => fetch(url).then(r => r.json()),
    { refreshInterval: 30000 } // Refresh every 30 seconds
  );

  if (isLoading) return <LoadingScreen />;

  return (
    <RevenueSummaryCard
      label="Today's Revenue"
      amount={`₱${metrics.todayRevenue.toLocaleString()}`}
      trend={{ percentage: metrics.trend, direction: "up" }}
    />
  );
}
```

### Step 3: Add Loading & Error States

```tsx
<View className="flex-1">
  {isLoading && <LoadingSpinner />}
  {error && <ErrorMessage message={error.message} />}
  {metrics && (
    <>
      <RevenueSummaryCard {...metrics} />
      {/* ... rest of dashboard */}
    </>
  )}
</View>
```

---

## Extending the Dashboard

### Adding a New Metric

1. **Create component**:
```tsx
// components/dashboard/NewMetricCard.tsx
export function NewMetricCard({ value, label }) {
  return (
    <View className="rounded-3xl bg-primary-container p-6">
      <Text className="text-white">{label}</Text>
      <Text className="text-3xl font-bold text-white">{value}</Text>
    </View>
  );
}
```

2. **Add to dashboard**:
```tsx
import { NewMetricCard } from '@/components/dashboard/NewMetricCard';

export default function DashboardScreen() {
  return (
    <ScreenShell>
      {/* ... existing metrics */}
      <NewMetricCard value="₱5,420" label="New Metric" />
    </ScreenShell>
  );
}
```

### Customizing Colors

Each component accepts variant colors:

```tsx
// Use built-in variants
<RevenueSummaryCard variant="primary" />     // Green
<RevenueSummaryCard variant="secondary" />   // Light green
<RevenueSummaryCard variant="tertiary" />    // Yellow-green

// Or customize with backgroundColor prop
<MetricCard
  icon="payments"
  label="Custom"
  value="₱1,000"
  subtitle="Custom metric"
  backgroundColor="bg-error-container"
  iconColor="#ba1a1a"
/>
```

### Adding Animations

Enhance components with React Native Reanimated:

```tsx
import Animated, {
  FadeInDown,
  Layout,
} from 'react-native-reanimated';

<Animated.View
  entering={FadeInDown.delay(index * 100)}
  layout={Layout.springify()}
>
  <RevenueSummaryCard {...props} />
</Animated.View>
```

---

## Performance Considerations

### 1. Memoize Components

Prevent unnecessary re-renders:

```tsx
const MemoizedRevenueCard = React.memo(RevenueSummaryCard);
const MemoizedMetricCard = React.memo(MetricCard);
```

### 2. Use FlatList for Large Lists

Replace View + map with FlatList:

```tsx
// Before (inefficient for large lists)
<View>
  {transactions.map(t => <TransactionRow {...t} />)}
</View>

// After (scrolls smoothly)
<FlatList
  data={transactions}
  renderItem={({ item }) => <TransactionRow {...item} />}
  keyExtractor={item => item.id}
  scrollEnabled={false}
/>
```

### 3. Lazy Load Heavy Components

```tsx
const WeeklySalesChartLazy = React.lazy(() =>
  import('@/components/dashboard/WeeklySalesChart')
);

<Suspense fallback={<ChartSkeleton />}>
  <WeeklySalesChartLazy data={weeklyData} />
</Suspense>
```

---

## Testing the Changes

### Unit Test Example

```tsx
import { render } from '@testing-library/react-native';
import { RevenueSummaryCard } from '@/components/dashboard/RevenueSummaryCard';

describe('RevenueSummaryCard', () => {
  it('displays revenue amount', () => {
    const { getByText } = render(
      <RevenueSummaryCard
        label="Test Revenue"
        amount="₱1,000"
        variant="primary"
      />
    );
    expect(getByText('₱1,000')).toBeTruthy();
  });

  it('shows trend when provided', () => {
    const { getByText } = render(
      <RevenueSummaryCard
        label="Test"
        amount="₱1,000"
        trend={{ percentage: 12, direction: "up" }}
        variant="primary"
      />
    );
    expect(getByText('+12% vs yesterday')).toBeTruthy();
  });
});
```

### Integration Test Example

```tsx
describe('Dashboard Screen', () => {
  it('renders all metrics', async () => {
    const { getByText } = render(<DashboardScreen />);
    
    // Check primary metric
    expect(getByText(/Today's Revenue/i)).toBeTruthy();
    
    // Check secondary metrics
    expect(getByText(/Weekly Sales/i)).toBeTruthy();
    expect(getByText(/GCash Revenue/i)).toBeTruthy();
    
    // Check action buttons
    expect(getByText(/Add Sale/i)).toBeTruthy();
  });
});
```

---

## Breaking Changes

⚠️ **Important**: The following have changed:

1. **Component Structure**: Dashboard now uses modular components instead of monolithic screen
2. **Data Format**: `TRANSACTIONS` and `RESTOCK_ITEMS` remain the same but component signatures differ
3. **Icon Names**: Uses Lucide icons instead of Material Symbols (check AppIcon.tsx for available icons)
4. **Layout**: Visual layout has changed - update any CSS/styling that targets specific positions

---

## Rollback Instructions

If you need to revert to the old dashboard:

```bash
# Git rollback (if using version control)
git checkout HEAD~1 -- apps/mobile/app/\(tabs\)/index.tsx

# Manual rollback
# 1. Delete new component files:
#    - components/dashboard/RevenueSummaryCard.tsx
#    - components/dashboard/MetricCard.tsx
#    - components/dashboard/WeeklySalesChart.tsx
#    - components/dashboard/RestockAlerts.tsx
#    - components/dashboard/QuickActionButtons.tsx
#
# 2. Restore original index.tsx from backup
```

---

## FAQ

**Q: How do I add a new metric?**
A: Create a new component in `components/dashboard/`, then add it to the home screen.

**Q: Can I customize colors?**
A: Yes, use the `variant` prop or the `backgroundColor` and `iconColor` props.

**Q: How do I connect real data?**
A: Replace hardcoded arrays with `useSWR` or `useEffect` + `setState` API calls.

**Q: What about performance?**
A: Use `React.memo`, `FlatList`, and lazy loading for better performance.

**Q: Can I add animations?**
A: Yes, use `react-native-reanimated` with the existing components.

---

## Support

For issues or questions:
1. Check `DASHBOARD_ARCHITECTURE.md` for architectural details
2. Check `components/dashboard/README.md` for component usage
3. Review example implementations in `app/(tabs)/index.tsx`

