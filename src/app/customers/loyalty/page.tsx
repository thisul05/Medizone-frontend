import type { Metadata } from "next";
import { LoyaltyView } from "@/components/customers/LoyaltyView";

// Signed-in page: RouteGuard renders it only in the browser, after the session is read.
export const instant = false;

export const metadata: Metadata = {
  title: "Loyalty points · Medizone",
};

export default function LoyaltyPointsPage() {
  return <LoyaltyView />;
}
