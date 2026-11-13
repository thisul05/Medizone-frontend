import Link from "next/link";
import { getBranchName } from "@/data/customers";
import { formatCustomerId, formatNumber, formatPhone } from "@/lib/customers";
import type { Customer } from "@/types/customers";
import { CustomerTypeBadge, DiscountBadge } from "./CustomerBadges";
import { IconButtonLink } from "./ui/Button";
import { rowClass, tableClass, tableWrap, tdClass, thClass } from "./ui/table";

interface CustomerTableProps {
  customers: Customer[];
  highlightId?: string;
}

export function CustomerTable({ customers, highlightId }: CustomerTableProps) {
  return (
    <div className={tableWrap}>
      <table className={`${tableClass} min-w-[880px]`}>
        <caption className="sr-only">Customers</caption>
        <thead>
          <tr>
            <th scope="col" className={thClass}>Customer</th>
            <th scope="col" className={thClass}>Phone Number</th>
            <th scope="col" className={thClass}>Branch</th>
            <th scope="col" className={thClass}>Customer Type</th>
            <th scope="col" className={thClass}>Discount</th>
            <th scope="col" className={thClass}>Loyalty Points</th>
            <th scope="col" className={thClass}>View profile</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id} className={`${rowClass} ${c.id === highlightId ? "bg-(--primary-tint)" : ""}`}>
              <td className={`${tdClass} py-2.5`}>
                <Link href={`/customers/${c.id}`} className="font-semibold text-(--heading) underline-offset-2 hover:underline">
                  {c.name}
                </Link>
                <span className="block text-xs leading-4 text-(--ink-muted)">
                  {formatCustomerId(c.id)}
                  {c.registeredVia === "staff" ? " · Staff entry" : ""}
                </span>
              </td>
              <td className={`${tdClass} whitespace-nowrap tabular-nums`}>{formatPhone(c.phone)}</td>
              <td className={`${tdClass} whitespace-nowrap`}>{getBranchName(c.branchId)}</td>
              <td className={tdClass}>
                <CustomerTypeBadge customer={c} />
              </td>
              <td className={tdClass}>
                <DiscountBadge percent={c.isRegular ? c.discountPercent : 0} />
              </td>
              <td className={`${tdClass} font-semibold text-(--heading) tabular-nums`}>{formatNumber(c.loyaltyPoints)}</td>
              <td className={tdClass}>
                <IconButtonLink href={`/customers/${c.id}`} icon="eye" label={`View profile of ${c.name}`} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
