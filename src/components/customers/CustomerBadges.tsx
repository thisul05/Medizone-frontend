import { formatNumber, getInitials } from "@/lib/customers";
import type { Customer } from "@/types/customers";
import { Badge } from "./ui/Badge";

/** "Regular" (navy tint) or "Non-Regular" (grey), as in the design. */
export function CustomerTypeBadge({ customer, long = false }: { customer: Pick<Customer, "isRegular">; long?: boolean }) {
  if (!customer.isRegular) return <Badge tone="outline">{long ? "Non-Regular Customer" : "Non-Regular"}</Badge>;
  return <Badge tone="brand">{long ? "Regular Customer" : "Regular"}</Badge>;
}

/** 3% / 5% in green, 0% in grey. */
export function DiscountBadge({ percent }: { percent: number }) {
  return (
    <Badge tone={percent > 0 ? "discount" : "outline"} className="tabular-nums">
      {percent}%
    </Badge>
  );
}

export function PointsBadge({ points }: { points: number }) {
  return (
    <Badge tone="loyalty" className="tabular-nums">
      {formatNumber(points)} pts
    </Badge>
  );
}

const AVATAR_TONES = [
  "bg-[#dbe6f5] text-[#072f68]",
  "bg-[#e3f0d8] text-[#365f1a]",
  "bg-[#f6e7d3] text-[#7a4a10]",
  "bg-[#e9e1f3] text-[#4b2d7a]",
  "bg-[#d9eff1] text-[#0b5560]",
];

/** Initials avatar. The colour is stable per customer so the same person always looks the same. */
export function CustomerAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const dims = size === "lg" ? "size-[72px] text-2xl" : size === "sm" ? "size-8 text-xs" : "size-10 text-[13px]";
  const tone = AVATAR_TONES[[...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % AVATAR_TONES.length];
  return (
    <span aria-hidden className={`grid flex-none place-items-center rounded-full font-bold ${tone} ${dims}`}>
      {getInitials(name)}
    </span>
  );
}
