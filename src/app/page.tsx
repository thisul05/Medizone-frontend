import type { Metadata } from "next";
import { BranchesSection } from "@/components/storefront/BranchesSection";
import { BrandsStrip } from "@/components/storefront/BrandsStrip";
import { CategoryGrid } from "@/components/storefront/CategoryGrid";
import { FaqSection } from "@/components/storefront/FaqSection";
import { HealthTips } from "@/components/storefront/HealthTips";
import { Hero } from "@/components/storefront/Hero";
import { MembershipBand } from "@/components/storefront/MembershipBand";
import { NewsletterBand } from "@/components/storefront/NewsletterBand";
import {
  Bestsellers, FeaturedProducts, HealthDevices, NewArrivals, OffersThisWeek,
} from "@/components/storefront/ProductSections";
import { PromoBanner } from "@/components/storefront/PromoBanner";
import { ServiceHighlights } from "@/components/storefront/ServiceHighlights";
import { StorefrontShell } from "@/components/storefront/StorefrontShell";
import { WhyMedizone } from "@/components/storefront/WhyMedizone";

export const metadata: Metadata = {
  title: { absolute: "Medizone Pharmacy, Piliyandala" },
  description:
    "Vitamins, skincare, mom and baby care and health devices from pharmacists you trust. Islandwide delivery or collection at our four branches in Piliyandala.",
};

export default function StorefrontHome() {
  return (
    <StorefrontShell>
      <Hero />
      <ServiceHighlights />
      <CategoryGrid />
      <FeaturedProducts />
      <OffersThisWeek />
      <PromoBanner />
      <HealthDevices />
      <Bestsellers />
      <NewArrivals />
      <MembershipBand />
      <WhyMedizone />
      <BrandsStrip />
      <BranchesSection />
      <HealthTips />
      <FaqSection />
      <NewsletterBand />
    </StorefrontShell>
  );
}
