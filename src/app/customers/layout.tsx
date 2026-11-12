import type { ReactNode } from "react";
import { CustomersProvider } from "@/components/customers/CustomersProvider";
import { AppShell } from "@/components/shared";
import { ThemeRoot } from "@/components/customers/ThemeRoot";
import "./customers.css";

// Layout for every page under /customers.
export default function CustomersLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeRoot>
      <CustomersProvider>
        <AppShell>
          <div className="flex w-full flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
            {children}
          </div>
        </AppShell>
      </CustomersProvider>
    </ThemeRoot>
  );
}
