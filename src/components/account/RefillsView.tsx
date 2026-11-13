"use client";

import { useState } from "react";
import { Alert, Badge, Button, cx } from "@/components/shared";
import { branchName } from "@/data/branches";
import { site } from "@/data/site";
import { formatDate } from "@/lib/format";
import { DUE_SOON_DAYS, REFILL_STATUS, describeDaysRemaining } from "@/lib/account/rules";
import { useAccount, useToday } from "@/lib/account/use-account";
import type { RefillReminder } from "@/types/account";
import { DetailList, EmptyState, Modal, PANEL, PageTitle, StatCard, TABLE_HEAD, TD, TH } from "./ui";

function RefillDetails({ reminder, onClose }: { reminder: RefillReminder | null; onClose: () => void }) {
  const status = reminder ? REFILL_STATUS[reminder.status] : null;
  return (
    <Modal
      open={!!reminder}
      onClose={onClose}
      title="Refill Details"
      icon="pill"
      footer={<Button onClick={onClose}>Close</Button>}
    >
      {reminder && status && (
        <div className="flex flex-col gap-4">
          <DetailList
            className="-my-2.5"
            rows={[
              ["Medicine", <span key="m" className="mz-label">{reminder.medicine}</span>],
              ["Quantity bought", reminder.quantity],
              ["Last purchase date", formatDate(reminder.purchaseDate)],
              ["Days supply", `${reminder.daysSupply} days`],
              ["Estimated refill date", formatDate(reminder.refillDate)],
              ["Days remaining", describeDaysRemaining(reminder.daysRemaining)],
              ["Status", <Badge key="s" tone={status.tone} dot>{status.label}</Badge>],
              ["Branch", branchName(reminder.branchId)],
            ]}
          />
          {reminder.prescriptionOnly ? (
            <Alert tone="warning" title="Prescription medicine">
              We never place orders for prescription medicines automatically. To refill, send your prescription on WhatsApp, call {site.phone}, or visit your branch.
            </Alert>
          ) : (
            <Alert tone="info">You can buy this at any branch, or look for it in the online shop.</Alert>
          )}
          <p className="mz-body-sm text-ink-muted">This date is an estimate: last purchase date plus the number of days the quantity should last.</p>
        </div>
      )}
    </Modal>
  );
}

export function RefillsView() {
  const account = useAccount();
  const today = useToday();
  const [selected, setSelected] = useState<RefillReminder | null>(null);
  if (!account) return null;
  const list = account.reminders;
  const overdue = list.filter((r) => r.status === "overdue").length;
  const dueSoon = list.filter((r) => r.status === "due_soon").length;
  const upcoming = list.filter((r) => r.status === "upcoming").length;

  return (
    <>
      <PageTitle title="Refill Reminders" description="When your regular medicines are likely to run out." />

      <Alert tone="info" title="Refill dates are estimates">
        We work them out from your previous purchases: purchase date plus the number of days the medicine should last. If your dose has changed, the date may be different. Reminders never place an order for you.
      </Alert>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon="calendar" tone="info" label="Upcoming refills" value={upcoming} hint={`More than ${DUE_SOON_DAYS} days away`} />
        <StatCard icon="clock" tone="warning" label="Due soon" value={dueSoon} hint={`Within ${DUE_SOON_DAYS} days`} />
        <StatCard icon="alert" tone="danger" label="Overdue" value={overdue} hint="Refill date has passed" />
      </div>

      <section aria-labelledby="refill-title" className={cx(PANEL, "overflow-hidden")}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3.5">
          <h2 id="refill-title" className="mz-h3 text-primary-tint-ink">Your medicines</h2>
          {today && <p className="mz-body-sm text-ink-muted">Calculated for today, {formatDate(today)}</p>}
        </div>
        {list.length === 0 ? (
          <EmptyState icon="bell" title="No refill reminders">
            Reminders appear for medicines you buy regularly at a Medizone branch, such as monthly blood pressure or diabetes tablets.
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead className={TABLE_HEAD}>
                <tr>
                  <th scope="col" className={TH}>Medicine</th>
                  <th scope="col" className={TH}>Last purchase</th>
                  <th scope="col" className={cx(TH, "text-right")}>Days supply</th>
                  <th scope="col" className={TH}>Estimated refill</th>
                  <th scope="col" className={TH}>Days remaining</th>
                  <th scope="col" className={TH}>Status</th>
                  <th scope="col" className={TH}><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {list.map((r) => {
                  const s = REFILL_STATUS[r.status];
                  return (
                    <tr key={r.id} className="border-b border-line last:border-0 hover:bg-surface-hover">
                      <td className={TD}>
                        <p className="mz-label">{r.medicine}</p>
                        {r.prescriptionOnly && <p className="mz-body-sm text-ink-muted">Prescription medicine</p>}
                      </td>
                      <td className={cx(TD, "whitespace-nowrap")}>{formatDate(r.purchaseDate)}</td>
                      <td className={cx(TD, "text-right mz-num")}>{r.daysSupply}</td>
                      <td className={cx(TD, "whitespace-nowrap")}>{formatDate(r.refillDate)}</td>
                      <td className={cx(TD, "whitespace-nowrap mz-num", r.daysRemaining < 0 && "font-semibold text-danger-ink")}>{describeDaysRemaining(r.daysRemaining)}</td>
                      <td className={TD}><Badge tone={s.tone} dot>{s.label}</Badge></td>
                      <td className={cx(TD, "text-right")}>
                        <Button size="sm" variant="ghost" iconRight="arrow-right" onClick={() => setSelected(r)}>
                          View Details<span className="sr-only"> for {r.medicine}</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <RefillDetails reminder={selected} onClose={() => setSelected(null)} />
    </>
  );
}
