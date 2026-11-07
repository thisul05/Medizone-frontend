import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";
import { cx } from "./cx";

export type Tone = "info" | "success" | "warning" | "danger" | "neutral" | "transit";

export const TONE_ICON: Record<Tone, IconName> = {
  info: "info",
  success: "circle-check",
  warning: "alert",
  danger: "alert-circle",
  neutral: "info",
  transit: "truck",
};

const TONE_CLASSES: Record<Tone, string> = {
  info: "bg-info-bg text-info-ink",
  success: "bg-success-bg text-success-ink",
  warning: "bg-warning-bg text-warning-ink",
  danger: "bg-danger-bg text-danger-ink",
  neutral: "bg-neutral-bg text-neutral-ink",
  transit: "bg-transit-bg text-transit-ink",
};

interface AlertProps {
  tone?: Tone;
  title?: string;
  icon?: IconName;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
  id?: string;
}

export function Alert({ tone = "info", title, icon, action, children, className, id }: AlertProps) {
  return (
    <div
      id={id}
      role={tone === "danger" ? "alert" : "status"}
      className={cx("flex items-start gap-3 rounded-md p-4", TONE_CLASSES[tone], className)}
    >
      <Icon name={icon ?? TONE_ICON[tone]} size={20} className="mt-px" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {title && <p className="text-label">{title}</p>}
        {children && <div className="text-body-sm text-ink">{children}</div>}
        {action && <div className="mt-1">{action}</div>}
      </div>
    </div>
  );
}
