import type { Metadata } from "next";
import { PaymentsView } from "@/components/account/PaymentsView";

// Customer account page: RouteGuard renders it only in the browser, after the session is read.
export const instant = false;

export const metadata: Metadata = { title: "Payment History" };

export default function PaymentsPage() {
  return <PaymentsView />;
}
