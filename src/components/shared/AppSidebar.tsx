"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Icon, type IconName } from "@/components/shared/Icon";
import { branches, branchName } from "@/data/branches";
import { useAuth } from "@/lib/auth";
import type { BranchId, ModuleId } from "@/types/roles";

interface NavItemDef {
  id: ModuleId;
  label: string;
  href: string;
  icon: IconName;
}

const PHARMACY_ITEMS: NavItemDef[] = [
  { id: "orders", label: "Orders", href: "/orders", icon: "clipboard" },
  { id: "inventory", label: "Inventory", href: "/inventory", icon: "package" },
  { id: "customers", label: "Customers", href: "/customers", icon: "users" },
  { id: "billing", label: "Billing", href: "/billing", icon: "receipt" },
];

const BACK_OFFICE_ITEMS: NavItemDef[] = [
  { id: "suppliers", label: "Suppliers", href: "/suppliers", icon: "building" },
  { id: "delivery", label: "Delivery & warranty", href: "/delivery", icon: "truck" },
  { id: "staff", label: "Staff & payroll", href: "/staff", icon: "id-card" },
  { id: "reports", label: "Reports", href: "/reports", icon: "chart" },
];

const CUSTOMER_SUBITEMS = [
  { href: "/customers", label: "Customer list", exact: true },
  { href: "/customers/loyalty", label: "Loyalty points" },
  { href: "/customers/feedback", label: "Feedback" },
  { href: "/customers/reminders", label: "Refill reminders" },
];

const DELIVERY_SUBITEMS = [
  { id: "deliveries", label: "Deliveries" },
  { id: "cod", label: "Cash on Delivery" },
  { id: "returns", label: "Customer Returns" },
  { id: "warranty", label: "Warranty Claims" },
  { id: "checker", label: "Warranty Check" },
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname() || "";
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, activeBranchId, setActiveBranch, signOut, can } = useAuth();
  const [branchOpen, setBranchOpen] = useState(false);

  if (!user) return null;

  const isOwner = user.role === "owner";
  const initials = isOwner ? "NP" : getInitials(user.name);
  const displayName = isOwner ? "Yohan" : user.name;
  const roleLabel = isOwner ? "Owner" : user.jobTitle;

  const handleSignOut = () => {
    onNavigate?.();
    signOut();
    router.replace("/login");
  };

  const handleBranchSelect = (branch: BranchId | "all") => {
    setActiveBranch(branch);
    setBranchOpen(false);
  };

  const activeBranchLabel =
    activeBranchId === "all" || (!activeBranchId && user.branchId === "all")
      ? "All branches"
      : branchName(activeBranchId ?? user.branchId);

  const deliveryTab = searchParams.get("tab") ?? "deliveries";

  return (
    <aside className="flex h-screen w-64 flex-col bg-[#072f68] text-white select-none">
      {/* Brand Logo / Title */}
      <div className="px-6 pt-6 pb-4">
        <Link
          href={isOwner ? "/admin" : "/home"}
          onClick={onNavigate}
          className="inline-flex items-center gap-1.5 focus:outline-none"
        >
          <span className="text-2xl font-bold tracking-tight text-white">
            medizone<span className="text-[#62b126]">.</span>lk
          </span>
        </Link>
      </div>

      {/* Branch selector (immutable for single-branch staff, switchable across branches for owner) */}
      <div className="relative px-4 pb-3">
        {user.branchId === "all" ? (
          <div>
            <button
              type="button"
              onClick={() => setBranchOpen((prev) => !prev)}
              className="flex w-full items-center justify-between gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm text-slate-100 hover:bg-white/15 transition-colors"
            >
              <div className="flex items-center gap-2 truncate">
                <Icon name="store" size={16} className="text-slate-300 shrink-0" />
                <span className="truncate text-xs font-medium">{activeBranchLabel}</span>
              </div>
              <Icon
                name="chevron-down"
                size={14}
                className={`text-slate-300 transition-transform ${branchOpen ? "rotate-180" : ""}`}
              />
            </button>

            {branchOpen && (
              <div className="absolute left-4 right-4 top-11 z-50 mt-1 max-h-56 overflow-y-auto rounded-lg border border-slate-700 bg-[#0d2a4a] py-1 shadow-2xl">
                <button
                  type="button"
                  onClick={() => handleBranchSelect("all")}
                  className={`flex w-full items-center px-3 py-2 text-left text-xs ${
                    activeBranchId === "all" || !activeBranchId
                      ? "bg-[#1e4a8c] text-white font-semibold"
                      : "text-slate-200 hover:bg-white/10"
                  }`}
                >
                  All branches
                </button>
                {branches.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => handleBranchSelect(b.id)}
                    className={`flex w-full items-center px-3 py-2 text-left text-xs ${
                      activeBranchId === b.id
                        ? "bg-[#1e4a8c] text-white font-semibold"
                        : "text-slate-200 hover:bg-white/10"
                    }`}
                  >
                    {b.name}, {b.area}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs text-slate-200">
            <Icon name="store" size={16} className="text-slate-300 shrink-0" />
            <span className="truncate font-medium">{branchName(user.branchId)}</span>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-4 text-sm font-medium">
        {/* Dashboard: strictly owner only */}
        {can("admin") && (
          <div className="pt-1">
            <NavItem
              label="Dashboard"
              href="/admin"
              icon="dashboard"
              active={pathname === "/admin"}
              onClick={onNavigate}
            />
          </div>
        )}

        {/* Pharmacy Group */}
        {PHARMACY_ITEMS.some((item) => can(item.id)) && (
          <div>
            <div className="px-3 pb-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Pharmacy
            </div>
            <div className="space-y-0.5">
              {PHARMACY_ITEMS.map((item) => {
                if (!can(item.id)) return null;
                const isCust = item.id === "customers";
                const isCustActive = pathname === "/customers" || pathname.startsWith("/customers/");
                const active = isCust ? isCustActive : pathname === item.href || pathname.startsWith(item.href + "/");

                return (
                  <div key={item.id}>
                    <NavItem
                      label={item.label}
                      href={item.href}
                      icon={item.icon}
                      active={active}
                      onClick={onNavigate}
                    />

                    {/* Submenu for Customers */}
                    {isCust && isCustActive && (
                      <div className="ml-7 mt-1 mb-1 space-y-0.5 border-l border-white/15 pl-2.5">
                        {CUSTOMER_SUBITEMS.map((sub) => {
                          const isSubActive = sub.exact
                            ? pathname === sub.href
                            : pathname.startsWith(sub.href);
                          return (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              onClick={onNavigate}
                              className={`block rounded px-2 py-1 text-xs transition-colors ${
                                isSubActive
                                  ? "bg-white/15 font-semibold text-white"
                                  : "text-slate-300 hover:bg-white/10 hover:text-white"
                              }`}
                            >
                              {sub.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Back Office Group */}
        {BACK_OFFICE_ITEMS.some((item) => can(item.id)) && (
          <div>
            <div className="px-3 pb-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Back Office
            </div>
            <div className="space-y-0.5">
              {BACK_OFFICE_ITEMS.map((item) => {
                if (!can(item.id)) return null;
                const isDelivery = item.id === "delivery";
                const isDeliveryActive = pathname === "/delivery" || pathname.startsWith("/delivery/");
                const active = isDelivery ? isDeliveryActive : pathname === item.href || pathname.startsWith(item.href + "/");

                return (
                  <div key={item.id}>
                    <NavItem
                      label={item.label}
                      href={item.href}
                      icon={item.icon}
                      active={active}
                      onClick={onNavigate}
                    />

                    {/* Submenu for Delivery & Warranty */}
                    {isDelivery && isDeliveryActive && (
                      <div className="ml-7 mt-1 mb-1 space-y-0.5 border-l border-white/15 pl-2.5">
                        {DELIVERY_SUBITEMS.map((sub) => {
                          const isSubActive = deliveryTab === sub.id;
                          return (
                            <Link
                              key={sub.id}
                              href={`/delivery?tab=${sub.id}`}
                              onClick={onNavigate}
                              className={`block rounded px-2 py-1 text-xs transition-colors ${
                                isSubActive
                                  ? "bg-white/15 font-semibold text-white"
                                  : "text-slate-300 hover:bg-white/10 hover:text-white"
                              }`}
                            >
                              {sub.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Footer: Log out & User Profile (Role & identity are immutable in-session) */}
      <div className="border-t border-white/10 p-3 space-y-2">
        <button
          type="button"
          onClick={handleSignOut}
          className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-xs text-slate-300 transition-colors duration-150 hover:bg-white/10 hover:text-white"
        >
          <Icon name="logout" size={16} />
          <span className="font-medium">Log out</span>
        </button>

        <div className="flex items-center gap-3 rounded-lg px-2 py-1.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1b437c] border border-blue-400/30 text-xs font-bold text-white shadow-sm">
            {initials}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-sm font-semibold text-white">{displayName}</div>
            <div className="truncate text-[11px] text-slate-300">{roleLabel}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavItem({
  label,
  href,
  icon,
  active,
  onClick,
}: {
  label: string;
  href: string;
  icon: IconName;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex h-10 items-center gap-3 rounded-lg px-3 text-xs font-medium transition-colors duration-150 ${
        active
          ? "bg-[#1e4a8c] text-white shadow-sm"
          : "text-slate-300 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Icon name={icon} size={18} className={active ? "text-white" : "text-slate-300"} />
      <span className="truncate">{label}</span>
    </Link>
  );
}
