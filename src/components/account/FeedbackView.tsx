"use client";

import { useState } from "react";
import { Badge, Button, cx } from "@/components/shared";
import { branchName } from "@/data/branches";
import { formatDate } from "@/lib/format";
import { useAccount } from "@/lib/account/use-account";
import { FeedbackComposer } from "./FeedbackComposer";
import { EmptyState, PANEL, PageTitle, Pagination, Stars, StatCard, usePaged } from "./ui";

const WORDS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

export function FeedbackView() {
  const account = useAccount();
  const [writing, setWriting] = useState(false);
  const paged = usePaged(account?.feedback ?? [], 6);
  if (!account) return null;
  const list = account.feedback;
  const average = list.length ? list.reduce((s, f) => s + f.rating, 0) / list.length : 0;

  return (
    <>
      <PageTitle
        title="My Feedback"
        description="Your reviews of Medizone Pharmacy's service."
        actions={<Button icon="star" onClick={() => setWriting(true)}>Write Feedback</Button>}
      />

      {list.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard icon="message" label="Feedback submitted" value={list.length} />
          <StatCard icon="star" tone="warning" label="Your average rating" value={`${average.toFixed(1)} / 5`} hint={<Stars rating={Math.round(average)} />} />
        </div>
      )}

      {list.length === 0 ? (
        <div className={PANEL}>
          <EmptyState icon="message" title="No feedback yet" action={<Button icon="star" onClick={() => setWriting(true)}>Write Feedback</Button>}>
            Tell us how we did. Your feedback helps our pharmacists improve the service at every branch.
          </EmptyState>
        </div>
      ) : (
        <section aria-label="Submitted feedback" className={cx(PANEL, "overflow-hidden")}>
          <ul className="divide-y divide-line">
            {paged.slice.map((f) => (
              <li key={f.id} className="flex flex-col gap-2 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Stars rating={f.rating} size={18} />
                    <span className="mz-label">{WORDS[f.rating]}</span>
                  </div>
                  <div className="flex items-center gap-2 mz-body-sm text-ink-muted">
                    <Badge tone="neutral">{branchName(f.branchId)} branch</Badge>
                    <time dateTime={f.date}>{formatDate(f.date)}</time>
                  </div>
                </div>
                <p className="text-ink">{f.comment}</p>
              </li>
            ))}
          </ul>
          <Pagination {...paged} onChange={paged.setPage} noun="reviews" />
        </section>
      )}

      <FeedbackComposer account={account} open={writing} onClose={() => setWriting(false)} />
    </>
  );
}
