// Seed catalogue and presentation metadata. Live names, prices and stock come from lib/use-catalog.
import type { IconName } from "@/components/shared/Icon";

export interface StoreCategory {
  id: string;
  name: string;
  icon: IconName;
  blurb: string;
  /** Photo for the home page hero tiles. */
  image?: string;
}

export type StockLevel = "in_stock" | "low" | "out";
export type ProductTag = "featured" | "offer" | "device" | "bestseller" | "new";

export interface StoreProduct {
  id: string;
  name: string;
  brand?: string;
  categoryId: string;
  price: number;
  originalPrice?: number;
  stock: StockLevel;
  image?: string;
  tag: ProductTag;
  warrantyMonths?: number;
  note?: string;
}

export const categories: StoreCategory[] = [
  { id: "vitamins", name: "Vitamins and nutrition", icon: "pill", blurb: "Daily vitamins, minerals and nutrition powders.", image: "/images/categories/vitamins.jpg" },
  { id: "skincare", name: "Beauty and skincare", icon: "sparkles", blurb: "Hair, skin and nail care.", image: "/images/categories/skincare.jpg" },
  { id: "mom-baby", name: "Mom and baby", icon: "baby", blurb: "Gentle care for mothers and little ones.", image: "/images/categories/mom-baby.jpg" },
  { id: "personal", name: "Everyday personal wellness", icon: "heart", blurb: "Pain relief, rehydration and daily basics." },
  { id: "devices", name: "Health monitoring devices", icon: "activity", blurb: "Blood pressure, glucose and temperature at home.", image: "/images/categories/devices.jpg" },
  { id: "intimate", name: "Intimate wellness", icon: "flower", blurb: "Private, discreet essentials." },
  { id: "mobility", name: "Mobility and joint support", icon: "accessibility", blurb: "Braces and supports for active days." },
  { id: "home-health", name: "Home health and comfort", icon: "home-health", blurb: "Comfort care for recovery at home." },
  { id: "pet", name: "Pet wellness", icon: "paw", blurb: "Supplements for healthy pets." },
  { id: "general", name: "General wellness essentials", icon: "shield-plus", blurb: "Hygiene and protection for every home." },
];

type Row = [string, string, string | undefined, string, number, number | undefined, StockLevel, ProductTag, Partial<StoreProduct>?];

const rows: Row[] = [
  ["p01", "Vidafast nutrition powder 400 g", "Vidafast", "vitamins", 5830, 6830, "in_stock", "featured"],
  ["p02", "Nutrican nutrition powder 243 g", "Nutrican", "vitamins", 2790, undefined, "in_stock", "featured"],
  ["p03", "Nephrisol-D powder 210 g", "Nephrisol", "vitamins", 3750, undefined, "in_stock", "featured"],
  ["p04", "BeZinc zinc capsules", "BeZinc", "vitamins", 185, undefined, "in_stock", "featured", { note: "Strip of 10" }],
  ["p05", "OMRON HEM-7121J blood pressure monitor", "OMRON", "devices", 15500, 16900, "in_stock", "offer", { warrantyMonths: 36 }],
  ["p06", "Sudocrem antiseptic healing cream 125 g", "Sudocrem", "mom-baby", 3500, 3750, "in_stock", "offer"],
  ["p07", "Vitabiotics Perfectil Hair, 60 tablets", "Vitabiotics", "vitamins", 9800, 10500, "in_stock", "offer"],
  ["p08", "Prodigy AutoCode talking blood glucose meter", "Prodigy", "devices", 5500, 6200, "low", "offer", { warrantyMonths: 24 }],
  ["p09", "Fingertip pulse oximeter", "Medizone", "devices", 4500, undefined, "in_stock", "device", { warrantyMonths: 12 }],
  ["p10", "Digital thermometer", "Medizone", "devices", 1250, undefined, "low", "device", { warrantyMonths: 12 }],
  ["p11", "Glucose test strips, 50 pack", "Prodigy", "devices", 3900, undefined, "in_stock", "device"],
  ["p12", "Nebuliser, compressor type", "Medizone", "devices", 9500, undefined, "in_stock", "device", { warrantyMonths: 12 }],
  ["p13", "Smart pregnancy test strip", "Smart", "intimate", 250, undefined, "in_stock", "bestseller"],
  ["p14", "Paracetamol 500 mg tablets, strip of 10", undefined, "personal", 60, undefined, "in_stock", "bestseller"],
  ["p15", "Oral rehydration salts, 5 sachets", undefined, "personal", 250, undefined, "in_stock", "bestseller"],
  ["p16", "Knee support brace, medium", "Medizone", "mobility", 2200, undefined, "in_stock", "bestseller"],
  ["p17", "Beautine hair, skin and nail supplement", "Beautine", "vitamins", 3500, undefined, "low", "new"],
  ["p18", "Photonic MAX shampoo", "Photonic", "skincare", 4950, undefined, "in_stock", "new"],
  ["p19", "Daily moisturising lotion 200 ml", "Medizone", "skincare", 1850, undefined, "in_stock", "new"],
  ["p20", "Baby diaper rash cream 50 g", "Medizone", "mom-baby", 950, undefined, "in_stock", "new"],
  ["p21", "Hot water bottle", "Medizone", "home-health", 1450, undefined, "out", "new"],
  ["p22", "Pet multivitamin chews, 30", "Medizone", "pet", 2400, undefined, "in_stock", "new"],
  ["p23", "Hand sanitiser 500 ml", "Medizone", "general", 890, undefined, "in_stock", "new"],
  ["p24", "Face masks, box of 50", "Medizone", "general", 750, undefined, "in_stock", "new"],
];

// Photos are generic, free-licence images of the product type (see public/images/CREDITS.md).
export const products: StoreProduct[] = rows.map(([id, name, brand, categoryId, price, originalPrice, stock, tag, extra]) => ({
  id, name, brand, categoryId, price, originalPrice, stock, tag, image: `/images/products/${id}.jpg`, ...extra,
}));

export const brands = ["OMRON", "Prodigy", "Vitabiotics", "Sudocrem", "Nutrican", "Vidafast", "Beautine", "Photonic"];

export interface HealthTip {
  id: string;
  title: string;
  body: string;
  date: string;
  category: string;
}

export const healthTips: HealthTip[] = [
  {
    id: "t1",
    title: "Check the expiry date before you use any product",
    body: "Expired products can lose strength or change in ways you cannot see. Look for the date on the box and the strip, and bring anything out of date to a branch so we can dispose of it safely.",
    date: "2026-10-20",
    category: "Safety",
  },
  {
    id: "t2",
    title: "How to take an accurate blood pressure reading at home",
    body: "Sit quietly for five minutes with your back supported and your arm resting at heart level. Use the right cuff size, take two readings a minute apart, and write both down to show your doctor.",
    date: "2026-10-06",
    category: "Devices",
  },
  {
    id: "t3",
    title: "Store medicines and supplements away from heat and damp",
    body: "A bathroom cabinet or a sunny window ledge can spoil tablets quickly. Keep them in a cool, dry cupboard, in the original pack, and out of reach of children.",
    date: "2026-09-22",
    category: "Everyday care",
  },
];

export const getCategory = (id: string) => categories.find((c) => c.id === id);
export const getProduct = (id: string) => products.find((p) => p.id === id);
export const productsByTag = (tag: ProductTag) => products.filter((p) => p.tag === tag);
export const countInCategory = (id: string) => products.filter((p) => p.categoryId === id).length;

/** Whole-number discount percentage, or null when there is no original price. */
export function discountPercent(price: number, originalPrice?: number): number | null {
  if (!originalPrice || originalPrice <= price) return null;
  return Math.round((1 - price / originalPrice) * 100);
}
