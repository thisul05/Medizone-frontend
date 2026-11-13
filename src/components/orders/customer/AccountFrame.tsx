"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/shared";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { useAccount } from "@/lib/account/use-account";

/** Puts a customer order page inside the My Account layout (Module 5's sidebar), as in the Figma design. */
export function AccountFrame({ crumb, children }: { crumb: string; children: ReactNode }) {
  const account = useAccount();
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "My Account", href: "/account" },
    { label: "My Orders", href: "/account/orders" },
  ];
  return (
    <div className="flex w-full flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1 mz-body-sm text-ink-muted">
          {crumbs.map((c) => (
            <li key={c.label} className="flex items-center gap-1">
              <Link href={c.href} className="rounded-sm text-link hover:underline">{c.label}</Link>
              <Icon name="chevron-right" size={14} className="text-ink-subtle" />
            </li>
          ))}
          <li aria-current="page" className="font-semibold text-ink">{crumb}</li>
        </ol>
      </nav>
      <div className="grid items-start gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        {account && (
          <aside className="hidden lg:sticky lg:top-[136px] lg:block">
            <AccountSidebar account={account} />
          </aside>
        )}
        <div className="flex min-w-0 flex-col gap-5">{children}</div>
      </div>
    </div>
  );
}
