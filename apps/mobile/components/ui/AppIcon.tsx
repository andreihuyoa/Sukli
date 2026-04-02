import type { LucideIcon } from "lucide-react-native";
import {
  AlertTriangle,
  ArrowUpDown,
  BarChart3,
  Banknote,
  Calendar,
  Check,
  ChevronLeft,
  Cloud,
  Coffee,
  Cookie,
  CreditCard,
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
  ShoppingBag,
  Store,
  Tags,
  TrendingUp,
  Truck,
  UserPlus,
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
  payments: Banknote,
} as const satisfies Record<string, LucideIcon>;

export type AppIconName = keyof typeof ICONS;

type Props = {
  name: AppIconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function AppIcon({ name, size = 24, color, strokeWidth = 2 }: Props) {
  const Icon = ICONS[name];
  return <Icon size={size} color={color} strokeWidth={strokeWidth} />;
}
