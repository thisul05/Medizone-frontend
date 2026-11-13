"use client";

import { useMemo, useState } from "react";
import { branches } from "@/data/customers";
import { averageRating, formatRating, isLowRating, matchesCustomerSearch } from "@/lib/customers";
import type { BranchId, Rating } from "@/types/customers";
import { useCustomers } from "./CustomersProvider";
import { FeedbackCard } from "./FeedbackCard";
import { RatingSummary } from "./RatingSummary";
import { Button } from "./ui/Button";
import { Card, KpiCard, KpiGrid } from "./ui/Card";
import { EmptyState } from "./ui/EmptyState";
import { InlineSelect, SearchInput, SelectField } from "./ui/Field";
import { PageHeader } from "./ui/PageHeader";
import { Pagination, usePagination } from "./ui/Pagination";

type RatingFilter = "all" | "5" | "4" | "3" | "2" | "1";
const PAGE_SIZE = 6;

/** Staff view of customer feedback. Read-only: staff cannot edit or delete reviews. */
export function FeedbackView() {
  const { feedback, getCustomer } = useCustomers();
  const [rating, setRating] = useState<RatingFilter>("all");
  const [search, setSearch] = useState("");
  const [branch, setBranch] = useState<BranchId | "all">("all");

  // Summary figures always describe the complete dataset.
  const avg = averageRating(feedback);
  const fiveStar = feedback.filter((f) => f.rating === 5).length;
  const low = feedback.filter((f) => isLowRating(f.rating)).length;

  const visible = useMemo(
    () =>
      feedback
        .filter((f) => {
          if (rating !== "all" && f.rating !== Number(rating)) return false;
          if (branch !== "all" && f.branchId !== branch) return false;
          if (!search.trim()) return true;
          const c = getCustomer(f.customerId);
          return c ? matchesCustomerSearch(c, search) : false;
        })
        .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)),
    [feedback, getCustomer, rating, branch, search],
  );
  const pager = usePagination(visible, PAGE_SIZE, `${rating}|${branch}|${search}`);
  const filtered = rating !== "all" || branch !== "all" || search.trim() !== "";

  function resetFilters() {
    setRating("all");
    setBranch("all");
    setSearch("");
  }

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Customers", href: "/customers" }, { label: "Feedback" }]}
        title="Customer Feedback"
        description="View overall customer feedback submitted through Medizone.lk"
      />

      <KpiGrid label="Feedback summary">
        <KpiCard label="Total Feedback" value={feedback.length} />
        <KpiCard label="Average Rating" value={feedback.length ? `${formatRating(avg)}/5` : "–"} />
        <KpiCard label="Five-Star Reviews" value={fiveStar} />
        <KpiCard label="Low Ratings" value={low} hint="Rated 1 or 2 stars" />
      </KpiGrid>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(300px,390px)_1fr]">
        <div className="flex flex-col gap-4 lg:sticky lg:top-6">
          <RatingSummary
            feedback={feedback}
            selected={rating === "all" ? "all" : (Number(rating) as Rating)}
            onSelect={(r) => setRating(r === "all" ? "all" : (String(r) as RatingFilter))}
          />
          <div className="flex flex-col gap-4 text-xs text-(--ink-muted)">
            <p>Feedback submitted by registered customers through Medizone.lk</p>
            <p className="font-medium text-(--ink)">Read-only for staff</p>
          </div>
        </div>

        <section aria-labelledby="reviews-title" className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-baseline gap-4">
              <h2 id="reviews-title" className="text-base leading-6 font-bold text-(--heading)">
                Customer Reviews
              </h2>
              <span className="text-xs text-(--ink-muted)" aria-live="polite">
                {visible.length} {visible.length === 1 ? "review" : "reviews"} shown
              </span>
            </div>
            <InlineSelect
              label="Filter by Rating"
              value={rating}
              onChange={(v) => setRating(v as RatingFilter)}
              options={[
                { value: "all", label: "All Ratings" },
                { value: "5", label: "5 Stars" },
                { value: "4", label: "4 Stars" },
                { value: "3", label: "3 Stars" },
                { value: "2", label: "2 Stars" },
                { value: "1", label: "1 Star" },
              ]}
              className="w-full sm:w-[320px]"
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <SearchInput label="Search reviews by customer" placeholder="Search by customer name or phone" value={search} onChange={setSearch} className="sm:flex-1" />
            <SelectField
              label="Branch"
              labelHidden
              value={branch}
              onChange={(e) => setBranch(e.target.value as BranchId | "all")}
              options={[{ value: "all", label: "All branches" }, ...branches.map((b) => ({ value: b.id, label: b.name }))]}
              containerClassName="sm:w-48"
            />
          </div>

          {visible.length > 0 ? (
            <>
              <div className="flex flex-col gap-2">
                {pager.visible.map((entry) => (
                  <FeedbackCard key={entry.id} entry={entry} customer={getCustomer(entry.customerId)} />
                ))}
              </div>
              {pager.pageCount > 1 ? (
                <Card className="overflow-hidden">
                  <Pagination {...pager} onPageChange={pager.setPage} noun="reviews" variant="text" />
                </Card>
              ) : null}
            </>
          ) : (
            <Card>
              <EmptyState
                icon="message"
                title={feedback.length === 0 ? "No feedback yet" : "No reviews match this filter"}
                description={
                  feedback.length === 0
                    ? "Reviews that customers submit through Medizone.lk will appear here."
                    : rating !== "all"
                      ? `There are no ${rating}-star reviews${branch !== "all" || search.trim() ? " for this search" : ""}.`
                      : "Try another branch or search."
                }
                action={
                  filtered ? (
                    <Button variant="secondary" onClick={resetFilters}>
                      Reset filter
                    </Button>
                  ) : undefined
                }
              />
            </Card>
          )}
        </section>
      </div>
    </>
  );
}
