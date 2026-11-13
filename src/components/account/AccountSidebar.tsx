"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge, Icon, cx } from "@/components/shared";
import { useCustomerLogout } from "@/lib/account/logout";
import type { AccountData } from "@/lib/account/use-account";
import { ACCOUNT_NAV, isActiveNav } from "./account-nav";
import { Avatar, PANEL } from "./ui";

const item =
  "flex w-full items-center gap-3 rounded-md px-3 py-2.5 mz-label transition-colors duration-150";

/** Customer-only account menu. Used in the desktop sidebar and inside the mobile drawer. */
export function AccountSidebar({ account, onNavigate }: { account: AccountData; onNavigate?: () => void }) {
  const pathname = usePathname();
  const logout = useCustomerLogout();

  return (
    <div className={cx(PANEL, "flex flex-col overflow-hidden")}>
      <div className="flex items-center gap-3 border-b border-line p-4">
        <Avatar initials={account.initials} size={44} />
        <div className="flex min-w-0 flex-col gap-1">
          <p className="truncate mz-label text-primary-tint-ink" title={account.name}>{account.name}</p>
          <Badge tone={account.isRegular ? "loyalty" : "neutral"} icon={account.isRegular ? "badge-check" : undefined} className="self-start">
            {account.statusLabel}
          </Badge>
        </div>
      </div>
      <nav aria-label="My account" className="p-2">
        <ul className="flex flex-col gap-0.5">
          {ACCOUNT_NAV.map((nav) => {
            const active = isActiveNav(pathname, nav.href);
            return (
              <li key={nav.href}>
                <Link
                  href={nav.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cx(item, active ? "bg-primary text-primary-on" : "text-ink hover:bg-primary-tint hover:text-primary-tint-ink")}
                >
                  <Icon name={nav.icon} size={18} className={active ? undefined : "text-ink-subtle"} />
                  {nav.label}
                </Link>
              </li>
            );
          })}
          <li className="mt-1 border-t border-line pt-1">
            <button
              type="button"
              onClick={() => {
                onNavigate?.();
                logout();
              }}
              className={cx(item, "text-danger-ink hover:bg-danger-bg")}
            >
              <Icon name="logout" size={18} />
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
