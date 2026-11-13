import type { IconName } from "@/components/shared";

export interface AccountNavItem {
  href: string;
  label: string;
  icon: IconName;
}

/** Customer account menu, in sidebar order. Logout is added by the sidebar itself. */
export const ACCOUNT_NAV: AccountNavItem[] = [
  { href: "/account", label: "Overview", icon: "dashboard" },
  { href: "/account/profile", label: "My Profile", icon: "user" },
  { href: "/account/orders", label: "My Orders", icon: "package" },
  { href: "/account/loyalty", label: "Loyalty Points", icon: "gift" },
  { href: "/account/feedback", label: "My Feedback", icon: "star" },
  { href: "/account/refill-reminders", label: "Refill Reminders", icon: "bell" },
  { href: "/account/prescriptions", label: "My Prescriptions", icon: "file-text" },
  { href: "/account/addresses", label: "My Addresses", icon: "map-pin" },
  { href: "/account/payments", label: "Payment History", icon: "wallet" },
];

export function isActiveNav(pathname: string, href: string): boolean {
  if (href === "/account") return pathname === "/account";
  return pathname === href || pathname.startsWith(href + "/");
}

/** The nav item a path belongs to, for the breadcrumb and the mobile menu button. */
export function navItemFor(pathname: string): AccountNavItem | undefined {
  return ACCOUNT_NAV.find((item) => isActiveNav(pathname, item.href));
}
