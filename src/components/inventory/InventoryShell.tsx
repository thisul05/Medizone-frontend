"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Icon } from "@/components/shared/Icon";
import { Logo } from "@/components/shared/Logo";
import { StaffTopBar } from "@/components/shared/StaffTopBar";
import { cx } from "@/components/shared/cx";
import { branchName } from "@/data/branches";
import { modulesFor } from "@/lib/access";
import { useAuth } from "@/lib/auth";

/** Module navigation follows the signed-in account's permissions. */
export function InventoryShell({ children }: { children: ReactNode }) {
  const { user, activeBranchId } = useAuth();
  const [navOpen, setNavOpen] = useState(false);
  const modules = user ? modulesFor(user.role) : [];

  const navigation = (
    <nav aria-label="Staff modules" className="space-y-1 p-3">
      <Link
        href="/home"
        className="flex min-h-10 items-center gap-3 rounded-md px-3 py-2 mz-label text-nav-muted transition-colors duration-150 hover:bg-nav-active hover:text-nav-ink"
      >
        <Icon name="home" size={20} />
        Home
      </Link>
      <p className="mz-overline px-3 pb-2 pt-5 text-nav-muted">Workspace</p>
      {modules.map((module) => (
        <Link
          key={module.id}
          href={module.href}
          aria-current={module.id === "inventory" ? "page" : undefined}
          onClick={() => setNavOpen(false)}
          className={cx(
            "flex min-h-10 items-center gap-3 rounded-md px-3 py-2 mz-label transition-colors duration-150",
            module.id === "inventory"
              ? "bg-nav-active text-nav-ink"
              : "text-nav-muted hover:bg-nav-active hover:text-nav-ink",
          )}
        >
          <Icon name={module.icon} size={20} />
          {module.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-surface-page text-ink">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-surface-raised p-3 text-link focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
      >
        Skip to inventory
      </a>
      <aside className="mz-on-nav sticky top-0 hidden h-screen w-nav shrink-0 flex-col overflow-y-auto bg-surface-nav text-nav-ink lg:flex">
        <div className="px-5 pb-4 pt-6">
          <Link href="/home" className="inline-flex rounded-md" aria-label="Medizone Pharmacy home">
            <Logo height={36} />
          </Link>
          <p className="mz-caption mt-3 text-nav-muted">Pharmacy management</p>
        </div>
        {navigation}
        {user && (
          <div className="mx-3 mb-4 mt-auto rounded-lg bg-nav-active p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-nav mz-label text-nav-ink" aria-hidden="true">
                {user.name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("")}
              </div>
              <div className="min-w-0">
                <p className="truncate mz-label text-nav-ink">{user.name}</p>
                <p className="truncate mz-caption text-nav-muted">{user.jobTitle}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 border-t border-nav-muted/20 pt-3 mz-caption text-nav-muted">
              <Icon name="store" size={16} />
              {branchName(activeBranchId ?? "all")}
            </div>
          </div>
        )}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <StaffTopBar />
        <div className="mz-on-nav bg-surface-nav px-4 pb-3 text-nav-ink lg:hidden">
          <button
            type="button"
            aria-expanded={navOpen}
            aria-controls="inventory-mobile-navigation"
            onClick={() => setNavOpen((open) => !open)}
            className="flex h-control-md items-center gap-2 rounded-md px-3 mz-label text-nav-ink transition-colors duration-150 hover:bg-nav-active"
          >
            <Icon name={navOpen ? "x" : "menu"} size={20} />
            {navOpen ? "Close navigation" : "Browse modules"}
          </button>
          {navOpen && <div id="inventory-mobile-navigation">{navigation}</div>}
        </div>
        <main id="main" className="mx-auto w-full max-w-content flex-1 px-4 py-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
