import type { Metadata } from "next";
import { RefillsView } from "@/components/account/RefillsView";

// Customer account page: RouteGuard renders it only in the browser, after the session is read.
export const instant = false;

export const metadata: Metadata = { title: "Refill Reminders" };

export default function RefillsPage() {
  return <RefillsView />;
}
