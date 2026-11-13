import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

export type BadgeTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "transit"
  | "brand"
  | "loyalty"
  | "discount"
  | "outline";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-(--neutral-bg) text-(--neutral-ink)",
  info: "bg-(--info-bg) text-(--info-ink)",
  success: "bg-(--success-bg) text-(--success-ink)",
  warning: "bg-(--warning-bg) text-(--warning-ink)",
  danger: "bg-(--danger-bg) text-(--danger-ink)",
  transit: "bg-(--transit-bg) text-(--transit-ink)",
  // "Regular" in the design: pale navy tint with navy text
  brand: "bg-(--primary-tint) text-(--heading)",
  loyalty: "bg-(--loyalty-bg) text-(--loyalty-ink)",
  // 3% / 5% discount: pale green
  discount: "bg-(--success-bg) text-(--success-ink)",
  // "Non-Regular": grey
  outline: "bg-(--neutral-bg) text-(--ink-muted)",
};

interface BadgeProps {
  tone?: BadgeTone;
  icon?: IconName;
  children: ReactNode;
  className?: string;
}

/** Small rounded-rectangle label (Figma). Status always has words, never colour alone. */
export function Badge({ tone = "neutral", icon, children, className = "" }: BadgeProps) {
  return (
    <span className={`inline-flex h-6 items-center gap-1 rounded-[5px] px-2.5 text-xs font-semibold whitespace-nowrap ${tones[tone]} ${className}`}>
      {icon ? <Icon name={icon} size={13} strokeWidth={2.25} /> : null}
      {children}
    </span>
  );
}
