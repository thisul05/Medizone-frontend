import Link from "next/link";
import { describeDaysFromToday, formatDate, formatPhone } from "@/lib/customers";
import type { Customer, RefillReminder, ReminderStatus } from "@/types/customers";
import { rowClass, tdClass, thClass } from "./CustomerTable";
import { Badge, type BadgeTone } from "./ui/Badge";
import { Button } from "./ui/Button";
import type { IconName } from "./ui/Icon";

const STATUS_BADGE: Record<ReminderStatus, { label: string; tone: BadgeTone; icon: IconName }> = {
  overdue: { label: "Overdue", tone: "danger", icon: "alertCircle" },
  due_soon: { label: "Due within 7 days", tone: "warning", icon: "clock" },
  upcoming: { label: "Upcoming", tone: "neutral", icon: "calendar" },
  sent: { label: "Sent", tone: "info", icon: "send" },
};

export function ReminderStatusBadge({ status }: { status: ReminderStatus }) {
  const b = STATUS_BADGE[status];
  return (
    <Badge tone={b.tone} icon={b.icon}>
      {b.label}
    </Badge>
  );
}

interface ReminderTableProps {
  reminders: RefillReminder[];
  getCustomer: (id: string) => Customer | undefined;
  onPreview: (reminder: RefillReminder) => void;
  onMarkSent: (reminder: RefillReminder) => void;
}

export function ReminderTable({ reminders, getCustomer, onPreview, onMarkSent }: ReminderTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1080px] border-collapse text-sm leading-5">
        <caption className="sr-only">Refill reminders</caption>
        <thead>
          <tr>
            <th scope="col" className={`${thClass} text-left`}>Customer</th>
            <th scope="col" className={`${thClass} text-left`}>Medicine</th>
            <th scope="col" className={`${thClass} text-left`}>Last purchase</th>
            <th scope="col" className={`${thClass} text-right`}>Days supply</th>
            <th scope="col" className={`${thClass} text-left`}>Expected refill</th>
            <th scope="col" className={`${thClass} text-left`}>Status</th>
            <th scope="col" className={`${thClass} text-right`}>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {reminders.map((r) => {
            const customer = getCustomer(r.customerId);
            const urgent = r.status === "due_soon" || r.status === "overdue";
            return (
              <tr key={r.id} className={`${rowClass} ${urgent ? "bg-(--warning-bg)/40" : ""}`}>
                <td className={tdClass}>
                  {customer ? (
                    <Link href={`/customers/${customer.id}`} className="font-semibold underline-offset-2 hover:text-(--link) hover:underline">
                      {customer.name}
                    </Link>
                  ) : (
                    r.customerId
                  )}
                  <span className="block text-[13px] text-(--ink-muted) tabular-nums">{customer ? formatPhone(customer.phone) : ""}</span>
                </td>
                <td className={tdClass}>
                  {r.medicine}
                  <span className="mz-mono block text-(--ink-muted)">{r.purchaseId}</span>
                </td>
                <td className={`${tdClass} whitespace-nowrap`}>{formatDate(r.purchaseDate)}</td>
                <td className={`${tdClass} text-right tabular-nums`}>{r.daysSupply} days</td>
                <td className={`${tdClass} whitespace-nowrap`}>
                  <span className="font-semibold">{formatDate(r.expectedRefillDate)}</span>
                  <span
                    className={`block text-[13px] ${
                      r.status === "overdue" ? "font-semibold text-(--danger-ink)" : urgent ? "font-semibold text-(--loyalty-ink)" : "text-(--ink-muted)"
                    }`}
                  >
                    {describeDaysFromToday(r.daysUntilRefill)}
                  </span>
                </td>
                <td className={tdClass}>
                  <ReminderStatusBadge status={r.status} />
                  {r.sentOn ? <span className="mt-1 block text-[13px] text-(--ink-muted)">on {formatDate(r.sentOn)}</span> : null}
                </td>
                <td className={`${tdClass} text-right`}>
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="secondary" icon="eye" onClick={() => onPreview(r)} aria-label={`Preview reminder for ${customer?.name ?? r.customerId}, ${r.medicine}`}>
                      Preview
                    </Button>
                    {r.status !== "sent" ? (
                      <Button size="sm" variant="ghost" icon="send" onClick={() => onMarkSent(r)} aria-label={`Mark reminder as sent for ${customer?.name ?? r.customerId}, ${r.medicine}`}>
                        Mark as sent
                      </Button>
                    ) : null}
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
