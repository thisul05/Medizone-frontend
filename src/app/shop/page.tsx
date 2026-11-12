import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopSkeleton } from "@/components/storefront/ShopSkeleton";
import { ShopView } from "@/components/storefront/ShopView";
import { StorefrontShell } from "@/components/storefront/StorefrontShell";

export const metadata: Metadata = {
  title: "Shop",
  description: "Shop vitamins, skincare, mom and baby care and health devices from Medizone Pharmacy, Piliyandala.",
};

export default function ShopPage() {
  return (
    <StorefrontShell>
      <Suspense fallback={<ShopSkeleton />}>
        <ShopView />
      </Suspense>
    </StorefrontShell>
  );
}
