"use client";

import { averageRating, formatRating, ratingDistribution } from "@/lib/customers";
import type { CustomerFeedback, Rating } from "@/types/customers";
import { StarRatingDisplay } from "./StarRating";
import { Card } from "./ui/Card";
import { Icon } from "./ui/Icon";

interface RatingSummaryProps {
  /** Always the complete dataset, so the overview does not change with the filter. */
  feedback: CustomerFeedback[];
  selected: Rating | "all";
  onSelect: (rating: Rating | "all") => void;
}

/** Rating Overview (Figma): big average, stars, review count and the 5→1 distribution bars. */
export function RatingSummary({ feedback, selected, onSelect }: RatingSummaryProps) {
  const avg = averageRating(feedback);
  const rows = ratingDistribution(feedback);

  return (
    <Card as="section" aria-labelledby="rating-summary-title" className="px-5 py-5">
      <h2 id="rating-summary-title" className="text-base leading-6 font-bold text-(--heading)">
        Rating Overview
      </h2>
      <div className="flex flex-col items-center gap-2 border-b border-(--border) pt-4 pb-5">
        <span className="text-[44px] leading-[52px] font-bold text-(--heading) tabular-nums">{feedback.length ? `${formatRating(avg)}/5` : "–"}</span>
        <StarRatingDisplay value={avg} size={24} />
        <span className="text-[13px] text-(--ink)">
          Based on {feedback.length} customer {feedback.length === 1 ? "review" : "reviews"}
        </span>
      </div>

      <ul className="mt-4 flex flex-col gap-1" aria-label="Rating distribution">
        {rows.map((row) => {
          const active = selected === row.rating;
          return (
            <li key={row.rating}>
              <button
                type="button"
                onClick={() => onSelect(active ? "all" : row.rating)}
                aria-pressed={active}
                aria-label={`${row.rating} stars: ${row.count} reviews, ${row.percent}%. ${active ? "Showing only these; select to show all." : "Select to show only these."}`}
                className={`grid w-full cursor-pointer grid-cols-[32px_1fr_32px_48px] items-center gap-3 rounded-[6px] px-1.5 py-1.5 text-left transition-colors ${
                  active ? "bg-(--primary-tint)" : "hover:bg-(--surface-hover)"
                }`}
              >
                <span className="flex items-center gap-1 text-[13px] font-medium tabular-nums">
                  {row.rating}
                  <Icon name="star" size={12} filled className="text-(--star)" />
                </span>
                <span className="h-2 overflow-hidden rounded-full bg-(--surface-sunken)">
                  <span className="block h-full rounded-full bg-(--rating-bar) transition-[width] duration-150" style={{ width: `${row.percent}%` }} />
                </span>
                <span className="text-right text-[13px] font-medium tabular-nums">{row.count}</span>
                <span className="text-right text-xs text-(--ink-muted) tabular-nums">{row.percent}%</span>
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
