"use client";

import {
  Building, ChartNoAxesCombined, Clipboard, IdCard, LayoutDashboard,
  Package, Receipt, Truck, Users, type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/shared/Icon";
import { Logo } from "@/components/shared/Logo";
import { useToast } from "@/components/shared/Toast";
import { cx } from "@/components/shared/cx";
import { branches, branchName } from "@/data/branches";
import { useAuth } from "@/lib/auth";
import { MODULES, type BranchId, type ModuleId } from "@/types/roles";

interface SidebarItem {
  id: ModuleId;
  label: string;
  icon: LucideIcon;
}

const SECTIONS: { title?: string; items: SidebarItem[] }[] = [
  {
    items: [{ id: "admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Pharmacy",
    items: [
      { id: "orders", label: "Orders", icon: Clipboard },
      { id: "inventory", label: "Inventory", icon: Package },
      { id: "customers", label: "Customers", icon: Users },
      { id: "billing", label: "Billing", icon: Receipt },
    ],
  },
  {
    title: "Back office",
    items: [
      { id: "suppliers", label: "Suppliers", icon: Building },
      { id: "delivery", label: "Delivery & warranty", icon: Truck },
      { id: "staff", label: "Staff & payroll", icon: IdCard },
      { id: "reports", label: "Reports", icon: ChartNoAxesCombined },
    ],
  },
];

const navLink = "flex min-h-10 w-full items-center gap-3 rounded-md px-3 py-2 mz-label transition-colors duration-150";

/** Inventory's module navigation, grouped to match the owner sidebar design. */
export function InventorySidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { user, activeBranchId, setActiveBranch, signOut, can } = useAuth();
  const router = useRouter();
  const toast = useToast();

  function handleSignOut() {
    onNavigate?.();
    signOut();
    toast({ tone: "info", title: "You're signed out" });
    router.replace("/login");
  }

  return (
    <div className="mz-on-nav flex h-full min-h-0 flex-col bg-surface-nav text-nav-ink">
      <div className="flex shrink-0 flex-col px-3 pb-4 pt-4">
        <Link href="/home" onClick={onNavigate} className="mb-5 self-center rounded-md" aria-label="Medizone Pharmacy home">
          <Logo height={36} priority />
        </Link>
        <div className="relative flex h-9 items-center rounded-md bg-white/10 text-nav-muted">
          <Icon name="store" size={16} className="pointer-events-none absolute left-3" />
          {user?.branchId === "all" ? (
            <>
              <select
                aria-label="Sidebar branch"
                value={activeBranchId ?? "all"}
                onChange={(event) => setActiveBranch(event.target.value as BranchId | "all")}
                className="h-full w-full cursor-pointer appearance-none truncate rounded-md border-0 bg-transparent pl-9 pr-9 text-[13px] font-semibold focus-visible:outline-focus-nav"
              >
                <option value="all" className="bg-surface-raised text-ink">All branches</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id} className="bg-surface-raised text-ink">{branch.name}</option>
                ))}
              </select>
              <Icon name="chevron-down" size={16} className="pointer-events-none absolute right-3" />
            </>
          ) : (
            <span className="truncate pl-9 pr-3 text-[13px] font-semibold">{branchName(user?.branchId ?? "all")}</span>
          )}
        </div>
      </div>

      <nav aria-label="Staff modules" className="min-h-0 flex-1 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden px-3 pb-4">
        {SECTIONS.map((section, index) => {
          const items = section.items.filter((item) => can(item.id));
          if (!items.length) return null;

          return (
            <div key={section.title ?? "dashboard"} className={index === 1 ? "mt-4" : index === 2 ? "mt-5" : undefined}>
              {section.title && <p className="mz-overline mb-1.5 px-3 text-nav-muted">{section.title}</p>}
              <ul>
                {items.map((item) => {
                  const module = MODULES.find((entry) => entry.id === item.id);
                  if (!module) return null;
                  const active = item.id === "inventory";
                  const NavIcon = item.icon;

                  return (
                    <li key={item.id}>
                      <Link
                        href={module.href}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        className={cx(navLink, active ? "bg-nav-active text-nav-ink" : "text-nav-muted hover:bg-nav-active hover:text-nav-ink")}
                      >
                        <NavIcon size={20} strokeWidth={1.75} className="shrink-0" aria-hidden="true" focusable="false" />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="shrink-0 px-3 pb-1">
        <button type="button" onClick={handleSignOut} className={cx(navLink, "cursor-pointer text-nav-muted hover:bg-nav-active hover:text-nav-ink")}>
          <Icon name="logout" size={20} />
          Log out
        </button>
      </div>
      {user && (
        <Link href="/profile" onClick={onNavigate} className="flex min-h-[60px] shrink-0 items-center gap-3 border-t border-nav-muted/20 px-4 py-3 transition-colors duration-150 hover:bg-nav-active" aria-label="Your profile">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-nav-active text-xs font-semibold" aria-hidden="true">
            {user.name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("")}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-semibold leading-[18px] text-nav-ink">{user.name}</span>
            <span className="block truncate text-[11px] leading-[14px] text-nav-muted">{user.jobTitle}</span>
          </span>
        </Link>
      )}
    </div>
  );
}
