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
  brand: "bg-(--primary-tint) text-(--primary-tint-ink)",
  loyalty: "bg-(--loyalty-bg) text-(--loyalty-ink)",
  // Solid green pill like the % badges on medizone.lk (navy text keeps 5:1 contrast).
  discount: "bg-(--brand-green) text-(--on-brand-green) font-bold",
  outline: "bg-(--surface-raised) text-(--ink-muted) shadow-[inset_0_0_0_1px_var(--border-strong)]",
};

interface BadgeProps {
  tone?: BadgeTone;
  icon?: IconName;
  children: ReactNode;
  className?: string;
}

/** Status is never colour alone: every badge has words, and usually an icon. */
export function Badge({ tone = "neutral", icon, children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex h-6 items-center gap-1 rounded-full pr-2.5 pl-2 text-xs font-semibold whitespace-nowrap ${tones[tone]} ${className}`}
    >
      {icon ? <Icon name={icon} size={14} strokeWidth={2.25} /> : null}
      {children}
    </span>
  );
}
