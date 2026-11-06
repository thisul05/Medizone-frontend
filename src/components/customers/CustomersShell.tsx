"use client";

// Staff app frame for the Customers module, built from the design system's SideNav spec.
// No shared app shell exists in the repo yet; when the team adds one to src/components/shared,
// swap this component out in src/app/customers/layout.tsx.

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useId, useState, type ReactNode } from "react";
import { useCustomers } from "./CustomersProvider";
import { useTheme, type ThemePreference } from "./ThemeRoot";
// Official logo (same as medizone.lk), from the Medizone design system's Logos assets.
import logo from "./assets/medizone-logo.png";
import { Icon, type IconName } from "./ui/Icon";

interface NavItem {
  id: string;
  label: string;
  icon: IconName;
  href: string;
}

// Module names exactly as the design system lists them, so every member's pages match.
const SECTIONS: { title?: string; items: NavItem[] }[] = [
  {
    items: [
      { id: "home", label: "Home", icon: "home", href: "/home" },
      { id: "admin", label: "Dashboard", icon: "chart", href: "/admin" },
    ],
  },
  {
    title: "Pharmacy",
    items: [
      { id: "orders", label: "Prescriptions", icon: "file", href: "/orders" },
      { id: "billing", label: "Billing", icon: "receipt", href: "/billing" },
      { id: "inventory", label: "Inventory", icon: "package", href: "/inventory" },
      { id: "customers", label: "Customers", icon: "users", href: "/customers" },
    ],
  },
  {
    title: "Back office",
    items: [
      { id: "suppliers", label: "Suppliers", icon: "store", href: "/suppliers" },
      { id: "delivery", label: "Delivery & warranty", icon: "truck", href: "/delivery" },
      { id: "staff", label: "Staff & payroll", icon: "calendar", href: "/staff" },
      { id: "reports", label: "Reports", icon: "chart", href: "/reports" },
    ],
  },
];

const CUSTOMER_PAGES: { href: string; label: string; match: (path: string) => boolean }[] = [
  {
    href: "/customers",
    label: "Customer list",
    match: (p) => p === "/customers" || (/^\/customers\/[^/]+$/.test(p) && !/\/(loyalty|feedback|reminders)$/.test(p)),
  },
  { href: "/customers/loyalty", label: "Loyalty points", match: (p) => p.startsWith("/customers/loyalty") },
  { href: "/customers/feedback", label: "Feedback", match: (p) => p.startsWith("/customers/feedback") },
  { href: "/customers/reminders", label: "Refill reminders", match: (p) => p.startsWith("/customers/reminders") },
];

const SIGNED_IN_USER = { name: "Kasun Fernando", role: "Senior pharmacist assistant" };

const THEME_OPTIONS: { id: ThemePreference; label: string; icon: IconName }[] = [
  { id: "light", label: "Light", icon: "sun" },
  { id: "dark", label: "Dark", icon: "moon" },
  { id: "system", label: "System", icon: "monitor" },
];

function ThemeSwitch() {
  const { preference, setPreference } = useTheme();
  const labelId = useId();
  return (
    <div className="mt-auto mb-3 px-1 pt-4">
      <p id={labelId} className="mb-1.5 px-1.5 text-[11px] leading-[14px] font-bold tracking-[0.08em] text-(--nav-ink-muted) uppercase">
        Appearance
      </p>
      <div role="group" aria-labelledby={labelId} className="grid grid-cols-3 gap-1 rounded-md bg-white/8 p-1">
        {THEME_OPTIONS.map((option) => {
          const on = preference === option.id;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={on}
              onClick={() => setPreference(option.id)}
              className={`flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-sm text-xs font-semibold transition-colors ${
                on ? "bg-(--nav-active) text-(--nav-ink)" : "text-(--nav-ink-muted) hover:bg-white/6 hover:text-(--nav-ink)"
              }`}
            >
              <Icon name={option.icon} size={14} />
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SideNav({ pathname, dueCount, onNavigate }: { pathname: string; dueCount: number; onNavigate?: () => void }) {
  return (
    <nav aria-label="Main" className="mz-on-nav flex h-full w-[248px] flex-col gap-2 overflow-y-auto bg-(--surface-nav) px-3 py-5 text-(--nav-ink)">
      <Link href="/" onClick={onNavigate} className="mb-2 block self-start rounded-md">
        <Image src={logo} alt="Medizone" height={36} className="h-9 w-auto" priority />
      </Link>
      <div className="mb-2 flex items-center gap-2 rounded-md bg-white/8 px-2.5 py-2 text-[13px] font-semibold">
        <Icon name="store" size={16} />
        <span className="flex-1">Branch 1 (main)</span>
      </div>

      {SECTIONS.map((section, si) => (
        <div key={si} className={`flex flex-col gap-0.5 ${si > 0 ? "mt-3" : ""}`}>
          {section.title ? (
            <p className="mb-1 px-2.5 text-[11px] leading-[14px] font-bold tracking-[0.08em] text-(--nav-ink-muted) uppercase">
              {section.title}
            </p>
          ) : null}
          {section.items.map((item) => {
            const active = item.id === "customers";
            return (
              <div key={item.id}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active && pathname === "/customers" ? "page" : undefined}
                  className={`flex h-10 items-center gap-3 rounded-md px-2.5 text-sm font-semibold transition-colors ${
                    active ? "bg-(--nav-active) text-(--nav-ink)" : "text-(--nav-ink-muted) hover:bg-white/6 hover:text-(--nav-ink)"
                  }`}
                >
                  <Icon name={item.icon} size={20} />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {active && dueCount > 0 ? (
                    <span
                      className="inline-grid h-5 min-w-[22px] place-items-center rounded-full bg-(--danger-solid) px-1.5 text-xs font-bold text-white"
                      aria-label={`${dueCount} refill reminders to send`}
                    >
                      {dueCount}
                    </span>
                  ) : null}
                </Link>
                {active ? (
                  <ul className="mt-1 mb-1 ml-[22px] flex flex-col gap-0.5 border-l border-white/15 pl-3">
                    {CUSTOMER_PAGES.map((page) => {
                      const on = page.match(pathname);
                      return (
                        <li key={page.href}>
                          <Link
                            href={page.href}
                            onClick={onNavigate}
                            aria-current={on ? "page" : undefined}
                            className={`flex h-8 items-center rounded-sm px-2 text-[13px] font-semibold transition-colors ${
                              on ? "bg-white/12 text-(--nav-ink)" : "text-(--nav-ink-muted) hover:bg-white/6 hover:text-(--nav-ink)"
                            }`}
                          >
                            {page.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>
            );
          })}
        </div>
      ))}

      <ThemeSwitch />

      <div className="flex items-center gap-3 border-t border-white/12 px-2 pt-3">
        <span className="grid size-9 flex-none place-items-center rounded-full bg-(--logo-green) text-[13px] font-extrabold text-(--logo-navy)">KF</span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold">{SIGNED_IN_USER.name}</span>
          <span className="truncate text-xs text-(--nav-ink-muted)">{SIGNED_IN_USER.role}</span>
        </span>
      </div>
    </nav>
  );
}

function CurrentSideNav(props: { dueCount: number; onNavigate?: () => void }) {
  const pathname = usePathname() ?? "";
  return <SideNav pathname={pathname} {...props} />;
}

/** usePathname is only known at request time on dynamic routes, so it streams in under Suspense. */
function SideNavSlot(props: { dueCount: number; onNavigate?: () => void }) {
  return (
    <Suspense fallback={<SideNav pathname="" {...props} />}>
      <CurrentSideNav {...props} />
    </Suspense>
  );
}

export function CustomersShell({ children }: { children: ReactNode }) {
  const { reminders } = useCustomers();
  const [menuOpen, setMenuOpen] = useState(false);
  const dueCount = reminders.filter((r) => r.status === "due_soon" || r.status === "overdue").length;

  useEffect(() => {
    if (!menuOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <div className="min-h-screen lg:flex">
      <a
        href="#main-content"
        className="sr-only z-[70] rounded-md bg-(--surface-raised) px-4 py-2 font-semibold focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>

      {/* Desktop side navigation */}
      <aside className="sticky top-0 hidden h-screen flex-none lg:block">
        <SideNavSlot dueCount={dueCount} />
      </aside>

      {/* Under 1024px: top bar with a menu button */}
      <header className="mz-on-nav sticky top-0 z-40 flex h-14 items-center gap-3 bg-(--surface-nav) px-4 text-(--nav-ink) lg:hidden">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={menuOpen}
          className="-ml-1 cursor-pointer rounded-md p-2 hover:bg-white/10"
        >
          <Icon name="menu" size={22} />
        </button>
        <Link href="/" className="rounded-md">
          <Image src={logo} alt="Medizone" height={30} className="h-[30px] w-auto" />
        </Link>
        <span className="ml-auto text-[13px] font-semibold text-(--nav-ink-muted)">Customers</span>
      </header>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-(--scrim)" onClick={() => setMenuOpen(false)} aria-hidden />
          <div className="relative h-full w-[248px] shadow-(--shadow-3)">
            <SideNavSlot dueCount={dueCount} onNavigate={() => setMenuOpen(false)} />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="mz-on-nav absolute top-4 right-2 cursor-pointer rounded-md p-2 text-(--nav-ink) hover:bg-white/10"
            >
              <Icon name="x" size={20} />
            </button>
          </div>
        </div>
      ) : null}

      <main id="main-content" className="min-w-0 flex-1">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8">{children}</div>
      </main>
    </div>
  );
}
