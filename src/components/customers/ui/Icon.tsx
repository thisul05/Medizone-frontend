import {
  Check,
  X,
  Info,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  Truck,
  Search,
  Plus,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Image,
  Download,
  FileText,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  Package,
  Pill,
  Home,
  Users,
  Receipt,
  File,
  BarChart2,
  Wallet,
  Store,
  Calendar,
  RefreshCw,
  Tag,
  Bell,
  Shield,
  Star,
  Phone,
  Mail,
  MapPin,
  Eye,
  Send,
  Menu,
  MessageSquare,
  Edit,
  Gift,
  Percent,
  Sun,
  Moon,
  Monitor,
  Calculator,
  type LucideIcon,
} from "lucide-react";

const LUCIDE_ICONS: Record<string, LucideIcon> = {
  check: Check,
  x: X,
  info: Info,
  alert: AlertTriangle,
  alertCircle: AlertCircle,
  checkCircle: CheckCircle2,
  clock: Clock,
  truck: Truck,
  search: Search,
  plus: Plus,
  chevronDown: ChevronDown,
  chevronRight: ChevronRight,
  chevronLeft: ChevronLeft,
  arrowRight: ArrowRight,
  image: Image,
  download: Download,
  dollarFile: FileText,
  arrowUp: ArrowUp,
  arrowDown: ArrowDown,
  arrowLeft: ArrowLeft,
  package: Package,
  pill: Pill,
  home: Home,
  users: Users,
  receipt: Receipt,
  file: File,
  chart: BarChart2,
  wallet: Wallet,
  store: Store,
  calendar: Calendar,
  refresh: RefreshCw,
  tag: Tag,
  bell: Bell,
  shield: Shield,
  star: Star,
  phone: Phone,
  mail: Mail,
  mapPin: MapPin,
  eye: Eye,
  send: Send,
  menu: Menu,
  message: MessageSquare,
  edit: Edit,
  gift: Gift,
  percent: Percent,
  sun: Sun,
  moon: Moon,
  monitor: Monitor,
  calculator: Calculator,
};

export type IconName = keyof typeof LUCIDE_ICONS;

export interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  label?: string;
  filled?: boolean;
  className?: string;
}

export function Icon({ name, size = 20, strokeWidth = 1.75, label, filled, className }: IconProps) {
  const Comp = LUCIDE_ICONS[name] || Info;
  return (
    <Comp
      size={size}
      strokeWidth={strokeWidth}
      className={`block shrink-0 ${filled ? "fill-current" : ""} ${className ?? ""}`}
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
    />
  );
}
