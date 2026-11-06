import type { Metadata } from "next";
import { LoyaltyView } from "@/components/customers/LoyaltyView";

export const metadata: Metadata = {
  title: "Loyalty points · Medizone",
};

export default function LoyaltyPointsPage() {
  return <LoyaltyView />;
}
