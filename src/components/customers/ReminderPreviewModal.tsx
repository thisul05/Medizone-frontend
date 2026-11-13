"use client";

import { buildReminderMessage, formatDate, formatPhone } from "@/lib/customers";
import type { Customer, RefillReminder } from "@/types/customers";
import { ReminderStatusBadge } from "./ReminderTable";
import { Button } from "./ui/Button";
import { Modal } from "./ui/Modal";

interface ReminderPreviewModalProps {
  reminder?: RefillReminder;
  customer?: Customer;
  onClose: () => void;
  onMarkSent: (reminder: RefillReminder) => void;
}

function Item({ label, children, accent }: { label: string; children: React.ReactNode; accent?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-(--ink-muted)">{label}</dt>
      <dd className={`mt-1 text-sm font-semibold ${accent ? "text-(--heading)" : "text-(--ink)"}`}>{children}</dd>
    </div>
  );
}

/** Reminder Preview (Figma). Frontend simulation: no SMS, WhatsApp or email is sent. */
export function ReminderPreviewModal({ reminder, customer, onClose, onMarkSent }: ReminderPreviewModalProps) {
  const open = Boolean(reminder && customer);
  const sent = reminder?.status === "sent";

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      divider
      title="Reminder Preview"
      description="Review the personalized reminder before marking it as sent."
      footer={
        reminder ? (
          <>
            <Button variant="secondary" onClick={onClose} className="min-w-[100px]">
              Close
            </Button>
            <Button onClick={() => onMarkSent(reminder)} disabled={sent} className="min-w-[148px]">
              {sent ? "Already Sent" : "Mark as Sent"}
            </Button>
          </>
        ) : null
      }
    >
      {reminder && customer ? (
        <div className="flex flex-col gap-5">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            <Item label="Customer">{customer.name}</Item>
            <Item label="Medicine">{reminder.medicine}</Item>
            <Item label="Expected Refill Date" accent>
              {formatDate(reminder.expectedRefillDate)}
            </Item>
            <Item label="Phone">{formatPhone(customer.phone)}</Item>
          </dl>
          <div className="flex flex-wrap items-center gap-2 text-xs text-(--ink-muted)">
            <ReminderStatusBadge status={reminder.status} />
            <span>
              {formatDate(reminder.purchaseDate)} + {reminder.daysSupply} days supply = {formatDate(reminder.expectedRefillDate)}
            </span>
            {reminder.sentOn ? <span>· Marked as sent on {formatDate(reminder.sentOn)}</span> : null}
          </div>
          <div>
            <p className="text-[13px] font-semibold text-(--heading)">Personalized reminder message</p>
            <p className="mt-2 rounded-md border border-(--border) bg-(--surface-page) px-4 py-3.5 text-[13px] leading-5 text-(--ink)">
              {buildReminderMessage(customer, reminder)}
            </p>
          </div>
          <p className="text-xs text-(--ink-muted)">Frontend simulation only. No real messages are sent.</p>
        </div>
      ) : null}
    </Modal>
  );
}
