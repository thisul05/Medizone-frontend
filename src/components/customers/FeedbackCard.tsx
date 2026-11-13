import Link from "next/link";
import { formatDate, isLowRating } from "@/lib/customers";
import type { Customer, CustomerFeedback } from "@/types/customers";
import { CustomerAvatar } from "./CustomerBadges";
import { StarRatingDisplay } from "./StarRating";

interface FeedbackCardProps {
  entry: CustomerFeedback;
  customer?: Customer;
  /**
   * list: Customer Feedback page (avatar, name and date, stars on the right).
   * profile: Customer Profile tab (stars and date on top, customer and order underneath).
   */
  variant?: "list" | "profile";
}

/** One read-only review. Staff cannot edit or delete feedback. */
export function FeedbackCard({ entry, customer, variant = "list" }: FeedbackCardProps) {
  const name = customer?.name ?? "Unknown customer";
  const low = isLowRating(entry.rating);

  if (variant === "profile") {
    return (
      <article className="rounded-md border border-(--border) bg-(--surface-page) px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <StarRatingDisplay value={entry.rating} size={20} />
            <span className="text-sm font-semibold text-(--heading) tabular-nums">{entry.rating}/5</span>
          </div>
          <span className="text-[13px] text-(--ink-muted)">{formatDate(entry.date)}</span>
        </div>
        <p className="mt-3 text-sm leading-6 text-(--ink)">{entry.comment}</p>
        <p className="mt-3 text-xs text-(--ink-muted)">
          {name} · {entry.orderId ? `Order ${entry.orderId}` : "General feedback"}
        </p>
      </article>
    );
  }

  return (
    <article className="rounded-md border border-(--border) bg-(--surface-raised) px-4 py-3">
      <div className="flex items-start gap-3">
        <CustomerAvatar name={name} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
            <div className="min-w-0">
              {customer ? (
                <Link href={`/customers/${customer.id}?tab=feedback`} className="text-sm font-semibold text-(--ink) underline-offset-2 hover:text-(--heading) hover:underline">
                  {name}
                </Link>
              ) : (
                <span className="text-sm font-semibold">{name}</span>
              )}
              <p className="text-xs text-(--ink-muted)">{formatDate(entry.date)}</p>
            </div>
            <div className="flex items-center gap-4">
              <StarRatingDisplay value={entry.rating} size={17} />
              <span className="w-7 text-right text-xs font-medium text-(--ink) tabular-nums">{entry.rating}/5</span>
            </div>
          </div>
          <p className="mt-1.5 text-[13px] leading-[19px] text-(--ink)">{entry.comment}</p>
          {low ? <p className="mt-1.5 text-xs font-medium text-(--danger-ink)">Low rating · follow up with the branch pharmacist</p> : null}
        </div>
      </div>
    </article>
  );
}
