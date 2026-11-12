"use client";

import { useMemo, useState } from "react";
import { branches, getBranchName } from "@/data/customers";
import { averageRating, formatRating } from "@/lib/customers";
import type { BranchId, Rating } from "@/types/customers";
import { useCustomers } from "./CustomersProvider";
import { matchesCustomerSearch } from "./CustomersView";
import { FeedbackCard } from "./FeedbackCard";
import { RatingSummary } from "./RatingSummary";
import { Button } from "./ui/Button";
import { Card, KpiCard, KpiGrid } from "./ui/Card";
import { EmptyState } from "./ui/EmptyState";
import { SearchInput, SelectField } from "./ui/Field";
import { PageHeader } from "./ui/PageHeader";
import { Tabs } from "./ui/Tabs";

type RatingFilter = "all" | "5" | "4" | "3" | "2" | "1";

// Staff view of feedback. Customers submit feedback themselves (customer dashboard, planned).
export function FeedbackView() {
  const { feedback, getCustomer } = useCustomers();
  const [search, setSearch] = useState("");
  const [rating, setRating] = useState<RatingFilter>("all");
  const [branch, setBranch] = useState<BranchId | "all">("all");

  const avg = averageRating(feedback);
  const positive = feedback.filter((f) => f.rating >= 4).length;
  const followUp = feedback.filter((f) => f.rating <= 2).length;

  const searched = useMemo(
    () =>
      feedback.filter((f) => {
        const c = getCustomer(f.customerId);
        return (!search.trim() || (c ? matchesCustomerSearch(c, search) : false)) && (branch === "all" || f.branchId === branch);
      }),
    [feedback, getCustomer, search, branch],
  );
  const countFor = (r: RatingFilter) => (r === "all" ? searched.length : searched.filter((f) => f.rating === Number(r)).length);
  const visible = searched.filter((f) => rating === "all" || f.rating === Number(rating)).sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));

  function clearFilters() {
    setSearch("");
    setRating("all");
    setBranch("all");
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        path="Pharmacy / Customers / Feedback"
        title="Customer feedback"
        description="Ratings and comments from customers. Low ratings are flagged for the branch pharmacist to follow up."
      />

      <KpiGrid label="Feedback summary">
        <KpiCard label="Total feedback" value={feedback.length} icon="message" hint="All branches, since July 2026" />
        <KpiCard label="Average rating" value={feedback.length ? formatRating(avg) : "–"} unit="/ 5" icon="star" tone="warning" hint="Recalculated with every new entry" />
        <KpiCard
          label="Positive (4–5 stars)"
          value={feedback.length ? `${Math.round((positive / feedback.length) * 100)}%` : "–"}
          icon="checkCircle"
          tone="success"
          hint={`${positive} of ${feedback.length} reviews`}
        />
        <KpiCard label="Needs follow-up" value={followUp} icon="alertCircle" tone="danger" hint="Rated 1 or 2 stars" />
      </KpiGrid>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[340px_1fr]">
        <div className="lg:sticky lg:top-8">
          <RatingSummary
            feedback={feedback}
            selected={rating === "all" ? "all" : (Number(rating) as Rating)}
            onSelect={(r) => setRating(r === "all" ? "all" : (String(r) as RatingFilter))}
          />
        </div>

        <section aria-labelledby="feedback-list-title" className="flex min-w-0 flex-col gap-4">
          <Card className="flex flex-col gap-3 p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="feedback-list-title" className="text-lg leading-6 font-semibold">
                Feedback
              </h2>
              <p className="text-[13px] text-(--ink-muted)" aria-live="polite">
                Showing {visible.length} of {feedback.length}
              </p>
            </div>
            <div className="flex flex-col gap-3 md:flex-row">
              <SearchInput label="Search feedback by customer" placeholder="Search by customer name or phone" value={search} onChange={setSearch} className="md:flex-1" />
              <SelectField
                label="Branch"
                labelHidden
                value={branch}
                onChange={(e) => setBranch(e.target.value as BranchId | "all")}
                options={[{ value: "all", label: "All branches" }, ...branches.map((b) => ({ value: b.id, label: getBranchName(b.id) }))]}
                containerClassName="md:w-48"
              />
            </div>
            <Tabs<RatingFilter>
              variant="pill"
              label="Filter by rating"
              idPrefix="rating-filter"
              value={rating}
              onChange={setRating}
              tabs={(["all", "5", "4", "3", "2", "1"] as RatingFilter[]).map((r) => ({
                id: r,
                label: r === "all" ? "All ratings" : `${r} ★`,
                count: countFor(r),
              }))}
            />
          </Card>

          {visible.length > 0 ? (
            <div className="flex flex-col gap-4">
              {visible.map((entry) => (
                <FeedbackCard key={entry.id} entry={entry} customer={getCustomer(entry.customerId)} />
              ))}
            </div>
          ) : (
            <Card>
              <EmptyState
                icon="message"
                title={feedback.length === 0 ? "No feedback yet" : "No feedback matches these filters"}
                description={
                  feedback.length === 0
                    ? "Feedback that customers submit will appear here."
                    : search.trim()
                      ? `No feedback from a customer matching "${search.trim()}".`
                      : "Try another rating or branch."
                }
                action={
                  feedback.length === 0 ? undefined : (
                    <Button variant="secondary" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  )
                }
              />
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
