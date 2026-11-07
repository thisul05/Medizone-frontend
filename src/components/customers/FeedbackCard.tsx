import Link from "next/link";
import { getBranchName } from "@/data/customers";
import { RATING_LABELS, formatDate } from "@/lib/customers";
import type { Customer, CustomerFeedback } from "@/types/customers";
import { CustomerAvatar } from "./CustomerBadges";
import { StarRatingDisplay } from "./StarRating";
import { Badge, type BadgeTone } from "./ui/Badge";
import { cardClass } from "./ui/Card";

function ratingTone(rating: number): BadgeTone {
  if (rating >= 4) return "success";
  if (rating === 3) return "neutral";
  return "danger";
}

interface FeedbackCardProps {
  entry: CustomerFeedback;
  customer?: Customer;
  /** Hide the customer link on the customer's own profile. */
  hideCustomer?: boolean;
  isNew?: boolean;
}

export function FeedbackCard({ entry, customer, hideCustomer, isNew }: FeedbackCardProps) {
  const name = customer?.name ?? "Unknown customer";
  return (
    <article className={`${cardClass} flex flex-col gap-3 p-5 ${isNew ? "ring-2 ring-(--focus-ring)" : ""}`}>
      <div className="flex flex-wrap items-start gap-3">
        {!hideCustomer ? <CustomerAvatar name={name} /> : null}
        <div className="min-w-0 flex-1">
          {!hideCustomer ? (
            customer ? (
              <Link href={`/customers/${customer.id}`} className="font-semibold text-(--ink) underline-offset-2 hover:text-(--link) hover:underline">
                {name}
              </Link>
            ) : (
              <span className="font-semibold">{name}</span>
            )
          ) : null}
          <p className="text-[13px] leading-[18px] text-(--ink-muted)">
            {formatDate(entry.date)} · {getBranchName(entry.branchId)} · <span className="mz-mono">{entry.id}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isNew ? <Badge tone="info" icon="check">New</Badge> : null}
          <Badge tone={ratingTone(entry.rating)} icon={entry.rating <= 2 ? "alertCircle" : "star"}>
            {RATING_LABELS[entry.rating]}
          </Badge>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <StarRatingDisplay value={entry.rating} size={18} />
        <span className="text-sm font-semibold text-(--ink-muted) tabular-nums">{entry.rating} / 5</span>
      </div>
      <p className="text-(--ink)">{entry.comment}</p>
      {entry.rating <= 2 ? (
        <p className="flex items-center gap-1.5 text-[13px] font-medium text-(--danger-ink)">
          <span aria-hidden>•</span> Needs follow-up by the branch pharmacist
        </p>
      ) : null}
    </article>
  );
}
