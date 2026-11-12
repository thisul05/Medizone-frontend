import {
  Accessibility, Activity, ArrowLeft, ArrowRight, ArrowUp, Award, Baby, BadgeCheck, Banknote, Bell, Building,
  CalendarDays, ChartColumn, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, CircleCheck,
  CircleExclamationPoint, CircleUser, ClipboardList, Clock, CreditCard, Download, Droplets, Eye, EyeOff, FileText,
  Flower2, Gift, Globe, HandHeart, Heart, HeartPulse, HouseHeart, House, IdCard, Info, Landmark,
  LayoutDashboard, Leaf, LoaderCircle, Lock, LogOut, Mail, MapPin, Menu, MessageCircle, Minus, Package,
  PawPrint, Pencil, Percent, Phone, Pill, Plus, Printer, Receipt, Search, ShieldCheck, ShieldPlus, ShoppingBag, ShoppingCart,
  SlidersHorizontal, Sparkles, Star, Stethoscope, Store, Tag, Thermometer, Trash, TriangleExclamationPoint,
  Truck, User, Users, Wallet, X, type LucideIcon,
} from "lucide-react";

const ICONS = {
  accessibility: Accessibility, activity: Activity, "arrow-left": ArrowLeft, "arrow-right": ArrowRight,
  "arrow-up": ArrowUp, award: Award, baby: Baby, "badge-check": BadgeCheck, banknote: Banknote, bell: Bell,
  building: Building, calendar: CalendarDays, chart: ChartColumn, check: Check, "chevron-down": ChevronDown,
  "chevron-left": ChevronLeft, "chevron-right": ChevronRight, "chevron-up": ChevronUp,
  "circle-check": CircleCheck, "alert-circle": CircleExclamationPoint, account: CircleUser,
  clipboard: ClipboardList, clock: Clock, card: CreditCard, download: Download, droplets: Droplets, eye: Eye, "eye-off": EyeOff,
  "file-text": FileText, flower: Flower2, gift: Gift, globe: Globe, "hand-heart": HandHeart, heart: Heart,
  "heart-pulse": HeartPulse, "home-health": HouseHeart, home: House, "id-card": IdCard, info: Info,
  bank: Landmark, dashboard: LayoutDashboard, leaf: Leaf, loader: LoaderCircle, lock: Lock, logout: LogOut,
  mail: Mail, "map-pin": MapPin, menu: Menu, message: MessageCircle, minus: Minus, package: Package,
  paw: PawPrint, pencil: Pencil, percent: Percent, phone: Phone, pill: Pill, plus: Plus, printer: Printer, receipt: Receipt, search: Search,
  "shield-check": ShieldCheck, "shield-plus": ShieldPlus, bag: ShoppingBag, cart: ShoppingCart,
  filter: SlidersHorizontal, sparkles: Sparkles, star: Star, stethoscope: Stethoscope, store: Store, tag: Tag,
  thermometer: Thermometer, trash: Trash, alert: TriangleExclamationPoint, truck: Truck, user: User,
  users: Users, wallet: Wallet, x: X,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

export interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  /** Set when the icon carries meaning on its own. Otherwise it is hidden from screen readers. */
  label?: string;
  className?: string;
}

export function Icon({ name, size = 20, strokeWidth = 1.75, label, className }: IconProps) {
  const Cmp = ICONS[name];
  return (
    <Cmp
      size={size}
      strokeWidth={strokeWidth}
      className={["shrink-0", className].filter(Boolean).join(" ")}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
      focusable="false"
    />
  );
}
