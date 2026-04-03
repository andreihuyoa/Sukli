# Tindahan Dashboard Architecture

## Overview

The refactored Tindahan dashboard is a production-ready React Native (Expo) mobile interface designed for small to medium-sized retail businesses. It prioritizes clear information hierarchy, quick readability, and compliance with Apple's Human Interface Guidelines with a refined liquid glass aesthetic on iOS.

## Design Principles

### 1. **Information Hierarchy**
- **Primary KPI**: Today's Revenue (largest, top-most card) - the first metric users see
- **Secondary KPIs**: Weekly Sales and GCash Revenue (side-by-side comparison)
- **Action Layer**: Quick action buttons for Add Sale and Add Product
- **Detail Layer**: Key metrics, charts, alerts, and transaction history

### 2. **Component-Based Architecture**
Each screen section is built from reusable, composable components:
- `RevenueSummaryCard` - Flexible revenue displays with trends
- `MetricCard` - Key performance indicators
- `WeeklySalesChart` - Sales trend visualization
- `RestockAlerts` - Inventory management alerts
- `QuickActionButtons` - Primary user actions

### 3. **Native iOS Patterns**
- **Liquid Glass Aesthetic**: Uses `expo-blur` for BlurView on iOS with fallback colors on Android
- **Safe Area Handling**: Respects notches, Dynamic Island, and safe zones
- **Gesture Interactions**: Native press feedback with `active:opacity` states
- **Accessibility**: All interactive elements have proper ARIA labels and semantic roles

## Component Details

### RevenueSummaryCard
**Purpose**: Display revenue metrics with optional trend indicators
**Props**:
- `label` (string): Section label (e.g., "Today's Revenue")
- `amount` (string): The main value to display
- `subtitle?` (string): Optional supporting text
- `trend?` ({ percentage: number, direction: 'up'|'down' }): Growth indicator
- `variant?` ('primary'|'secondary'|'tertiary'): Color scheme

**Usage**:
```tsx
<RevenueSummaryCard
  label="Today's Revenue"
  amount="₱42,850.00"
  trend={{ percentage: 12, direction: "up" }}
  variant="primary"
/>
```

### MetricCard
**Purpose**: Display key business metrics in a compact card
**Props**:
- `icon` (string): Material Symbol icon name
- `label` (string): Metric label
- `value` (string): The metric value
- `subtitle` (string): Additional context
- `iconColor?` (string): Hex color for icon
- `backgroundColor?` (string): Tailwind class for background

**Usage**:
```tsx
<MetricCard
  icon="inventory_2"
  label="Stock"
  value="1,284"
  subtitle="Items in store"
/>
```

### WeeklySalesChart
**Purpose**: Visualize sales trends across 7 days
**Props**:
- `data` (WeeklyData[]): Array of {day, value, isToday}
- `maxValue?` (number): Maximum Y-axis value for scaling

**Usage**:
```tsx
<WeeklySalesChart
  data={[
    { day: "Mon", value: 8400 },
    { day: "Sun", value: 8940, isToday: true },
  ]}
/>
```

### RestockAlerts
**Purpose**: Display inventory items requiring restocking
**Props**:
- `items` (RestockItem[]): Items with {id, name, unitsLeft, icon}
- `onQuickReorder?` (callback): Handler for reorder actions

**Usage**:
```tsx
<RestockAlerts
  items={[
    { id: "1", name: "Artisan Mango Jam", unitsLeft: 4 }
  ]}
  onQuickReorder={(itemId) => console.log(itemId)}
/>
```

### QuickActionButtons
**Purpose**: Primary call-to-action buttons with icons
**Props**:
- `actions` (ActionButton[]): Array of {icon, label, onPress, variant}

**Usage**:
```tsx
<QuickActionButtons
  actions={[
    {
      icon: "point_of_sale",
      label: "Add Sale",
      onPress: () => router.push("/sales"),
      variant: "primary",
    },
  ]}
/>
```

## Color System

The dashboard uses Material Design 3 tokens:

- **Primary** (#204e2b): Main brand color - used for emphasis and CTAs
- **Secondary** (#3d6924): Alternative actions
- **Tertiary** (#384c00): GCash and payment-related elements
- **Surface variants**: Layered backgrounds for depth
- **Semantic colors**: Error (#ba1a1a) for alerts, Success (#386641) for completions

### Liquid Glass Effect
- iOS: `BlurView` from `expo-blur` with tint="light"
- Android: Solid color with `rgba(56, 102, 65, 0.82)` for consistency

## Layout Structure

### Mobile-First Responsive Design
```
┌─────────────────────────────────────────┐
│ AppHeader (Blur glass, persistent)      │
├─────────────────────────────────────────┤
│ PRIMARY KPI: Today's Revenue (Full)     │  ← User's first glance
├─────────────────────────────────────────┤
│ SECONDARY KPIs (Weekly | GCash)         │  ← Context metrics
├─────────────────────────────────────────┤
│ Quick Action Buttons (Add Sale | Add)   │  ← Primary interactions
├─────────────────────────────────────────┤
│ Key Metrics (Stock | Profit)            │  ← Supporting data
├─────────────────────────────────────────┤
│ Weekly Sales Chart (Full)               │  ← Trend visualization
├─────────────────────────────────────────┤
│ Restock Alerts (Full)                   │  ← Action items
├─────────────────────────────────────────┤
│ Recent Transactions (Full)              │  ← Activity log
├─────────────────────────────────────────┤
│ TindahanTabBar (Bottom navigation)      │  ← Tab switching
└─────────────────────────────────────────┘
```

## Typography & Spacing

- **Headlines**: Vollkorn (serif) - Used for primary metrics and section titles
- **Body**: Noto Sans (sans-serif) - Used for secondary text and labels
- **Sizes**: 
  - Primary KPI: 32-40px
  - Section headers: 18px
  - Body: 14px
  - Labels: 12px

**Spacing Scale**: Uses consistent gap/padding scale:
- `gap-3` = 12px (between cards)
- `gap-4` = 16px (between sections)
- `p-4` = 16px (card padding)
- `p-6` = 24px (large containers)

## Performance Optimizations

1. **Component Memoization**: Use `React.memo()` for cards that don't frequently update
2. **Lazy Rendering**: `WeeklySalesChart` bars are pre-calculated, not animated
3. **FlatList for Lists**: Large transaction lists use `FlatList` for virtualization
4. **Image Optimization**: Profile images use `expo-image` with blurhash
5. **Stylesheet Caching**: AppHeader uses `StyleSheet.absoluteFill` for static layouts

## Accessibility

All components follow WCAG 2.1 AA standards:
- **Semantic Roles**: Pressable elements have `accessibilityRole="button"`
- **Labels**: All interactive elements have `accessibilityLabel` for screen readers
- **Color Contrast**: Text meets 4.5:1 ratio for body text
- **Touch Targets**: Minimum 48px for interactive elements
- **Font Scaling**: Uses relative sizes that respect system preferences

## State Management Pattern

Current implementation is stateless. For production expansion:

```tsx
// Future: Connect to backend API
const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

useEffect(() => {
  // Fetch from backend
  fetchDashboardMetrics().then(setMetrics);
}, []);

// Future: Real-time updates with websockets or polling
```

## Known Limitations & Future Enhancements

1. **Data Hardcoded**: Replace RECENT_TRANSACTIONS and RESTOCK_ITEMS with API calls
2. **No Chart Animations**: Current bars are static; consider adding Reanimated for smooth transitions
3. **No Real-Time Updates**: Add polling or websockets for live metrics
4. **No Chart Interaction**: Consider adding tap-to-highlight or swipe for date range
5. **Mobile-Only**: No tablet/landscape optimizations yet

## Testing Strategy

```tsx
// Example test structure
describe("RevenueSummaryCard", () => {
  it("displays revenue amount correctly", () => {
    const { getByText } = render(
      <RevenueSummaryCard
        label="Test"
        amount="₱1,000"
        variant="primary"
      />
    );
    expect(getByText("₱1,000")).toBeTruthy();
  });

  it("shows trend indicator when provided", () => {
    const { getByText } = render(
      <RevenueSummaryCard
        label="Test"
        amount="₱1,000"
        trend={{ percentage: 12, direction: "up" }}
        variant="primary"
      />
    );
    expect(getByText("+12% vs yesterday")).toBeTruthy();
  });
});
```

## File Structure

```
components/
├── dashboard/
│   ├── RevenueSummaryCard.tsx    # Primary KPI display
│   ├── MetricCard.tsx            # Key metric indicators
│   ├── WeeklySalesChart.tsx      # 7-day trend chart
│   ├── RestockAlerts.tsx         # Inventory warnings
│   └── QuickActionButtons.tsx    # CTA buttons
├── ui/
│   ├── AppHeader.tsx             # Header with blur glass
│   ├── ScreenShell.tsx           # Safe area + scroll wrapper
│   └── AppIcon.tsx               # Material Symbol wrapper
└── navigation/
    └── TindahanTabBar.tsx        # Bottom tab navigation

app/(tabs)/
├── _layout.tsx                   # Tab router config
└── index.tsx                     # Dashboard home screen
```

## Integration Notes

### Adding a New Metric Card
1. Create data in home screen
2. Add `<MetricCard />` component
3. Update color variant if needed
4. Add accessibility labels

### Connecting to Backend
1. Create API client (`lib/api.ts`)
2. Use `useEffect` + SWR for data fetching
3. Replace hardcoded data arrays
4. Add loading/error states

### Adding Real-Time Updates
1. Implement websocket connection
2. Use `useReducer` for complex state
3. Update metric cards on data change
4. Add animation transitions

---

**Last Updated**: 2024
**Maintainers**: Tindahan Team
**License**: MIT
