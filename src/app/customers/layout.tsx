import type { ReactNode } from "react";
import { CustomersProvider } from "@/components/customers/CustomersProvider";
import { CustomersShell } from "@/components/customers/CustomersShell";
import "./customers.css";

// Signed-in section: the root layout's RouteGuard renders it only in the browser, after the
// session (stored in browser storage) has been read. On the server it shows the loading screen
// instead, so Next.js cannot prerender this layout to validate instant navigation into it.
// Same opt-out as src/app/delivery/layout.tsx and the /home, /profile and /access-denied pages.
// Navigations between the Customers pages below this layout are still validated.
export const instant = false;

// Layout for every page under /customers: one shared sidebar (the team's), one data provider,
// so customers, points, feedback and sent reminders stay in sync while moving between pages.
export default function CustomersLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mz-theme">
      <CustomersProvider>
        <CustomersShell>{children}</CustomersShell>
      </CustomersProvider>
    </div>
  );
}
