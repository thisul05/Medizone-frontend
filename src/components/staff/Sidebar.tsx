"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/shared/Logo";
import { Icon, type IconName } from "@/components/shared/Icon";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="mz-on-nav sticky top-0 flex h-screen w-nav shrink-0 flex-col bg-surface-nav text-nav-ink">
      <div className="px-5 pb-4 pt-5">
        <Logo height={28} priority />
      </div>

      <div className="mx-3 mb-4 flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-nav-active mz-label text-sm">P</span>
        <div className="min-w-0">
          <p className="mz-caption text-nav-muted">Current branch</p>
          <p className="mz-label text-nav-ink">Piliyandala</p>
        </div>
        <Icon name="chevron-down" size={16} className="ml-auto text-nav-muted" />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        <SectionLabel>Home</SectionLabel>
        <NavItem icon="dashboard" label="Dashboard" href="/admin" pathname={pathname} />

        <SectionLabel>Pharmacy</SectionLabel>
        <NavItem icon="file-text" label="Orders" href="/orders" pathname={pathname} />
        <NavItem icon="receipt" label="Billing" href="/billing" pathname={pathname} />
        <NavItem icon="package" label="Inventory" href="/inventory" pathname={pathname} />
        <NavItem icon="users" label="Customers" href="/customers" pathname={pathname} />

        <SectionLabel>Back Office</SectionLabel>
        <NavItem icon="building" label="Suppliers" href="/suppliers" pathname={pathname} />
        <NavItem icon="truck" label="Delivery & warranty" href="/delivery" pathname={pathname} />
        <NavItem icon="id-card" label="Staff" href="/staff" pathname={pathname} />
        <NavItem icon="chart" label="Reports" href="/reports" pathname={pathname} />
      </nav>

      <div className="border-t border-white/10 px-3 py-3 space-y-1">
        <Link
          href="/login"
          className="flex h-10 w-full items-center gap-3 rounded-md px-2.5 mz-label text-nav-muted transition-colors duration-150 hover:bg-white/10 hover:text-nav-ink"
        >
          <Icon name="logout" size={18} />
          Log out
        </Link>
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-nav-active mz-label">
            KF
          </div>
          <div className="min-w-0">
            <p className="mz-label text-nav-ink truncate">Kasun Fernando</p>
            <p className="mz-caption text-nav-muted truncate">Senior pharmacist</p>
          </div>
        </div>
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
