import type { Metadata } from "next";
import { PrescriptionsView } from "@/components/account/PrescriptionsView";

// Customer account page: RouteGuard renders it only in the browser, after the session is read.
export const instant = false;

export const metadata: Metadata = { title: "My Prescriptions" };

export default function PrescriptionsPage() {
  return <PrescriptionsView />;
}
