"use client";

import { useRef, type KeyboardEvent, type ReactNode } from "react";

export interface TabItem<T extends string> {
  id: T;
  label: ReactNode;
  count?: number;
}

interface TabsProps<T extends string> {
  tabs: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  /** underline: sections of one record. pill: 2–5 filter choices for a list. */
  variant?: "underline" | "pill";
  label: string;
  /** Prefix for tab/panel ids; panels use `${idPrefix}-panel-${id}`. */
  idPrefix: string;
  className?: string;
}

export function Tabs<T extends string>({ tabs, value, onChange, variant = "underline", label, idPrefix, className = "" }: TabsProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const pill = variant === "pill";

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = -1;
    if (e.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    if (next < 0) return;
    e.preventDefault();
    refs.current[next]?.focus();
    onChange(tabs[next].id);
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      className={
        pill
          ? `inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-(--surface-sunken) p-1 ${className}`
          : `flex gap-1 overflow-x-auto border-b border-(--border) ${className}`
      }
    >
      {tabs.map((tab, i) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${tab.id}`}
            aria-selected={active}
            aria-controls={pill ? undefined : `${idPrefix}-panel-${tab.id}`}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={
              pill
                ? `inline-flex h-8 flex-none cursor-pointer items-center gap-2 rounded-full px-3.5 text-sm font-semibold transition-colors ${
                    active ? "bg-(--surface-raised) text-(--primary-tint-ink) shadow-(--shadow-1)" : "text-(--ink-muted) hover:text-(--ink)"
                  }`
                : `relative inline-flex h-11 flex-none cursor-pointer items-center gap-2 px-3 text-sm font-semibold transition-colors ${
                    active
                      ? "text-(--primary-tint-ink) after:absolute after:right-2 after:-bottom-px after:left-2 after:h-[3px] after:rounded-t-[3px] after:bg-(--primary)"
                      : "text-(--ink-muted) hover:text-(--ink)"
                  }`
            }
          >
            {tab.label}
            {tab.count != null ? (
              <span
                className={`inline-grid h-5 min-w-[22px] place-items-center rounded-full px-1.5 text-xs tabular-nums ${
                  active ? "bg-(--primary-tint) text-(--primary-tint-ink)" : pill ? "bg-(--surface-raised) text-(--ink-muted)" : "bg-(--surface-sunken) text-(--ink-muted)"
                }`}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({ idPrefix, id, children }: { idPrefix: string; id: string; children: ReactNode }) {
  return (
    <div role="tabpanel" id={`${idPrefix}-panel-${id}`} aria-labelledby={`${idPrefix}-tab-${id}`} tabIndex={0} className="focus-visible:outline-offset-4">
      {children}
    </div>
  );
}
