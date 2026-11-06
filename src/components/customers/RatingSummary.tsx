"use client";

import { averageRating, formatRating, ratingDistribution } from "@/lib/customers";
import type { CustomerFeedback, Rating } from "@/types/customers";
import { StarRatingDisplay } from "./StarRating";
import { Card } from "./ui/Card";
import { Icon } from "./ui/Icon";

interface RatingSummaryProps {
  feedback: CustomerFeedback[];
  selected: Rating | "all";
  onSelect: (rating: Rating | "all") => void;
}

/** Average rating with five stars, plus the distribution as horizontal bars (one series, one hue). */
export function RatingSummary({ feedback, selected, onSelect }: RatingSummaryProps) {
  const avg = averageRating(feedback);
  const rows = ratingDistribution(feedback);
  const max = Math.max(1, ...rows.map((r) => r.count));

  return (
    <Card as="section" aria-labelledby="rating-summary-title" className="flex flex-col gap-5 p-5">
      <h2 id="rating-summary-title" className="text-lg leading-6 font-semibold">
        Rating overview
      </h2>
      <div className="flex items-center gap-4">
        <span className="text-[56px] leading-none font-bold tracking-[-0.02em] tabular-nums">{feedback.length ? formatRating(avg) : "–"}</span>
        <div className="flex flex-col gap-1">
          <StarRatingDisplay value={avg} size={22} />
          <span className="text-[13px] text-(--ink-muted)">
            Average of {feedback.length} {feedback.length === 1 ? "review" : "reviews"}
          </span>
        </div>
      </div>

      <div>
        <p className="mb-2 text-[11px] leading-[14px] font-bold tracking-[0.08em] text-(--ink-muted) uppercase">Rating distribution</p>
        <ul className="flex flex-col gap-1">
          {rows.map((row) => {
            const active = selected === row.rating;
            return (
              <li key={row.rating}>
                <button
                  type="button"
                  onClick={() => onSelect(active ? "all" : row.rating)}
                  aria-pressed={active}
                  title={`${row.rating} stars: ${row.count} reviews (${row.percent}%)`}
                  className={`grid w-full cursor-pointer grid-cols-[44px_1fr_64px] items-center gap-3 rounded-sm px-2 py-1.5 text-left transition-colors ${
                    active ? "bg-(--primary-tint)" : "hover:bg-(--surface-hover)"
                  }`}
                >
                  <span className="flex items-center gap-1 text-sm font-semibold tabular-nums">
                    {row.rating}
                    <Icon name="star" size={14} filled className="text-(--warning-solid)" />
                  </span>
                  <span className="h-2.5 overflow-hidden rounded-full bg-(--surface-sunken)">
                    <span
                      className="block h-full rounded-full bg-(--primary) transition-[width] duration-150"
                      style={{ width: `${(row.count / max) * 100}%` }}
                    />
                  </span>
                  <span className="text-right text-[13px] text-(--ink-muted) tabular-nums">
                    {row.count} · {row.percent}%
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-[13px] text-(--ink-muted)">Select a row to filter the list by that rating.</p>
      </div>
    </Card>
  );
}
