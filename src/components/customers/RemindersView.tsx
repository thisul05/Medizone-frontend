"use client";

import { useMemo, useState } from "react";
import { branches, getBranchName } from "@/data/customers";
import { PROTOTYPE_TODAY, REMINDER_LAPSE_DAYS, REMINDER_WINDOW_DAYS, formatDate } from "@/lib/customers";
import type { BranchId, RefillReminder, ReminderStatus } from "@/types/customers";
import { useCustomers } from "./CustomersProvider";
import { matchesCustomerSearch } from "./CustomersView";
import { ReminderPreviewModal, type ReminderChannel } from "./ReminderPreviewModal";
import { ReminderTable } from "./ReminderTable";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { Card, KpiCard, KpiGrid } from "./ui/Card";
import { EmptyState } from "./ui/EmptyState";
import { SearchInput, SelectField } from "./ui/Field";
import { Icon } from "./ui/Icon";
import { PageHeader } from "./ui/PageHeader";
import { Tabs } from "./ui/Tabs";

type StatusFilter = "to_send" | ReminderStatus | "all";

const FILTER_LABELS: Record<StatusFilter, string> = {
  to_send: "To send",
  due_soon: "Due within 7 days",
  overdue: "Overdue",
  upcoming: "Upcoming",
  sent: "Sent",
  all: "All",
};

function matchesStatus(r: RefillReminder, f: StatusFilter): boolean {
  if (f === "all") return true;
  if (f === "to_send") return r.status === "due_soon" || r.status === "overdue";
  return r.status === f;
}

export function RemindersView() {
  const { reminders, getCustomer, markReminderSent, notify } = useCustomers();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("to_send");
  const [branch, setBranch] = useState<BranchId | "all">("all");
  const [previewId, setPreviewId] = useState<string>();

  const preview = reminders.find((r) => r.id === previewId);
  const count = (s: ReminderStatus) => reminders.filter((r) => r.status === s).length;

  const searched = useMemo(
    () =>
      reminders.filter((r) => {
        const c = getCustomer(r.customerId);
        if (branch !== "all" && c?.branchId !== branch) return false;
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (c ? matchesCustomerSearch(c, search) : false) || r.medicine.toLowerCase().includes(q);
      }),
    [reminders, getCustomer, search, branch],
  );
  const visible = searched.filter((r) => matchesStatus(r, status));

  function handleMarkSent(r: RefillReminder, channel?: ReminderChannel) {
    markReminderSent(r.id);
    setPreviewId(undefined);
    const name = getCustomer(r.customerId)?.name ?? "the customer";
    const via = channel === "whatsapp" ? " by WhatsApp" : channel === "sms" ? " by SMS" : "";
    notify({
      tone: "success",
      title: "Reminder marked as sent",
      description: `${r.medicine} reminder for ${name}${via}. Simulated only: no message was sent.`,
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
        eyebrow={
          <Badge tone="loyalty" icon="refresh">
            Rule-based refill prediction
          </Badge>
        }
        title="Refill reminders"
        description="Customers whose regular medicines are expected to run out soon, so the branch can remind them to refill."
      />

      <div className="flex items-start gap-3 rounded-md bg-(--info-bg) px-4 py-3.5 text-(--info-ink)" role="note">
        <Icon name="info" size={20} className="mt-px" />
        <div className="text-sm leading-5 text-(--ink)">
          <p className="font-bold text-(--info-ink)">How the prediction works</p>
          <p className="mt-0.5">
            <strong>Expected refill date = purchase date + days of supply</strong>, using each customer&apos;s latest purchase of a medicine.
            Refills due within {REMINDER_WINDOW_DAYS} days are highlighted. Refills more than {REMINDER_LAPSE_DAYS} days late are treated as
            stopped and hidden. This is a fixed rule, not a machine learning model. Dates are as of {formatDate(PROTOTYPE_TODAY)}.
          </p>
        </div>
      </div>

      <KpiGrid label="Reminder summary">
        <KpiCard label="Due within 7 days" value={count("due_soon")} icon="clock" tone="warning" hint="Not yet reminded" />
        <KpiCard label="Overdue" value={count("overdue")} icon="alertCircle" tone="danger" hint={`Up to ${REMINDER_LAPSE_DAYS} days past the refill date`} />
        <KpiCard label="Reminders sent" value={count("sent")} icon="send" hint="Marked as sent in this prototype" />
        <KpiCard label="Upcoming" value={count("upcoming")} icon="calendar" tone="loyalty" hint={`More than ${REMINDER_WINDOW_DAYS} days away`} />
      </KpiGrid>

      <Card as="section" aria-labelledby="reminders-title" className="overflow-hidden">
        <div className="flex flex-wrap items-baseline justify-between gap-2 px-5 pt-4">
          <h2 id="reminders-title" className="text-lg leading-6 font-semibold">
            Reminder list
          </h2>
          <p className="text-[13px] text-(--ink-muted)" aria-live="polite">
            Showing {visible.length} of {reminders.length}
          </p>
        </div>
        <div className="flex flex-col gap-3 border-b border-(--border) px-5 py-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <SearchInput label="Search reminders" placeholder="Customer name, phone or medicine" value={search} onChange={setSearch} className="md:w-80" />
            <SelectField
              label="Branch"
              labelHidden
              value={branch}
              onChange={(e) => setBranch(e.target.value as BranchId | "all")}
              options={[{ value: "all", label: "All branches" }, ...branches.map((b) => ({ value: b.id, label: getBranchName(b.id) }))]}
              containerClassName="md:ml-auto md:w-48"
            />
          </div>
          <Tabs<StatusFilter>
            variant="pill"
            label="Reminder status"
            idPrefix="reminder-status"
            value={status}
            onChange={setStatus}
            tabs={(["to_send", "due_soon", "overdue", "upcoming", "sent", "all"] as StatusFilter[]).map((f) => ({
              id: f,
              label: FILTER_LABELS[f],
              count: searched.filter((r) => matchesStatus(r, f)).length,
            }))}
          />
        </div>
        {visible.length > 0 ? (
          <ReminderTable reminders={visible} getCustomer={getCustomer} onPreview={(r) => setPreviewId(r.id)} onMarkSent={handleMarkSent} />
        ) : (
          <EmptyState
            icon={status === "to_send" ? "checkCircle" : "search"}
            title={status === "to_send" && !search.trim() && branch === "all" ? "All due reminders are sent" : "No reminders match these filters"}
            description={
              status === "to_send" && !search.trim() && branch === "all"
                ? "Nobody is due for a refill in the next 7 days without a reminder."
                : "Try another status, branch or search."
            }
            action={
              <Button variant="secondary" onClick={clearFilters}>
                Show all reminders
              </Button>
            }
          />
        )}
      </Card>

      <ReminderPreviewModal
        reminder={preview}
        customer={preview ? getCustomer(preview.customerId) : undefined}
        onClose={() => setPreviewId(undefined)}
        onMarkSent={handleMarkSent}
      />
    </>
  );
}
