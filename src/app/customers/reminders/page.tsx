import type { Metadata } from "next";
import { RemindersView } from "@/components/customers/RemindersView";

// Signed-in page: RouteGuard renders it only in the browser, after the session is read.
export const instant = false;

export const metadata: Metadata = {
  title: "Refill reminders · Medizone",
};

export default function RefillRemindersPage() {
  return <RemindersView />;
}
