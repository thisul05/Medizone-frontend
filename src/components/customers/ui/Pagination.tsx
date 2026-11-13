"use client";

import { useState } from "react";
import { Icon } from "./Icon";

/**
 * Page state for a list. The page goes back to 1 whenever `resetKey` changes (new search or
 * filter), and is clamped when the list shrinks.
 */
export function usePagination<T>(items: T[], pageSize: number, resetKey = "") {
  const [state, setState] = useState({ key: resetKey, page: 1 });
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const requested = state.key === resetKey ? state.page : 1;
  const page = Math.min(requested, pageCount);
  return {
    page,
    pageCount,
    pageSize,
    total: items.length,
    visible: items.slice((page - 1) * pageSize, page * pageSize),
    setPage: (next: number) => setState({ key: resetKey, page: Math.max(1, Math.min(next, pageCount)) }),
  };
}

function pageNumbers(page: number, count: number): (number | "gap")[] {
  if (count <= 5) return Array.from({ length: count }, (_, i) => i + 1);
  const set = new Set([1, count, page - 1, page, page + 1].filter((n) => n >= 1 && n <= count));
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) out.push("gap");
    out.push(n);
  });
  return out;
}

interface PaginationProps {
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  /** Plural noun for "Showing 1–8 of 12 customers". */
  noun: string;
  /** Previous/Next as words (profile tables) or an icon + "Next" (customer list). */
  variant?: "icon" | "text";
}

const boxBase = "inline-flex h-8 min-w-8 items-center justify-center gap-1 rounded-[6px] border px-2.5 text-[13px] font-semibold transition-colors";
const boxIdle = "cursor-pointer border-(--border) bg-(--surface-raised) text-(--ink) hover:bg-(--surface-hover) disabled:cursor-not-allowed disabled:text-(--ink-disabled) disabled:hover:bg-(--surface-raised)";

/** "Showing 1–8 of 12 customers" with Previous, page numbers and Next (Figma). */
export function Pagination({ page, pageCount, pageSize, total, onPageChange, noun, variant = "icon" }: PaginationProps) {
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);
  return (
    <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[13px] text-(--ink-muted)" aria-live="polite">
        Showing {first}–{last} of {total} {noun}
      </p>
      {pageCount > 1 ? (
        <nav aria-label={`${noun} pages`} className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => onPageChange(page - 1)} disabled={page === 1} className={`${boxBase} ${boxIdle} ${variant === "text" ? "px-3.5" : ""}`} aria-label="Previous page">
            {variant === "text" ? "Previous" : <Icon name="chevronLeft" size={16} />}
          </button>
          {pageNumbers(page, pageCount).map((n, i) =>
            n === "gap" ? (
              <span key={`gap-${i}`} className="px-1 text-(--ink-muted)" aria-hidden>
                …
              </span>
            ) : (
              <button
                key={n}
                type="button"
                onClick={() => onPageChange(n)}
                aria-label={`Page ${n}`}
                aria-current={n === page ? "page" : undefined}
                className={`${boxBase} ${n === page ? "border-(--primary) bg-(--primary) text-(--on-primary)" : boxIdle}`}
              >
                {n}
              </button>
            ),
          )}
          <button type="button" onClick={() => onPageChange(page + 1)} disabled={page === pageCount} className={`${boxBase} ${boxIdle} px-3.5`} aria-label="Next page">
            Next
            {variant === "icon" ? <Icon name="chevronRight" size={16} /> : null}
          </button>
        </nav>
      ) : null}
    </div>
  );
}
