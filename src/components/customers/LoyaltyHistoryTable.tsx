import Link from "next/link";
import { formatDate, formatNumber } from "@/lib/customers";
import type { Customer, LoyaltyTransaction, LoyaltyTransactionType } from "@/types/customers";
import { rowClass, tdClass, thClass } from "./CustomerTable";
import { Badge, type BadgeTone } from "./ui/Badge";
import type { IconName } from "./ui/Icon";

const TYPE_BADGE: Record<LoyaltyTransactionType, { label: string; tone: BadgeTone; icon: IconName }> = {
  earned: { label: "Earned", tone: "loyalty", icon: "arrowUp" },
  redeemed: { label: "Redeemed", tone: "brand", icon: "arrowDown" },
  adjusted: { label: "Adjusted", tone: "neutral", icon: "refresh" },
};

export function LoyaltyTypeBadge({ type }: { type: LoyaltyTransactionType }) {
  const b = TYPE_BADGE[type];
  return (
    <Badge tone={b.tone} icon={b.icon}>
      {b.label}
    </Badge>
  );
}

interface LoyaltyHistoryTableProps {
  transactions: LoyaltyTransaction[];
  getCustomer?: (id: string) => Customer | undefined;
  showCustomer?: boolean;
  caption: string;
}

export function LoyaltyHistoryTable({ transactions, getCustomer, showCustomer = false, caption }: LoyaltyHistoryTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-sm leading-5">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <th scope="col" className={`${thClass} text-left`}>Reference</th>
            <th scope="col" className={`${thClass} text-left`}>Date</th>
            {showCustomer ? <th scope="col" className={`${thClass} text-left`}>Customer</th> : null}
            <th scope="col" className={`${thClass} text-left`}>Type</th>
            <th scope="col" className={`${thClass} text-left`}>Description</th>
            <th scope="col" className={`${thClass} text-left`}>Bill</th>
            <th scope="col" className={`${thClass} text-right`}>Points</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => {
            const customer = getCustomer?.(t.customerId);
            return (
              <tr key={t.id} className={rowClass}>
                <td className={`${tdClass} mz-mono whitespace-nowrap`}>{t.id}</td>
                <td className={`${tdClass} whitespace-nowrap`}>{formatDate(t.date)}</td>
                {showCustomer ? (
                  <td className={tdClass}>
                    {customer ? (
                      <Link href={`/customers/${customer.id}`} className="font-semibold underline-offset-2 hover:text-(--link) hover:underline">
                        {customer.name}
                      </Link>
                    ) : (
                      t.customerId
                    )}
                  </td>
                ) : null}
                <td className={tdClass}>
                  <LoyaltyTypeBadge type={t.type} />
                </td>
                <td className={`${tdClass} text-(--ink-muted)`}>{t.description}</td>
                <td className={`${tdClass} mz-mono whitespace-nowrap`}>{t.purchaseId ?? <span className="text-(--ink-subtle)">–</span>}</td>
                <td className={`${tdClass} text-right font-semibold whitespace-nowrap tabular-nums`}>
                  {t.points > 0 ? "+" : ""}
                  {formatNumber(t.points)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
