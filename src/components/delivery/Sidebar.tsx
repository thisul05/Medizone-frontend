"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { Icon, type IconName } from "@/components/shared/Icon";
import { useAuth } from "@/lib/auth";
import { branches } from "@/data/branches";
import { defaultRouteFor } from "@/components/auth/useRedirectIfSignedIn";
import type { BranchId, ModuleId } from "@/types/roles";

type NavEntry = { id: ModuleId; label: string; icon: IconName; href: string };

const PHARMACY_NAV: NavEntry[] = [
  { id: "orders", label: "Orders", icon: "clipboard", href: "/orders" },
  { id: "inventory", label: "Inventory", icon: "package", href: "/inventory" },
  { id: "customers", label: "Customers", icon: "users", href: "/customers" },
  { id: "billing", label: "Billing", icon: "receipt", href: "/billing" },
];

const BACK_OFFICE_NAV: NavEntry[] = [
  { id: "suppliers", label: "Suppliers", icon: "building", href: "/suppliers" },
  { id: "delivery", label: "Delivery & warranty", icon: "truck", href: "/delivery" },
  { id: "staff", label: "Staff & payroll", icon: "id-card", href: "/staff" },
  { id: "reports", label: "Reports", icon: "chart", href: "/reports" },
];

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, can, activeBranchId, setActiveBranch, signOut } = useAuth();
  const [branchOpen, setBranchOpen] = useState(false);

  const pharmacyItems = PHARMACY_NAV.filter((m) => can(m.id));
  const backOfficeItems = BACK_OFFICE_NAV.filter((m) => can(m.id));

  const currentBranchLabel =
    !activeBranchId || activeBranchId === "all"
      ? "All branches"
      : branches.find((b) => b.id === activeBranchId)?.area || "Select branch";

  const handleBranchSelect = (id: BranchId | "all") => {
    setActiveBranch(id);
    setBranchOpen(false);
  };

  return (
    <aside className="mz-on-nav sticky top-0 flex h-screen w-nav shrink-0 flex-col bg-surface-nav text-nav-ink select-none overflow-hidden">
      {/* Brand Header */}
      <div className="px-4 pb-2 pt-3.5">
        <Link href={user ? defaultRouteFor(user.role) : "/login"} className="block">
          <Logo height={26} priority />
        </Link>
      </div>

      {/* Branch Selector */}
      <div className="relative mx-2.5 mb-2">
        <button
          type="button"
          onClick={() => user?.role === "owner" && setBranchOpen((prev) => !prev)}
          className={`flex w-full items-center justify-between gap-2 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs text-nav-muted transition-colors ${
            user?.role === "owner" ? "hover:bg-white/15 cursor-pointer" : "cursor-default"
          }`}
          aria-expanded={branchOpen}
        >
          <div className="flex items-center gap-2 truncate">
            <Icon name="store" size={14} className="shrink-0 text-nav-muted" />
            <span className="truncate font-medium text-white/90 text-xs">{currentBranchLabel}</span>
          </div>
          {user?.role === "owner" && (
            <Icon
              name="chevron-down"
              size={12}
              className={`shrink-0 transition-transform duration-200 text-nav-muted ${
                branchOpen ? "rotate-180" : ""
              }`}
            />
          )}
        </button>

        {branchOpen && user?.role === "owner" && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-white/10 bg-[#062452] py-1 shadow-lg backdrop-blur-md">
            <button
              type="button"
              onClick={() => handleBranchSelect("all")}
              className={`flex w-full items-center px-3 py-1.5 text-xs font-medium transition-colors ${
                !activeBranchId || activeBranchId === "all"
                  ? "bg-white/15 text-white"
                  : "text-nav-muted hover:bg-white/10 hover:text-white"
              }`}
            >
              All branches
            </button>
            {branches.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => handleBranchSelect(b.id)}
                className={`flex w-full items-center px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeBranchId === b.id
                    ? "bg-white/15 text-white"
                    : "text-nav-muted hover:bg-white/10 hover:text-white"
                }`}
              >
                {b.name} ({b.area})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden px-2.5 space-y-0.5">
        {/* Dashboard is strictly for Owner */}
        {can("admin") && (
          <NavItem
            icon="dashboard"
            label="Dashboard"
            href="/admin"
            active={pathname === "/admin" || pathname.startsWith("/admin/")}
          />
        )}

        {/* Pharmacy Group */}
        {pharmacyItems.length > 0 && <SectionLabel>PHARMACY</SectionLabel>}
        {pharmacyItems.map((m) => (
          <NavItem
            key={m.id}
            icon={m.icon}
            label={m.label}
            href={m.href}
            active={pathname === m.href || pathname.startsWith(m.href + "/")}
          />
        ))}

        {/* Back Office Group */}
        {backOfficeItems.length > 0 && <SectionLabel>BACK OFFICE</SectionLabel>}
        {backOfficeItems.map((m) => (
          <NavItem
            key={m.id}
            icon={m.icon}
            label={m.label}
            href={m.href}
            active={pathname === m.href || pathname.startsWith(m.href + "/")}
          />
        ))}
      </nav>

      {/* Bottom: Logout and Profile */}
      <div className="border-t border-white/10 px-2.5 py-2 space-y-1">
        <button
          type="button"
          onClick={() => {
            signOut();
            router.push("/login");
          }}
          className="flex h-8 w-full items-center gap-2.5 rounded-lg px-2 text-xs font-medium text-nav-muted transition-colors duration-150 hover:bg-white/10 hover:text-white cursor-pointer"
        >
          <Icon name="logout" size={16} />
          <span>Log out</span>
        </button>

        {user && (
          <Link
            href="/profile"
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors cursor-pointer group ${
              pathname === "/profile"
                ? "bg-white/20 text-white font-semibold shadow-xs"
                : "bg-white/5 hover:bg-white/10 text-white/90 hover:text-white"
            }`}
            title="View your user profile"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#133e7c] text-[11px] font-bold text-white border border-white/20 group-hover:border-white/40 transition-colors">
              {getInitials(user.name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-white truncate text-xs font-medium leading-tight group-hover:underline">
                {user.name}
              </div>
              <div className="text-nav-muted truncate text-[10px] leading-tight">
                {user.role === "owner" ? "Owner" : user.jobTitle}
              </div>
            </div>
            <Icon
              name="chevron-right"
              size={12}
              className="text-nav-muted/60 group-hover:text-white transition-colors shrink-0"
            />
          </Link>
        )}
      </div>
    </aside>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-0.5 mt-2 px-2 text-[10px] font-bold tracking-wider text-nav-muted/80 uppercase">
      {children}
    </p>
  );
}

function NavItem({
  icon,
  label,
  href,
  active,
}: {
  icon: IconName;
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-xs transition-all duration-150 ${
        active
          ? "bg-white/20 text-white font-semibold shadow-xs"
          : "text-nav-muted hover:bg-white/10 hover:text-white font-medium"
      }`}
    >
      <Icon name={icon} size={16} className={active ? "text-white" : "text-nav-muted"} />
      <span>{label}</span>
    </Link>
  );
}
