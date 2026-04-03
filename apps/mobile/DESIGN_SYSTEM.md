# Tindahan Design System

## Brand Identity

**Name**: Tindahan (Filipino for "shop" or "store")
**Target**: Small to medium-sized retail businesses in the Philippines
**Primary Use**: Mobile point-of-sale and business metrics dashboard
**Platform**: iOS (primary) and Android

---

## Color Palette

### Primary Colors

| Color | Hex | Usage | Tailwind |
|-------|-----|-------|----------|
| Primary Dark | #204e2b | Main brand, CTAs, headers | `bg-primary` |
| Primary Medium | #386641 | Cards, containers | `bg-primary-container` |
| Primary Light | #bcefc0 | Accents, hover states | `bg-primary-fixed` |
| Primary Bright | #a0d3a5 | Interactive highlights | `text-primary` |

### Secondary Colors

| Color | Hex | Usage | Tailwind |
|-------|-----|-------|----------|
| Secondary | #3d6924 | Alternative actions | `bg-secondary` |
| Secondary Light | #baee99 | Secondary cards | `bg-secondary-container` |
| Secondary Pale | #bdf19c | Background accents | `bg-secondary-fixed` |

### Tertiary Colors (GCash/Payments)

| Color | Hex | Usage | Tailwind |
|-------|-----|-------|----------|
| Tertiary | #384c00 | Payment metrics | `bg-tertiary` |
| Tertiary Light | #4b6500 | Tertiary cards | `bg-tertiary-container` |
| Tertiary Bright | #ccf078 | Highlights | `bg-tertiary-fixed` |

### Semantic Colors

| Color | Hex | Usage | Tailwind |
|-------|-----|-------|----------|
| Success | #204e2b | Completed status, checks | `text-primary` |
| Warning | #ba1a1a | Alerts, low stock | `bg-error` |
| Error | #ba1a1a | Errors, critical | `bg-error-container` |
| Info | #204e2b | Information | `text-primary` |

### Neutral Colors

| Color | Hex | Usage | Tailwind |
|-------|-----|-------|----------|
| Background | #faf9f9 | Screen background | `bg-background` |
| Surface | #faf9f9 | Cards, containers | `bg-surface` |
| Surface Low | #f4f3f3 | Subtle background | `bg-surface-container-low` |
| Surface High | #e3e2e2 | Elevated surfaces | `bg-surface-container-high` |
| Outline | #727970 | Borders, dividers | `border-outline` |
| Text | #1b1c1c | Primary text | `text-on-surface` |
| Text Muted | #414941 | Secondary text | `text-on-surface-variant` |

---

## Typography

### Font Families

| Font | Usage | Weights | Tailwind Class |
|------|-------|---------|-----------------|
| Vollkorn | Headlines, metrics | 400, 700, 800 | `font-headline` |
| Noto Sans | Body, labels, UI | 400, 500, 600, 700 | `font-body` |

### Type Scale

| Name | Size | Weight | Line Height | Usage | Tailwind |
|------|------|--------|-------------|-------|----------|
| Display | 40px | 800 | 1.2 | Not used yet | - |
| Headline | 32px | 800 | 1.2 | Primary KPI values | `font-headline text-4xl` |
| Title | 24px | 700 | 1.2 | Section headers | `font-headline text-2xl` |
| Subtitle | 18px | 700 | 1.3 | Card titles | `font-headline text-lg` |
| Body | 14px | 400 | 1.6 | Body text | `font-body text-sm` |
| Label | 12px | 600 | 1.2 | Labels, captions | `font-label text-xs` |
| Caption | 11px | 500 | 1.2 | Small text | `font-body text-[11px]` |

### Examples

```tsx
// Display KPI
<Text className="font-headline text-5xl font-extrabold tracking-tight">
  ₱42,850.00
</Text>

// Section Header
<Text className="font-headline text-xl font-bold">
  Weekly Sales Trend
</Text>

// Body Text
<Text className="font-body text-sm text-on-surface-variant">
  Items across 12 categories
</Text>

// Label
<Text className="font-label text-xs uppercase tracking-widest text-outline">
  Today's Revenue
</Text>
```

---

## Spacing System

### Scale
Based on 4px base unit:

```
2px   = 0.5   units  (gap-0.5, p-0.5)
4px   = 1     unit   (gap-1, p-1)
8px   = 2     units  (gap-2, p-2)
12px  = 3     units  (gap-3, p-3)
16px  = 4     units  (gap-4, p-4)
20px  = 5     units  (gap-5, p-5)
24px  = 6     units  (gap-6, p-6)
32px  = 8     units  (gap-8, p-8)
40px  = 10    units  (gap-10, p-10)
```

### Application

```tsx
// Between sections
className="mb-6"  // 24px bottom margin

// Between cards
className="gap-3"  // 12px between items

// Card padding
className="p-6"   // 24px internal padding

// Between lines
className="gap-2"  // 8px between text items
```

---

## Border Radius

| Name | Value | Usage | Tailwind |
|------|-------|-------|----------|
| Small | 8px | Buttons, icons | `rounded-lg` |
| Medium | 12px | Small cards | `rounded-xl` |
| Large | 16px | Cards | `rounded-2xl` |
| XLarge | 24px | Large containers, modals | `rounded-3xl` |
| Full | 999px | Pill shapes | `rounded-full` |

### Examples

```tsx
// Small button
<Pressable className="rounded-lg p-3">

// Card
<View className="rounded-3xl p-6">

// Pill-shaped badge
<View className="rounded-full px-3 py-1">
```

---

## Shadows & Depth

### Shadow Elevation

```tsx
// No shadow
className="shadow-none"

// Subtle shadow (cards at rest)
className="shadow-sm"

// Standard shadow (elevated cards)
className="shadow-md"

// Large shadow (floating elements)
className="shadow-lg"

// Extra large shadow (modals)
className="shadow-xl"
```

### Glass Morphism (iOS)

The dashboard uses a "liquid glass" aesthetic on iOS:

```tsx
// iOS: Blur glass effect
<BlurView intensity={85} tint="light">
  {/* Content */}
</BlurView>

// Android: Fallback solid color
<View style={{ backgroundColor: 'rgba(56, 102, 65, 0.82)' }}>
  {/* Content */}
</View>
```

---

## Component Guidelines

### Cards

All cards follow these patterns:

```tsx
// Standard card
<View className="rounded-3xl bg-surface-container-lowest p-6 shadow-sm">
  <Text className="font-headline text-lg font-bold mb-4">Title</Text>
  {/* Content */}
</View>

// Colored card (primary metric)
<View className="rounded-3xl bg-primary-container p-6 shadow-lg">
  <Text className="text-white/70 font-label text-xs uppercase">Label</Text>
  <Text className="text-white font-headline text-4xl font-bold mt-2">Value</Text>
</View>

// Alert card (warning state)
<View className="rounded-3xl bg-error-container p-6 shadow-sm">
  <Text className="text-on-error-container font-headline">Alert</Text>
</View>
```

### Buttons

All buttons are Pressable with consistent sizing:

```tsx
// Primary button
<Pressable className="rounded-2xl bg-primary py-4 px-6 active:opacity-80">
  <Text className="text-white font-headline font-bold">Action</Text>
</Pressable>

// Secondary button
<Pressable className="rounded-2xl bg-secondary py-4 px-6 active:opacity-80">
  <Text className="text-white font-headline font-bold">Alternative</Text>
</Pressable>

// Text button
<Pressable className="active:opacity-60">
  <Text className="text-primary font-bold">Link</Text>
</Pressable>

// Pill button
<Pressable className="rounded-full bg-primary px-4 py-2 active:opacity-80">
  <Text className="text-white font-label text-xs">Tag</Text>
</Pressable>
```

### Icons

All icons are 20-24px for body, 16px for small areas:

```tsx
// Standard icon
<AppIcon name="inventory_2" size={24} color="#204e2b" />

// Small icon
<AppIcon name="trending_up" size={16} color="#ffffff" />

// Icon button
<Pressable className="h-12 w-12 items-center justify-center rounded-xl">
  <AppIcon name="add_box" size={24} color="#204e2b" />
</Pressable>
```

---

## Layout Patterns

### Safe Area Handling

```tsx
// Header respects notch
<AppHeader syncPill />

// Screen content respects safe areas
<ScreenShell>
  {/* Content automatically has top/bottom padding */}
</ScreenShell>
```

### Information Hierarchy

1. **Primary KPI** (40px text, full width, top position)
2. **Secondary KPIs** (32px text, side-by-side)
3. **Quick Actions** (buttons, 2 per row)
4. **Supporting Metrics** (compact cards, 2 per row)
5. **Visualizations** (charts, full width)
6. **Alerts** (full width lists)
7. **Activity** (scrollable transaction list)

---

## Accessibility

### Color Contrast

All text meets WCAG AA standards (4.5:1 for body):

- Dark text on light: `#1b1c1c` on `#faf9f9` ✅ 13.4:1
- White text on primary: `#ffffff` on `#204e2b` ✅ 8.2:1
- Medium text on light: `#414941` on `#faf9f9` ✅ 7.2:1

### Touch Targets

- Minimum 44pt × 44pt on iOS
- Minimum 48pt × 48pt on Android
- Icons: 24pt × 24pt minimum
- Text buttons: At least 44pt tall

### Typography

- Base font size: 14px (respects system preferences)
- Minimum readable: 12px (labels only)
- Line height: 1.4-1.6 for body text
- Letter spacing: Consistent tracking for labels

---

## Dark Mode (Future)

Currently light mode only. For future dark mode:

```
Primary Dark:   #204e2b → #96d5a0
Background:     #faf9f9 → #121212
Surface:        #ffffff → #1e1e1e
Text:           #1b1c1c → #ffffff
Text Muted:     #414941 → #9e9e9e
```

---

## Motion & Animation

### Interaction Feedback

```tsx
// Press feedback
className="active:opacity-80"

// Hover feedback (iOS only)
className="active:scale-95 transition-transform duration-200"

// State change
className="transition-colors duration-300"
```

### Transitions

- **Quick interactions**: 150-200ms
- **Standard transitions**: 300-400ms
- **Slow animations**: 500-800ms

---

## Responsive Design

All layouts are **mobile-first** and expand for larger screens:

```tsx
// Mobile (default)
<View className="flex-col gap-4">

// Tablet and up (if needed)
<View className="md:flex-row flex-col gap-4">
```

---

## File Structure

```
Design System Assets:
├── Colors (Tailwind config)
├── Typography (Font families)
├── Spacing (Tailwind scale)
├── Shadows (Built-in)
└── Border Radius (Preset values)

Component Library:
├── dashboard/
│   ├── RevenueSummaryCard
│   ├── MetricCard
│   ├── WeeklySalesChart
│   ├── RestockAlerts
│   └── QuickActionButtons
├── ui/
│   ├── AppHeader
│   ├── ScreenShell
│   └── AppIcon
└── navigation/
    └── TindahanTabBar
```

---

## Brand Voice

- **Tone**: Professional, helpful, encouraging
- **Language**: English (for now), localized for PH market
- **Metrics**: Peso (₱) for currency
- **Time**: 24-hour format where applicable

### Copy Examples

✅ GOOD:
- "Today's Revenue"
- "Quick Reorder"
- "Running low on stock"

❌ BAD:
- "You have ₱42,850.00 in revenue today"
- "Add another sale to increase income"
- "Stock levels are critically low"

---

## Implementation Checklist

When creating new components:

- [ ] Uses correct color palette
- [ ] Typography follows type scale
- [ ] Spacing uses standard units
- [ ] Border radius consistent
- [ ] Touch targets ≥44pt
- [ ] Shadow applied for depth
- [ ] Accessible color contrast
- [ ] Icons 20-24px standard
- [ ] Responsive on mobile first
- [ ] iOS glass morphism where appropriate

---

## Testing Design Consistency

Use these checks before shipping:

1. **Color Check**: All colors are from the palette
2. **Typography Check**: All text follows the scale
3. **Spacing Check**: All gaps/padding use standard units
4. **Contrast Check**: WCAG AA minimum (4.5:1)
5. **Touch Check**: All targets ≥44pt
6. **Animation Check**: Transitions feel smooth
7. **Responsive Check**: Looks good on all screen sizes

---

## References

- Material Design 3: https://m3.material.io/
- Apple HIG: https://developer.apple.com/design/human-interface-guidelines/
- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/

---

**Last Updated**: 2024
**Version**: 1.0
**Status**: Active

