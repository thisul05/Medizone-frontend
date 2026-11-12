"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/shared/Logo";
import { Icon, type IconName } from "@/components/shared/Icon";
import { useAuth } from "@/lib/auth";
import { getBranch } from "@/data/branches";
import type { ModuleId } from "@/types/roles";

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

function branchLabel(branchId: string): string {
  if (branchId === "all") return "All branches";
  const b = getBranch(branchId as Parameters<typeof getBranch>[0]);
  return b ? `${b.name}, ${b.area}` : branchId;
}

export default function AppSidebar() {
  const pathname = usePathname();
  const { user, can, activeBranchId } = useAuth();

  const pharmacyItems = PHARMACY_NAV.filter((m) => can(m.id));
  const backOfficeItems = BACK_OFFICE_NAV.filter((m) => can(m.id));

  return (
    <aside className="mz-on-nav sticky top-0 flex h-screen w-nav shrink-0 flex-col bg-surface-nav text-nav-ink">
      <div className="px-5 pb-4 pt-5">
        <Logo height={28} priority />
      </div>

      {activeBranchId && (
        <div className="mx-3 mb-4 flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-nav-muted">
          <Icon name="store" size={16} />
          <span className="mz-label flex-1">{branchLabel(activeBranchId)}</span>
          {activeBranchId === "all" && (
            <Icon name="chevron-down" size={14} className="shrink-0" />
          )}
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {can("admin") && (
          <NavItem icon="dashboard" label="Dashboard" href="/admin" pathname={pathname} />
        )}

        {pharmacyItems.length > 0 && <SectionLabel>Pharmacy</SectionLabel>}
        {pharmacyItems.map((m) => (
          <NavItem key={m.id} icon={m.icon} label={m.label} href={m.href} pathname={pathname} />
        ))}

        {backOfficeItems.length > 0 && <SectionLabel>Back Office</SectionLabel>}
        {backOfficeItems.map((m) => (
          <NavItem key={m.id} icon={m.icon} label={m.label} href={m.href} pathname={pathname} />
        ))}
      </nav>

      <div className="border-t border-white/10 px-3 py-3 space-y-1">
        <Link
          href="/login"
          className="flex h-10 w-full items-center gap-3 rounded-md px-2.5 mz-label text-nav-muted transition-colors duration-150 hover:bg-white/10 hover:text-nav-ink"
        >
          <Icon name="logout" size={18} />
          Log out
        </Link>
        {user && (
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e07c2a] mz-label text-white">
              {getInitials(user.name)}
            </div>
            <div className="min-w-0">
              <div className="mz-label text-nav-ink truncate">{user.name}</div>
              <div className="mz-caption text-nav-muted truncate">{user.jobTitle}</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mz-overline mb-1 mt-4 px-2 text-nav-muted">{children}</p>;
}

function NavItem({ icon, label, href, pathname }: { icon: IconName; label: string; href: string; pathname: string }) {
  const active = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={`mb-0.5 flex h-10 items-center gap-3 rounded-md px-2.5 mz-label transition-colors duration-150 ${
        active ? "bg-nav-active text-nav-ink" : "text-nav-muted hover:bg-white/10 hover:text-nav-ink"
      }`}
    >
      <Icon name={icon} size={18} />
      {label}
    </Link>
  );
}
