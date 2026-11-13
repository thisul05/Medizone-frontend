import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

/** White card with a subtle grey border matching the rest of Medizone. */
export const cardClass = "rounded-xl border border-gray-200/80 bg-white shadow-xs";

interface CardProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
  "aria-labelledby"?: string;
  "aria-label"?: string;
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
  icon?: IconName;
}

/** Navy card title with an optional muted subtitle and a right-hand slot (search, count, note). */
export function CardHeader({ title, id, description, action }: CardHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5 pb-4">
      <div className="min-w-0">
        <h2 id={id} className="text-lg leading-6 font-bold text-[#072f68]">
          {title}
        </h2>
        {description ? <p className="mt-1 text-[13px] leading-[18px] text-[#46566d]">{description}</p> : null}
      </div>
      {action ? <div className="flex min-w-0 items-center gap-3">{action}</div> : null}
    </div>
  );
}

interface KpiCardProps {
  label: string;
  value: ReactNode;
  unit?: string;
  hint?: ReactNode;
}

/** Summary card: muted label, large bold navy number. */
export function KpiCard({ label, value, unit, hint }: KpiCardProps) {
  return (
    <div className={`${cardClass} flex min-w-0 flex-col px-5 py-5`}>
      <span className="text-xs font-semibold tracking-wider text-[#46566d] uppercase">{label}</span>
      <div className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#0e1b2e] tabular-nums">
        {value}
        {unit ? <span className="ml-1 text-base font-semibold">{unit}</span> : null}
      </div>
      {hint ? <p className="mt-1 text-xs text-[#46566d]">{hint}</p> : null}
    </div>
  );
}

export function KpiGrid({ children, label, columns = 4 }: { children: ReactNode; label: string; columns?: 3 | 4 }) {
  return (
    <section aria-label={label} className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${columns === 3 ? "lg:grid-cols-3" : "xl:grid-cols-4"}`}>
      {children}
    </section>
  );
}

/** Small muted note under a card. */
export function FootNote({ children }: { children: ReactNode }) {
  return <p className="-mt-2 text-xs leading-4 text-[#46566d]">{children}</p>;
}
