"use client";

// Staff frame for the Customers module. It reuses the team's shared role-based sidebar
// (src/components/delivery/Sidebar.tsx, also used by Orders and Delivery) unchanged,
// so navigation, user details and Log out look and behave the same in every module.
// Under 1024px the same sidebar opens in a drawer from a top bar.

import { Suspense, useEffect, useState, type ReactNode } from "react";
import Sidebar from "@/components/delivery/Sidebar";
import { Logo } from "@/components/shared/Logo";
import { Icon } from "./ui/Icon";

/** Placeholder with the sidebar's size while it streams in (it reads the URL). */
function SidebarFallback() {
  return <div className="sticky top-0 h-screen w-nav shrink-0 bg-surface-nav" aria-hidden />;
}

function SharedSidebar() {
  return (
    <Suspense fallback={<SidebarFallback />}>
      <Sidebar />
    </Suspense>
  );
}

export function CustomersShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  return (
    <div className="flex min-h-screen bg-surface-page">
      {/* Desktop: the shared sidebar. The wrapper stretches to the page height so the sidebar stays sticky. */}
      <div className="hidden shrink-0 lg:block">
        <SharedSidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Under 1024px: top bar with a menu button */}
        <header className="mz-on-nav sticky top-0 z-40 flex h-14 items-center gap-3 bg-surface-nav px-4 text-nav-ink lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation"
            aria-expanded={menuOpen}
            aria-controls="customers-mobile-nav"
            className="-ml-1 cursor-pointer rounded-md p-2 hover:bg-white/10"
          >
            <Icon name="menu" size={22} />
          </button>
          <Logo height={28} />
          <span className="ml-auto text-[13px] font-semibold text-nav-muted">Customers</span>
        </header>

        {menuOpen ? (
          <div id="customers-mobile-nav" className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
            <div className="absolute inset-0 bg-(--scrim)" onClick={() => setMenuOpen(false)} aria-hidden />
            {/* Close the drawer after any link is chosen (submenu links navigate without a page reload). */}
            <div
              className="relative h-full w-nav shadow-3"
              onClick={(e) => {
                if ((e.target as HTMLElement).closest("a")) setMenuOpen(false);
              }}
            >
              <SharedSidebar />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close navigation"
                className="mz-on-nav absolute top-4 right-2 cursor-pointer rounded-md p-2 text-nav-ink hover:bg-white/10"
              >
                <Icon name="x" size={20} />
              </button>
            </div>
          </div>
        ) : null}

        <main id="main" className="min-w-0 flex-1 overflow-auto">
          <div className="w-full max-w-7xl mx-auto px-5 py-6 sm:px-6 lg:px-8 space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
