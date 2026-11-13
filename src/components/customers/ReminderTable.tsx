import Link from "next/link";
import { describeDaysFromToday, formatDate, formatPhone } from "@/lib/customers";
import type { Customer, RefillReminder, ReminderStatus } from "@/types/customers";
import { Badge, type BadgeTone } from "./ui/Badge";
import { Button } from "./ui/Button";
import { rowClass, tableClass, tableWrap, tdClass, thClass } from "./ui/table";

export const STATUS_LABEL: Record<ReminderStatus, string> = {
  upcoming: "Upcoming",
  due_soon: "Due Soon",
  overdue: "Overdue",
  sent: "Sent",
};

const STATUS_TONE: Record<ReminderStatus, BadgeTone> = {
  upcoming: "info",
  due_soon: "warning",
  overdue: "danger",
  sent: "success",
};

export function ReminderStatusBadge({ status }: { status: ReminderStatus }) {
  return <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>;
}

interface ReminderTableProps {
  reminders: RefillReminder[];
  getCustomer: (id: string) => Customer | undefined;
  onPreview: (reminder: RefillReminder) => void;
  onMarkSent: (reminder: RefillReminder) => void;
}

export function ReminderTable({ reminders, getCustomer, onPreview, onMarkSent }: ReminderTableProps) {
  return (
    <div className={tableWrap}>
      <table className={`${tableClass} min-w-[1060px]`}>
        <caption className="sr-only">Refill reminders</caption>
        <thead>
          <tr>
            <th scope="col" className={thClass}>Customer</th>
            <th scope="col" className={thClass}>Phone</th>
            <th scope="col" className={thClass}>Medicine</th>
            <th scope="col" className={thClass}>Last Purchase</th>
            <th scope="col" className={thClass}>Days Supply</th>
            <th scope="col" className={thClass}>Expected Refill Date</th>
            <th scope="col" className={thClass}>Status</th>
            <th scope="col" className={thClass}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reminders.map((r) => {
            const customer = getCustomer(r.customerId);
            const name = customer?.name ?? r.customerId;
            const sent = r.status === "sent";
            return (
              <tr key={r.id} className={rowClass}>
                <td className={`${tdClass} font-semibold`}>
                  {customer ? (
                    <Link href={`/customers/${customer.id}`} className="underline-offset-2 hover:text-(--heading) hover:underline">
                      {name}
                    </Link>
                  ) : (
                    name
                  )}
                </td>
                <td className={`${tdClass} text-[13px] whitespace-nowrap tabular-nums`}>{customer ? formatPhone(customer.phone) : "—"}</td>
                <td className={`${tdClass} text-[13px]`}>{r.medicine}</td>
                <td className={`${tdClass} text-[13px] whitespace-nowrap`}>{formatDate(r.purchaseDate)}</td>
                <td className={`${tdClass} text-[13px] whitespace-nowrap`}>{r.daysSupply} days</td>
                <td className={`${tdClass} whitespace-nowrap`}>
                  <span className="text-[13px] font-semibold">{formatDate(r.expectedRefillDate)}</span>
                  <span className={`block text-xs ${r.status === "overdue" ? "text-(--danger-ink)" : "text-(--ink-muted)"}`}>{describeDaysFromToday(r.daysUntilRefill)}</span>
                </td>
                <td className={tdClass}>
                  <ReminderStatusBadge status={r.status} />
                  {r.sentOn ? <span className="mt-0.5 block text-[11px] text-(--ink-muted)">on {formatDate(r.sentOn)}</span> : null}
                </td>
                <td className={tdClass}>
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="soft" onClick={() => onPreview(r)} aria-label={`Preview reminder for ${name}, ${r.medicine}`}>
                      Preview Reminder
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onMarkSent(r)}
                      disabled={sent}
                      className="min-w-[104px] justify-start"
                      aria-label={sent ? `Reminder already sent to ${name}` : `Mark reminder as sent for ${name}, ${r.medicine}`}
                    >
                      {sent ? "Sent" : "Mark as Sent"}
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
