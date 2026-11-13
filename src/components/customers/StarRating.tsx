"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { RATING_LABELS, formatRating } from "@/lib/customers";
import type { Rating } from "@/types/customers";
import { Icon } from "./ui/Icon";

const STARS: Rating[] = [1, 2, 3, 4, 5];

/** Read-only stars. Supports fractions (e.g. an average of 4.2). */
export function StarRatingDisplay({ value, size = 16, className = "" }: { value: number; size?: number; className?: string }) {
  const percent = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <span role="img" aria-label={`Rated ${formatRating(value)} out of 5`} className={`relative inline-flex ${className}`}>
      <span className="flex gap-0.5 text-(--star)">
        {STARS.map((s) => (
          <Icon key={s} name="star" size={size} strokeWidth={1.5} />
        ))}
      </span>
      <span className="absolute inset-y-0 left-0 flex gap-0.5 overflow-hidden text-(--star)" style={{ width: `${percent}%` }}>
        {STARS.map((s) => (
          <Icon key={s} name="star" size={size} strokeWidth={1.5} filled />
        ))}
      </span>
    </span>
  );
}

interface StarRatingInputProps {
  value: Rating | 0;
  onChange: (value: Rating) => void;
  label: string;
  error?: string;
  id: string;
}

/** Interactive 1–5 star picker: click, hover to preview, or use the arrow keys. */
export function StarRatingInput({ value, onChange, label, error, id }: StarRatingInputProps) {
  const [hover, setHover] = useState<Rating | 0>(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const shown = hover || value;

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, star: Rating) {
    let next: number = star;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = Math.min(5, star + 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = Math.max(1, star - 1);
    else return;
    e.preventDefault();
    onChange(next as Rating);
    refs.current[next - 1]?.focus();
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span id={`${id}-label`} className="text-sm leading-[18px] font-semibold text-(--ink)">
        {label}
        <span className="text-(--danger-ink)" aria-hidden>
          {" "}
          *
        </span>
      </span>
      <div className="flex flex-wrap items-center gap-3">
        <div
          role="radiogroup"
          aria-labelledby={`${id}-label`}
          aria-describedby={error ? `${id}-msg` : undefined}
          aria-invalid={error ? true : undefined}
          id={id}
          className="flex gap-1"
          onMouseLeave={() => setHover(0)}
        >
          {STARS.map((star) => {
            const on = star <= shown;
            const checked = star === value;
            return (
              <button
                key={star}
                ref={(el) => {
                  refs.current[star - 1] = el;
                }}
                type="button"
                role="radio"
                aria-checked={checked}
                aria-label={`${star} star${star > 1 ? "s" : ""}, ${RATING_LABELS[star]}`}
                tabIndex={checked || (value === 0 && star === 1) ? 0 : -1}
                onClick={() => onChange(star)}
                onMouseEnter={() => setHover(star)}
                onKeyDown={(e) => onKeyDown(e, star)}
                className={`grid size-10 cursor-pointer place-items-center rounded-md transition-colors hover:bg-(--surface-hover) ${
                  on ? "text-(--warning-solid)" : "text-(--border-strong)"
                }`}
              >
                <Icon name="star" size={28} strokeWidth={1.5} filled={on} />
              </button>
            );
          })}
        </div>
        <span className="text-sm font-semibold text-(--ink-muted)" aria-live="polite">
          {shown ? `${shown} of 5 · ${RATING_LABELS[shown as Rating]}` : "Select a rating"}
        </span>
      </div>
      {error ? (
        <p id={`${id}-msg`} className="flex items-center gap-1 text-[13px] leading-[18px] font-medium text-(--danger-ink)">
          <Icon name="alertCircle" size={14} />
          {error}
        </p>
      ) : null}
    </div>
  );
}
