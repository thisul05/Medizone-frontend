import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";
import { cx } from "./cx";

export type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger" | "transit" | "brand" | "loyalty";
export type BadgeVariant = "soft" | "solid" | "outline";

const SOFT: Record<BadgeTone, string> = {
  neutral: "bg-neutral-bg text-neutral-ink",
  info: "bg-info-bg text-info-ink",
  success: "bg-success-bg text-success-ink",
  warning: "bg-warning-bg text-warning-ink",
  danger: "bg-danger-bg text-danger-ink",
  transit: "bg-transit-bg text-transit-ink",
  brand: "bg-primary-tint text-primary-tint-ink",
  loyalty: "bg-loyalty-bg text-loyalty-ink",
};

const SOLID: Record<BadgeTone, string> = {
  neutral: "bg-neutral-solid text-on-solid",
  info: "bg-info-solid text-on-solid",
  success: "bg-success-solid text-on-solid",
  warning: "bg-warning-solid text-on-solid",
  danger: "bg-danger-solid text-on-solid",
  transit: "bg-transit-solid text-on-solid",
  brand: "bg-primary text-primary-on",
  loyalty: "bg-loyalty-ink text-loyalty-bg",
};

const OUTLINE: Record<BadgeTone, string> = {
  neutral: "border border-neutral-solid text-neutral-ink",
  info: "border border-info-solid text-info-ink",
  success: "border border-success-solid text-success-ink",
  warning: "border border-warning-solid text-warning-ink",
  danger: "border border-danger-solid text-danger-ink",
  transit: "border border-transit-solid text-transit-ink",
  brand: "border border-primary text-primary-tint-ink",
  loyalty: "border border-loyalty-ink text-loyalty-ink",
};

const DOT: Record<BadgeTone, string> = {
  neutral: "bg-neutral-solid",
  info: "bg-info-solid",
  success: "bg-success-solid",
  warning: "bg-warning-solid",
  danger: "bg-danger-solid",
  transit: "bg-transit-solid",
  brand: "bg-primary",
  loyalty: "bg-loyalty-ink",
};

interface BadgeProps {
  tone?: BadgeTone;
  variant?: BadgeVariant;
  icon?: IconName;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

export function Badge({ tone = "neutral", variant = "soft", icon, dot, children, className }: BadgeProps) {
  const palette = variant === "solid" ? SOLID : variant === "outline" ? OUTLINE : SOFT;
  return (
    <span
      className={cx(
        "inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-xs font-semibold shrink-0",
        palette[tone],
        className,
      )}
    >
      {dot && <span aria-hidden className={cx("size-1.5 rounded-full shrink-0", variant === "solid" ? "bg-on-solid" : DOT[tone])} />}
      {icon && <Icon name={icon} size={14} />}
      {children}
    </span>
  );
}
