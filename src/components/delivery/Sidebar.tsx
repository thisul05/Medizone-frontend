"use client";
import { useState } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { Icon, type IconName } from "@/components/shared/Icon";

const DELIVERY_SUBITEMS = [
  { id: "deliveries", label: "Deliveries" },
  { id: "cod", label: "Cash on Delivery" },
  { id: "returns", label: "Customer Returns" },
  { id: "warranty", label: "Warranty Claims" },
  { id: "checker", label: "Warranty Check" },
] as const;

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isDelivery = pathname === "/delivery";
  const activeTab = searchParams.get("tab") ?? "deliveries";
  const [open, setOpen] = useState(isDelivery);

  const handleDeliveryToggle = () => {
    if (!isDelivery) {
      router.push("/delivery?tab=deliveries");
      setOpen(true);
    } else {
      setOpen((v) => !v);
    }
  };

  return (
    <aside className="mz-on-nav sticky top-0 flex h-screen w-nav shrink-0 flex-col bg-surface-nav text-nav-ink">
      {/* Logo */}
      <div className="px-5 pb-4 pt-5">
        <Logo height={28} priority />
      </div>

      {/* Branch selector */}
      <div className="mx-3 mb-4 flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-nav-muted">
        <Icon name="store" size={16} />
        <span className="mz-label">Miriswattha, Piliyandala</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        <NavItem icon="home" label="Home" href="/home" active={pathname === "/home"} />
        <NavItem icon="dashboard" label="Dashboard" href="/admin" active={pathname === "/admin"} />

        <SectionLabel>Pharmacy</SectionLabel>
        <NavItem icon="clipboard" label="Prescriptions" href="/orders" active={pathname === "/orders"} />
        <NavItem icon="receipt" label="Billing" href="/billing" active={pathname === "/billing"} />
        <NavItem icon="package" label="Inventory" href="/inventory" active={pathname === "/inventory"} />
        <NavItem icon="users" label="Customers" href="/customers" active={pathname === "/customers"} />

        <SectionLabel>Back Office</SectionLabel>
        <NavItem icon="building" label="Suppliers" href="/suppliers" active={pathname === "/suppliers"} />

        {/* Delivery & warranty — expandable */}
        <div className="mb-0.5">
          <button
            type="button"
            onClick={handleDeliveryToggle}
            className={`flex h-10 w-full items-center gap-3 rounded-md px-2.5 mz-label transition-colors duration-150 ${
              isDelivery
                ? "bg-nav-active text-nav-ink"
                : "text-nav-muted hover:bg-white/10 hover:text-nav-ink"
            }`}
          >
            <Icon name="truck" size={18} />
            <span className="flex-1 text-left">Delivery &amp; warranty</span>
            <Icon
              name="chevron-down"
              size={14}
              className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
          </button>

          {open && (
            <div className="ml-7 mt-0.5 space-y-0.5">
              {DELIVERY_SUBITEMS.map((item) => (
                <Link
                  key={item.id}
                  href={`/delivery?tab=${item.id}`}
                  className={`flex h-8 items-center rounded-md px-2.5 text-sm transition-colors duration-150 ${
                    isDelivery && activeTab === item.id
                      ? "bg-white/15 font-semibold text-nav-ink"
                      : "text-nav-muted hover:bg-white/10 hover:text-nav-ink"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <NavItem icon="users" label="Staff & payroll" href="/staff" active={pathname === "/staff"} />
        <NavItem icon="chart" label="Reports" href="/reports" active={pathname === "/reports"} />
      </nav>

      {/* Bottom: Help + Logout + User */}
      <div className="border-t border-white/10 px-3 py-3 space-y-1">
        <a
          href="/help"
          className="flex h-10 w-full items-center gap-3 rounded-md px-2.5 mz-label text-nav-muted transition-colors duration-150 hover:bg-white/10 hover:text-nav-ink"
        >
          <Icon name="info" size={18} />
          Help &amp; support
        </a>
        <a
          href="/login"
          className="flex h-10 w-full items-center gap-3 rounded-md px-2.5 mz-label text-nav-muted transition-colors duration-150 hover:bg-white/10 hover:text-nav-ink"
        >
          <Icon name="logout" size={18} />
          Log out
        </a>
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e07c2a] mz-label text-white">
            NP
          </div>
          <div className="min-w-0">
            <div className="mz-label text-nav-ink truncate">Nimal Perera</div>
            <div className="mz-caption text-nav-muted truncate">Pharmacist assistant</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mz-overline mb-1 mt-4 px-2 text-nav-muted">{children}</p>
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
    <a
      href={href}
      className={`mb-0.5 flex h-10 items-center gap-3 rounded-md px-2.5 mz-label transition-colors duration-150 ${
        active
          ? "bg-nav-active text-nav-ink"
          : "text-nav-muted hover:bg-white/10 hover:text-nav-ink"
      }`}
    >
      <Icon name={icon} size={18} />
      {label}
    </a>
  );
}
