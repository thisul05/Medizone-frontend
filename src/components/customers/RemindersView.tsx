"use client";

import { useMemo, useState } from "react";
import { branches } from "@/data/customers";
import { REMINDER_LAPSE_DAYS, REMINDER_WINDOW_DAYS, formatDate, matchesCustomerSearch } from "@/lib/customers";
import type { BranchId, RefillReminder, ReminderStatus } from "@/types/customers";
import { useCustomers } from "./CustomersProvider";
import { ReminderPreviewModal } from "./ReminderPreviewModal";
import { ReminderTable, STATUS_LABEL } from "./ReminderTable";
import { Button } from "./ui/Button";
import { Card, CardHeader, FootNote, KpiCard, KpiGrid } from "./ui/Card";
import { EmptyState } from "./ui/EmptyState";
import { InlineSelect, SearchInput, SelectField } from "./ui/Field";
import { Icon } from "./ui/Icon";
import { PageHeader } from "./ui/PageHeader";
import { Pagination, usePagination } from "./ui/Pagination";

type StatusFilter = "all" | ReminderStatus;
const PAGE_SIZE = 8;

export function RemindersView() {
  const { reminders, getCustomer, markReminderSent, notify, today } = useCustomers();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [branch, setBranch] = useState<BranchId | "all">("all");
  const [previewId, setPreviewId] = useState<string>();

  const preview = reminders.find((r) => r.id === previewId);
  const count = (s: ReminderStatus) => reminders.filter((r) => r.status === s).length;

  const visible = useMemo(
    () =>
      reminders.filter((r) => {
        if (status !== "all" && r.status !== status) return false;
        const c = getCustomer(r.customerId);
        if (branch !== "all" && c?.branchId !== branch) return false;
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (c ? matchesCustomerSearch(c, search) : false) || r.medicine.toLowerCase().includes(q);
      }),
    [reminders, getCustomer, search, status, branch],
  );
  const pager = usePagination(visible, PAGE_SIZE, `${search}|${status}|${branch}`);
  const filtered = search.trim() !== "" || status !== "all" || branch !== "all";

  function handleMarkSent(r: RefillReminder) {
    if (r.status === "sent") return;
    markReminderSent(r.id);
    setPreviewId(undefined);
    const name = getCustomer(r.customerId)?.name ?? "the customer";
    notify({
      tone: "success",
      title: "Reminder marked as sent",
      description: `${r.medicine} reminder for ${name}. Frontend simulation only: no message was sent.`,
    });
  }

  function clearFilters() {
    setSearch("");
    setStatus("all");
    setBranch("all");
  }

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Customers", href: "/customers" }, { label: "Refill Reminders" }]}
        title="Refill Reminder Management"
        description="Monitor upcoming medicine refills for registered customers"
        action={<span className="rounded-md bg-(--primary-tint) px-3 py-2 text-xs font-semibold text-(--heading)">Rule-Based Refill Prediction</span>}
      />

      <KpiGrid label="Reminder summary">
        <KpiCard label="Total Reminders" value={reminders.length} />
        <KpiCard label={`Due Within ${REMINDER_WINDOW_DAYS} Days`} value={count("due_soon")} />
        <KpiCard label="Overdue" value={count("overdue")} />
        <KpiCard label="Sent" value={count("sent")} />
      </KpiGrid>

      <div className="flex items-start gap-3 rounded-md bg-(--primary-tint) px-4 py-3 text-sm text-(--heading)" role="note">
        <span className="mt-0.5 grid size-5 flex-none place-items-center rounded-full bg-(--heading) text-white">
          <Icon name="info" size={13} strokeWidth={2.5} />
        </span>
        <p>
          <span className="font-medium">Expected Refill Date = Last Purchase Date + Days of Medicine Supply</span>
          <span className="block text-xs text-(--ink-muted)">
            A fixed rule, not an AI model. Due Soon: within {REMINDER_WINDOW_DAYS} days. Overdue: the date has passed (refills more than {REMINDER_LAPSE_DAYS} days late are treated as
            stopped and hidden). Sent reminders stay Sent.
          </span>
        </p>
      </div>

      <Card as="section" aria-labelledby="reminders-title" className="overflow-hidden">
        <CardHeader id="reminders-title" title="Refill Reminders" action={<span className="text-xs text-(--ink-muted)">As of {formatDate(today)}</span>} />
        <div className="flex flex-col gap-3 px-5 pb-4 lg:flex-row lg:items-center">
          <SearchInput label="Search by customer or medicine" placeholder="Search by customer or medicine" value={search} onChange={setSearch} className="lg:w-[46%] lg:max-w-[480px]" />
          <div className="flex flex-col gap-3 sm:flex-row lg:ml-auto">
            <SelectField
              label="Branch"
              labelHidden
              value={branch}
              onChange={(e) => setBranch(e.target.value as BranchId | "all")}
              options={[{ value: "all", label: "All branches" }, ...branches.map((b) => ({ value: b.id, label: b.name }))]}
              containerClassName="sm:w-48"
            />
            <InlineSelect
              label="Status"
              value={status}
              onChange={(v) => setStatus(v as StatusFilter)}
              options={[
                { value: "all", label: "All" },
                ...(["upcoming", "due_soon", "overdue", "sent"] as ReminderStatus[]).map((s) => ({ value: s, label: `${STATUS_LABEL[s]} (${count(s)})` })),
              ]}
              className="sm:w-[300px]"
            />
          </div>
        </div>
        {visible.length > 0 ? (
          <>
            <ReminderTable reminders={pager.visible} getCustomer={getCustomer} onPreview={(r) => setPreviewId(r.id)} onMarkSent={handleMarkSent} />
            <Pagination {...pager} onPageChange={pager.setPage} noun="reminders" />
          </>
        ) : (
          <EmptyState
            icon={reminders.length === 0 ? "checkCircle" : "search"}
            title={reminders.length === 0 ? "No refill reminders" : "No reminders match these filters"}
            description={reminders.length === 0 ? "No customer has a regular medicine due for a refill." : "Try another status, branch or search."}
            action={
              filtered ? (
                <Button variant="secondary" onClick={clearFilters}>
                  Show all reminders
                </Button>
              ) : undefined
            }
          />
        )}
      </Card>
      <FootNote>Frontend simulation only. No real messages are sent.</FootNote>

      <ReminderPreviewModal
        reminder={preview}
        customer={preview ? getCustomer(preview.customerId) : undefined}
        onClose={() => setPreviewId(undefined)}
        onMarkSent={handleMarkSent}
      />
    </>
  );
}
