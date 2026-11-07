"use client";

import { useState } from "react";
import { PHARMACY_CONTACT, getBranchName } from "@/data/customers";
import { buildReminderMessage, describeDaysFromToday, formatDate, formatPhone } from "@/lib/customers";
import type { Customer, RefillReminder } from "@/types/customers";
import { ReminderStatusBadge } from "./ReminderTable";
import { Button } from "./ui/Button";
import { Icon } from "./ui/Icon";
import { Modal } from "./ui/Modal";
import { Tabs } from "./ui/Tabs";

export type ReminderChannel = "sms" | "whatsapp";

interface ReminderPreviewModalProps {
  reminder?: RefillReminder;
  customer?: Customer;
  onClose: () => void;
  onMarkSent: (reminder: RefillReminder, channel: ReminderChannel) => void;
}

export function ReminderPreviewModal({ reminder, customer, onClose, onMarkSent }: ReminderPreviewModalProps) {
  const [channel, setChannel] = useState<ReminderChannel>("whatsapp");
  const open = Boolean(reminder && customer);
  const message =
    reminder && customer ? buildReminderMessage(customer, reminder, getBranchName(customer.branchId), PHARMACY_CONTACT.phone) : "";
  const smsParts = Math.ceil(message.length / 160);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      tone="info"
      icon="message"
      title="Preview refill reminder"
      description="Simulated only. This prototype does not send SMS, WhatsApp or email."
      footer={
        reminder && reminder.status !== "sent" ? (
          <>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button icon="send" onClick={() => onMarkSent(reminder, channel)}>
              Mark as sent
            </Button>
          </>
        ) : (
          <Button variant="secondary" onClick={onClose}>
            Close preview
          </Button>
        )
      }
    >
      {reminder && customer ? (
        <div className="flex flex-col gap-5">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-(--ink-muted)">To</dt>
              <dd className="font-semibold">{customer.name}</dd>
              <dd className="text-(--ink-muted) tabular-nums">{formatPhone(customer.phone)}</dd>
            </div>
            <div>
              <dt className="text-(--ink-muted)">Medicine</dt>
              <dd className="font-semibold">{reminder.medicine}</dd>
            </div>
            <div>
              <dt className="text-(--ink-muted)">Expected refill</dt>
              <dd className="font-semibold">{formatDate(reminder.expectedRefillDate)}</dd>
              <dd className="text-(--ink-muted)">{describeDaysFromToday(reminder.daysUntilRefill)}</dd>
            </div>
            <div className="col-span-2 sm:col-span-3">
              <dt className="sr-only">Status</dt>
              <dd className="flex flex-wrap items-center gap-2">
                <ReminderStatusBadge status={reminder.status} />
                <span className="text-[13px] text-(--ink-muted)">
                  {formatDate(reminder.purchaseDate)} + {reminder.daysSupply} days supply = {formatDate(reminder.expectedRefillDate)}
                </span>
              </dd>
            </div>
          </dl>

          <div className="flex flex-col gap-3 rounded-lg bg-(--surface-sunken) p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] leading-[14px] font-bold tracking-[0.08em] text-(--ink-muted) uppercase">Message preview</p>
              <Tabs<ReminderChannel>
                variant="pill"
                label="Channel"
                idPrefix="reminder-channel"
                value={channel}
                onChange={setChannel}
                tabs={[
                  { id: "whatsapp", label: "WhatsApp" },
                  { id: "sms", label: "SMS" },
                ]}
                className="bg-(--surface-raised)"
              />
            </div>

            {channel === "whatsapp" ? (
              <div className="overflow-hidden rounded-lg border border-(--border) bg-(--surface-raised) shadow-(--shadow-1)">
                <div className="flex items-center gap-3 bg-(--surface-nav) px-4 py-2.5 text-(--nav-ink)">
                  <span aria-hidden className="grid size-8 place-items-center rounded-full bg-(--logo-green) text-xs font-extrabold text-(--logo-navy)">
                    MZ
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{PHARMACY_CONTACT.name}</p>
                    <p className="text-xs text-(--nav-ink-muted) tabular-nums">{formatPhone(PHARMACY_CONTACT.phone)} · Business account</p>
                  </div>
                </div>
                <div className="bg-(--loyalty-bg) p-4">
                  <div className="max-w-[440px] rounded-lg rounded-tl-sm bg-(--surface-raised) px-3.5 py-2.5 text-(--ink) shadow-(--shadow-1)">
                    <p className="text-[15px] leading-[22px]">{message}</p>
                    <p className="mt-1 flex items-center justify-end gap-1 text-[11px] text-(--ink-subtle)">
                      9:00 am <Icon name="check" size={12} />
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="max-w-[460px] rounded-lg rounded-tl-sm border border-(--border) bg-(--surface-raised) p-4 text-(--ink) shadow-(--shadow-1)">
                  <p className="text-[15px] leading-[22px]">{message}</p>
                </div>
                <p className="text-xs text-(--ink-muted) tabular-nums">
                  {message.length} characters · {smsParts} SMS {smsParts === 1 ? "part" : "parts"}
                </p>
              </>
            )}
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
