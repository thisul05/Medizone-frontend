import type { Metadata } from "next";
import { LoyaltyView } from "@/components/account/LoyaltyView";

// Customer account page: RouteGuard renders it only in the browser, after the session is read.
export const instant = false;

export const metadata: Metadata = { title: "Loyalty Points" };

export default function LoyaltyPage() {
  return <LoyaltyView />;
}
