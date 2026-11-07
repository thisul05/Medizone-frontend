import { formatNumber, getInitials } from "@/lib/customers";
import type { Customer } from "@/types/customers";
import { Badge } from "./ui/Badge";

export function CustomerTypeBadge({ customer, showDiscount = false }: { customer: Pick<Customer, "isRegular" | "discountPercent">; showDiscount?: boolean }) {
  if (!customer.isRegular) return <Badge tone="outline">Non-regular</Badge>;
  if (!showDiscount) {
    return (
      <Badge tone="brand" icon="shield">
        Regular
      </Badge>
    );
  }
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <Badge tone="brand" icon="shield">
        Regular
      </Badge>
      <DiscountBadge percent={customer.discountPercent} />
    </span>
  );
}

/** Green pill, like the discount badges on medizone.lk. */
export function DiscountBadge({ percent }: { percent: number }) {
  return (
    <Badge tone="discount" className="tabular-nums">
      {percent}% off
    </Badge>
  );
}

export function PointsBadge({ points }: { points: number }) {
  return (
    <Badge tone="loyalty" icon="gift" className="tabular-nums">
      {formatNumber(points)} pts
    </Badge>
  );
}

export function CustomerAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const dims = size === "lg" ? "size-16 text-xl" : size === "sm" ? "size-8 text-xs" : "size-10 text-[13px]";
  return (
    <span aria-hidden className={`grid flex-none place-items-center rounded-full bg-(--logo-green) font-extrabold text-(--logo-navy) ${dims}`}>
      {getInitials(name)}
    </span>
  );
}
