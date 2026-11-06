import Link from "next/link";
import { getBranchName } from "@/data/customers";
import { formatNumber, formatPhone } from "@/lib/customers";
import type { Customer } from "@/types/customers";
import { CustomerAvatar, CustomerTypeBadge, DiscountBadge } from "./CustomerBadges";
import { ButtonLink } from "./ui/Button";

export const thClass =
  "sticky top-0 border-b border-(--border) bg-(--surface-sunken) px-4 py-2.5 text-xs leading-4 font-semibold tracking-[0.02em] whitespace-nowrap text-(--ink-muted)";
export const tdClass = "border-b border-(--border) px-4 py-3 align-middle text-(--ink)";
export const rowClass = "transition-colors hover:bg-(--surface-hover) [&:last-child>td]:border-b-0";

interface CustomerTableProps {
  customers: Customer[];
  highlightId?: string;
}

export function CustomerTable({ customers, highlightId }: CustomerTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] border-collapse text-sm leading-5">
        <caption className="sr-only">Customers</caption>
        <thead>
          <tr>
            <th scope="col" className={`${thClass} text-left`}>Customer</th>
            <th scope="col" className={`${thClass} text-left`}>Phone number</th>
            <th scope="col" className={`${thClass} text-left`}>Branch</th>
            <th scope="col" className={`${thClass} text-left`}>Customer type</th>
            <th scope="col" className={`${thClass} text-right`}>Discount</th>
            <th scope="col" className={`${thClass} text-right`}>Loyalty points</th>
            <th scope="col" className={`${thClass} text-right`}>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id} className={`${rowClass} ${c.id === highlightId ? "bg-(--primary-tint)" : ""}`}>
              <td className={tdClass}>
                <div className="flex items-center gap-3">
                  <CustomerAvatar name={c.name} size="sm" />
                  <div className="min-w-0">
                    <Link href={`/customers/${c.id}`} className="font-semibold text-(--ink) underline-offset-2 hover:text-(--link) hover:underline">
                      {c.name}
                    </Link>
                    <span className="mz-mono block text-(--ink-muted)">{c.id}</span>
                  </div>
                </div>
              </td>
              <td className={`${tdClass} whitespace-nowrap tabular-nums`}>{formatPhone(c.phone)}</td>
              <td className={`${tdClass} whitespace-nowrap`}>{getBranchName(c.branchId)}</td>
              <td className={tdClass}>
                <CustomerTypeBadge customer={c} />
              </td>
              <td className={`${tdClass} text-right tabular-nums`}>
                {c.isRegular ? <DiscountBadge percent={c.discountPercent} /> : <span className="text-(--ink-muted)">0%</span>}
              </td>
              <td className={`${tdClass} text-right font-semibold tabular-nums`}>{formatNumber(c.loyaltyPoints)}</td>
              <td className={`${tdClass} text-right`}>
                <ButtonLink href={`/customers/${c.id}`} size="sm" variant="secondary" icon="eye" aria-label={`View profile of ${c.name}`}>
                  View profile
                </ButtonLink>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
