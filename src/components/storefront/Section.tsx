import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, cx } from "@/components/shared";

/** Page container: 1280px max, 16px gutters on phone and 32px on desktop. */
export const CONTAINER = "mx-auto w-full max-w-content px-4 lg:px-8";

/** Overline text. Built from body-sm so nothing on the page is below 13px. */
export const OVERLINE = "text-body-sm font-bold uppercase tracking-[0.08em]";

/** On navy surfaces, makes the global focus ring white. */
export const NAV_FOCUS = "[--focus-ring:var(--focus-ring-nav)]";

interface SectionProps {
  id?: string;
  title: string;
  subtitle?: string;
  viewAll?: { href: string; label?: string };
  children: ReactNode;
  className?: string;
}

/** A home page section with an h2 title, optional subtitle and a View all link. */
export function Section({ id, title, subtitle, viewAll, children, className }: SectionProps) {
  const titleId = `${id ?? title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-title`;
  return (
    <section id={id} aria-labelledby={titleId} className={cx("scroll-mt-40 py-12 lg:py-16", className)}>
      <div className={CONTAINER}>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <div className="flex max-w-2xl flex-col gap-1">
            <h2 id={titleId} className="text-h1">{title}</h2>
            {subtitle && <p className="text-body-lg text-ink-muted">{subtitle}</p>}
          </div>
          {viewAll && (
            <Link href={viewAll.href} className="flex items-center gap-1 rounded-sm text-label text-link hover:underline">
              {viewAll.label ?? "View all"}
              <span className="sr-only"> {title.toLowerCase()}</span>
              <Icon name="arrow-right" size={16} />
            </Link>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}
