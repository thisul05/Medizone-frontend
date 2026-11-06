import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

export const cardClass = "rounded-lg border border-(--border) bg-(--surface-raised) shadow-(--shadow-1)";

interface CardProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
  "aria-labelledby"?: string;
}

export function Card({ children, className = "", as: Tag = "div", ...rest }: CardProps) {
  return (
    <Tag className={`${cardClass} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

interface CardHeaderProps {
  title: ReactNode;
  id?: string;
  description?: ReactNode;
  action?: ReactNode;
}

export function CardHeader({ title, id, description, action }: CardHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-(--border) px-5 py-4">
      <div className="min-w-0">
        <h2 id={id} className="text-lg leading-6 font-semibold text-(--ink)">
          {title}
        </h2>
        {description ? <p className="mt-0.5 text-[13px] leading-[18px] text-(--ink-muted)">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

type KpiTone = "neutral" | "success" | "warning" | "danger" | "loyalty";

const kpiIconTones: Record<KpiTone, string> = {
  neutral: "bg-(--primary-tint) text-(--primary-tint-ink)",
  success: "bg-(--success-bg) text-(--success-ink)",
  warning: "bg-(--warning-bg) text-(--warning-ink)",
  danger: "bg-(--danger-bg) text-(--danger-ink)",
  loyalty: "bg-(--loyalty-bg) text-(--loyalty-ink)",
};

interface KpiCardProps {
  label: string;
  value: ReactNode;
  unit?: string;
  icon?: IconName;
  tone?: KpiTone;
  hint?: ReactNode;
}

/** One headline number with its label and where it comes from. */
export function KpiCard({ label, value, unit, icon, tone = "neutral", hint }: KpiCardProps) {
  return (
    <div className={`${cardClass} flex min-w-0 flex-col gap-2 p-5`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] leading-[14px] font-bold tracking-[0.08em] text-(--ink-muted) uppercase">
          {label}
        </span>
        {icon ? (
          <span className={`grid size-8 place-items-center rounded-sm ${kpiIconTones[tone]}`}>
            <Icon name={icon} size={18} />
          </span>
        ) : null}
      </div>
      <div className="text-[30px] leading-9 font-semibold tracking-[-0.01em] text-(--ink) tabular-nums">
        {value}
        {unit ? <span className="ml-1.5 text-[15px] font-medium tracking-normal text-(--ink-muted)">{unit}</span> : null}
      </div>
      {hint ? <p className="text-[13px] leading-[18px] text-(--ink-muted)">{hint}</p> : null}
    </div>
  );
}

export function KpiGrid({ children, label }: { children: ReactNode; label: string }) {
  return (
    <section aria-label={label} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {children}
    </section>
  );
}
