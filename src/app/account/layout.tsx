import type { ReactNode } from "react";
import { AccountShell } from "@/components/account/AccountShell";
import { StorefrontShell } from "@/components/storefront/StorefrontShell";

// Customer account ("My Account") on the public website. Not the staff /customers module.
// Every page here needs a signed-in customer: RouteGuard sends signed-out visitors to /login,
// and AccountShell shows a notice to staff accounts.
export const instant = false;

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <StorefrontShell>
      <AccountShell>{children}</AccountShell>
    </StorefrontShell>
  );
}
