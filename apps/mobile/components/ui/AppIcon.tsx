import type { LucideIcon } from "lucide-react-native";
import { cssInterop } from "nativewind";
import { StyleSheet, type StyleProp, type TextStyle } from "react-native";
import {
  AlertTriangle,
  ArrowUpDown,
  Banknote,
  BarChart3,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Cloud,
  Coffee,
  Cookie,
  CreditCard,
  DollarSign,
  Download,
  Egg,
  Filter,
  GlassWater,
  Home,
  ListChecks,
  MessageCircle,
  Minus,
  MoreVertical,
  Package,
  PackagePlus,
  Phone,
  Plus,
  Receipt,
  RefreshCw,
  ScanBarcode,
  ScanLine,
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Store,
  Tags,
  TrendingDown,
  TrendingUp,
  Truck,
  UserPlus,
  X,
  Zap,
} from "lucide-react-native";

const ICONS = {
  storefront: Store,
  home_app_logo: Home,
  home: Home,
  point_of_sale: CreditCard,
  inventory_2: Package,
  local_shipping: Truck,
  analytics: BarChart3,
  cloud_sync: Cloud,
  arrow_back: ChevronLeft,
  chevron_left: ChevronLeft,
  chevron_right: ChevronRight,
  search: Search,
  qr_code_scanner: ScanLine,
  barcode_scanner: ScanBarcode,
  filter_list: Filter,
  sort: ArrowUpDown,
  trending_up: TrendingUp,
  add_box: PackagePlus,
  add: Plus,
  remove: Minus,
  warning: AlertTriangle,
  category: Tags,
  more_vert: MoreVertical,
  coffee: Coffee,
  reusable_bag: ShoppingBag,
  water_bottle: GlassWater,
  receipt_long: Receipt,
  person_add: UserPlus,
  call: Phone,
  chat: MessageCircle,
  calendar_today: Calendar,
  bolt: Zap,
  sync: RefreshCw,
  checklist: ListChecks,
  local_drink: GlassWater,
  bakery_dining: Cookie,
  egg: Egg,
  check: Check,
  settings: Settings,
  payments: Banknote,
  dollar_sign: DollarSign,
  download: Download,
  cart: ShoppingCart,
  smartphone: Smartphone,
  circle: Circle,
  check_circle: CheckCircle2,
  x: X,
  trending_down: TrendingDown,
} as const satisfies Record<string, LucideIcon>;

export type AppIconName = keyof typeof ICONS;

type Props = {
  name: AppIconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
  style?: StyleProp<TextStyle>;
};

function AppIconBase({
  name,
  size = 24,
  color,
  strokeWidth = 2,
  style,
}: Props) {
  const Icon = ICONS[name];
  const resolvedStyle = StyleSheet.flatten(style);
  const resolvedColor =
    color ??
    (typeof resolvedStyle?.color === "string"
      ? resolvedStyle.color
      : undefined);

  return <Icon size={size} color={resolvedColor} strokeWidth={strokeWidth} />;
}

cssInterop(AppIconBase, {
  className: "style",
});

export const AppIcon = AppIconBase;
