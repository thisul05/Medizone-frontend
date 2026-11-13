import type { Metadata } from "next";
import { AccountNotFound } from "@/components/account/AccountNotFound";

// Customer account page: RouteGuard renders it only in the browser, after the session is read.
export const instant = false;

export const metadata: Metadata = { title: "Page not found" };

export default function AccountNotFoundPage() {
  return <AccountNotFound />;
}
