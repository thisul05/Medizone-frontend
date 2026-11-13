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
  /** underline: sections of one record (Figma). pill: compact filter choices. */
  variant?: "underline" | "pill";
  label: string;
  /** Prefix for tab/panel ids; panels use `${idPrefix}-panel-${id}`. */
  idPrefix: string;
  className?: string;
}

const underlineTab = "relative inline-flex h-11 flex-none cursor-pointer items-center gap-2 px-4 text-sm font-medium transition-colors";
const underlineOn = "font-semibold text-[#072f68] after:absolute after:right-0 after:-bottom-px after:left-0 after:h-[2px] after:bg-[#072f68]";
const underlineOff = "text-[#46566d] hover:text-[#072f68]";

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
          ? `inline-flex max-w-full gap-1 overflow-x-auto rounded-lg bg-gray-100 p-1 ${className}`
          : `flex gap-2 overflow-x-auto border-b border-gray-200 ${className}`
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
                ? `inline-flex h-8 flex-none cursor-pointer items-center gap-2 rounded-[6px] px-3 text-sm font-semibold transition-colors ${
                    active ? "bg-(--surface-raised) text-(--heading) shadow-(--shadow-1)" : "text-(--ink-muted) hover:text-(--ink)"
                  }`
                : `${underlineTab} ${active ? underlineOn : underlineOff}`
            }
          >
            {tab.label}
            {tab.count != null ? <span className="text-xs text-(--ink-muted) tabular-nums">({tab.count})</span> : null}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({ idPrefix, id, children }: { idPrefix: string; id: string; children: ReactNode }) {
  return (
    <div role="tabpanel" id={`${idPrefix}-panel-${id}`} aria-labelledby={`${idPrefix}-tab-${id}`} tabIndex={-1} className="focus-visible:outline-offset-4">
      {children}
    </div>
  );
}
