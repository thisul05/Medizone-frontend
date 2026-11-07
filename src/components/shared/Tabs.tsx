"use client";

import { useRef, type KeyboardEvent } from "react";
import { cx } from "./cx";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: TabItem[];
  value: string;
  onChange: (id: string) => void;
  variant?: "underline" | "pill";
  /** Accessible name for the tab list. */
  label?: string;
  /** Prefix for tab and panel ids: tabs get `${idBase}-tab-${id}`, panels should use `${idBase}-panel-${id}`. */
  idBase?: string;
  className?: string;
}

export function Tabs({ tabs, value, onChange, variant = "underline", label, idBase = "tabs", className }: TabsProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(e: KeyboardEvent, index: number) {
    let next = -1;
    if (e.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    if (next < 0) return;
    e.preventDefault();
    onChange(tabs[next].id);
    refs.current[next]?.focus();
  }

  const pill = variant === "pill";
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cx(pill ? "flex gap-1 rounded-pill bg-surface-sunken p-1" : "flex gap-6 border-b border-line", className)}
    >
      {tabs.map((t, i) => {
        const selected = t.id === value;
        return (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            id={`${idBase}-tab-${t.id}`}
            role="tab"
            type="button"
            aria-selected={selected}
            aria-controls={`${idBase}-panel-${t.id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(t.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cx(
              "inline-flex items-center justify-center gap-2 text-label transition-colors duration-150",
              pill
                ? cx("h-control-sm flex-1 rounded-pill px-4", selected ? "bg-surface-raised text-primary-tint-ink shadow-1" : "text-ink-muted hover:text-ink")
                : cx("-mb-px h-control-md border-b-2", selected ? "border-primary text-primary-tint-ink" : "border-transparent text-ink-muted hover:text-ink"),
            )}
          >
            {t.label}
            {t.count !== undefined && (
              <span className="rounded-pill bg-neutral-bg px-1.5 text-body-sm font-medium text-neutral-ink">{t.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
