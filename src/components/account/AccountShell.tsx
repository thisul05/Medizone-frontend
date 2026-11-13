"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, useState, type ReactNode } from "react";
import { ButtonLink, Icon, cx } from "@/components/shared";
import { useAuth } from "@/lib/auth";
import { orderCode } from "@/lib/orders";
import { useAccount, type AccountData } from "@/lib/account/use-account";
import { navItemFor } from "./account-nav";
import { AccountSidebar } from "./AccountSidebar";
import { EmptyState, PANEL, useDialogFocus } from "./ui";

/** Page gutters: 16px phone, 24px tablet, 32px desktop. */
const GUTTERS = "w-full px-4 sm:px-6 lg:px-8";

function crumbsFor(pathname: string): { label: string; href?: string }[] {
  const base = [{ label: "Home", href: "/" }, { label: "My Account", href: "/account" }];
  if (pathname === "/account") return [base[0], { label: "My Account" }];
  const nav = navItemFor(pathname);
  if (!nav) return [...base, { label: "Page not found" }];
  const order = pathname.match(/^\/account\/orders\/([^/]+)$/);
  if (order) return [...base, { label: nav.label, href: nav.href }, { label: `Order ${orderCode(decodeURIComponent(order[1]))}` }];
  if (pathname === "/account/profile/edit") return [...base, { label: nav.label, href: nav.href }, { label: "Edit Profile" }];
  return [...base, { label: nav.label }];
}

function Breadcrumb({ pathname }: { pathname: string }) {
  const crumbs = crumbsFor(pathname);
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 mz-body-sm text-ink-muted">
        {crumbs.map((c, i) => (
          <li key={c.label} className="flex items-center gap-1">
            {i > 0 && <Icon name="chevron-right" size={14} className="text-ink-subtle" />}
            {c.href ? (
              <Link href={c.href} className="rounded-sm text-link hover:underline">{c.label}</Link>
            ) : (
              <span aria-current="page" className="font-semibold text-ink">{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function MobileAccountNav({ account, pathname }: { account: AccountData; pathname: string }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const ref = useDialogFocus(open, close);
  const titleId = useId();
  const current = navItemFor(pathname);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className={cx(PANEL, "flex w-full items-center gap-3 px-4 py-3 text-left")}
      >
        <Icon name="menu" className="text-primary-tint-ink" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="mz-caption text-ink-muted">My Account menu</span>
          <span className="truncate mz-label text-primary-tint-ink">{current?.label ?? "My Account"}</span>
        </span>
        <Icon name="chevron-down" size={18} className="text-ink-subtle" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[65] bg-[var(--scrim)]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="flex h-full w-[300px] max-w-[85vw] flex-col gap-3 overflow-y-auto bg-surface-page p-4 shadow-3"
          >
            <div className="flex items-center justify-between">
              <h2 id={titleId} className="mz-h3 text-primary-tint-ink">My Account</h2>
              <button type="button" onClick={close} aria-label="Close account menu" className="rounded-sm p-1.5 text-ink-subtle hover:bg-surface-hover hover:text-ink">
                <Icon name="x" />
              </button>
            </div>
            <AccountSidebar account={account} onNavigate={close} />
          </div>
        </div>
      )}
    </div>
  );
}

/** Breadcrumb, customer sidebar (220px) and the page on the right. Customers only. */
export function AccountShell({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  const account = useAccount();
  const pathname = usePathname();

  // RouteGuard already handles signed-out visitors (redirect to /login).
  if (!ready || !user) return null;

  if (!account) {
    return (
      <div className={cx(GUTTERS, "py-10")}>
        <div className={cx(PANEL, "mx-auto max-w-xl")}>
          <EmptyState
            icon="lock"
            title="My Account is for customers"
            action={<ButtonLink href="/home" icon="home">Go to staff home</ButtonLink>}
          >
            You are signed in with a staff account. Customer account pages show a customer&apos;s own orders and details, so they are not available to staff.
          </EmptyState>
        </div>
      </div>
    );
  }

  return (
    <div className={cx(GUTTERS, "flex flex-col gap-4 py-5 lg:py-6")}>
      <Breadcrumb pathname={pathname} />
      <div className="grid items-start gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden lg:sticky lg:top-[136px] lg:block lg:max-h-[calc(100dvh-152px)] lg:overflow-y-auto">
          <AccountSidebar account={account} />
        </aside>
        <MobileAccountNav account={account} pathname={pathname} />
        <div className="flex min-w-0 flex-col gap-5">{children}</div>
      </div>
    </div>
  );
}
