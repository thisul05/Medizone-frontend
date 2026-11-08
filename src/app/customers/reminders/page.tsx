import type { Metadata } from "next";
import { RemindersView } from "@/components/customers/RemindersView";

export const metadata: Metadata = {
  title: "Refill reminders · Medizone",
};

export default function RefillRemindersPage() {
  return <RemindersView />;
}
