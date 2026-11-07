import type { ReactNode } from "react";
import { CustomersProvider } from "@/components/customers/CustomersProvider";
import { CustomersShell } from "@/components/customers/CustomersShell";
import { ThemeRoot } from "@/components/customers/ThemeRoot";
import "./customers.css";

// Layout for every page under /customers. It holds the module's session state, so
// customers, feedback, points and sent reminders stay in sync while moving between pages.
export default function CustomersLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeRoot>
      <CustomersProvider>
        <CustomersShell>{children}</CustomersShell>
      </CustomersProvider>
    </ThemeRoot>
  );
}
