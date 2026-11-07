import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Modules" };

const LINKS = [
  { href: "/home", label: "Module 1: Home" },
  { href: "/login", label: "Module 1: Login" },
  { href: "/register", label: "Module 1: Create account" },
  { href: "/", label: "Module 1: Public shop home page" },
  { href: "/shop", label: "Module 1: Shop" },
  { href: "/admin", label: "Module 2: Admin dashboard" },
  { href: "/inventory", label: "Module 3: Products and inventory" },
  { href: "/orders", label: "Module 4: Prescriptions and orders" },
  { href: "/customers", label: "Module 5: Customers and loyalty" },
  { href: "/suppliers", label: "Module 6: Suppliers and purchases" },
  { href: "/delivery", label: "Module 7: Delivery, returns and warranty" },
  { href: "/billing", label: "Module 8: Billing and payments" },
  { href: "/staff", label: "Module 9: Staff and payroll" },
  { href: "/reports", label: "Module 10: Reports and forecasting" },
];

// Temporary index so everyone can open their module page. Remove before the final demo.
export default function ModulesPage() {
  return (
    <main id="main" className="mx-auto max-w-content px-4 py-8 lg:px-8">
      <h1 className="text-h1">Medizone modules</h1>
      <p className="mt-1 text-body text-ink-muted">Temporary page for the team. Remove before the final demo.</p>
      <ul className="mt-6 flex flex-col gap-2">
        {LINKS.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-link underline">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
