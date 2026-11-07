// The five product sections of the home page. Each product appears in exactly one of them.
import { productsByTag } from "@/data/storefront";
import { ProductGrid } from "./ProductGrid";
import { Section } from "./Section";

export function FeaturedProducts() {
  return (
    <Section title="Featured products" subtitle="Nutrition and supplements our pharmacists recommend most." viewAll={{ href: "/shop" }}>
      <ProductGrid products={productsByTag("featured")} />
    </Section>
  );
}

export function OffersThisWeek() {
  return (
    <Section id="offers" title="Offers this week" subtitle="Savings on devices, vitamins and baby care while stocks last." viewAll={{ href: "/shop?offers=1", label: "View all offers" }}>
      <ProductGrid products={productsByTag("offer")} />
    </Section>
  );
}

export function HealthDevices() {
  return (
    <Section
      id="devices"
      title="Health monitoring devices"
      subtitle="Warranty support through the supplier, with a loan device for some glucometers while yours is repaired."
      viewAll={{ href: "/shop?category=devices" }}
    >
      <ProductGrid products={productsByTag("device")} />
    </Section>
  );
}

export function Bestsellers() {
  return (
    <Section title="This week's bestsellers" subtitle="What Piliyandala is buying this week.">
      <ProductGrid products={productsByTag("bestseller")} />
    </Section>
  );
}

export function NewArrivals() {
  return (
    <Section title="New arrivals" subtitle="Just in at our branches." viewAll={{ href: "/shop" }}>
      <ProductGrid products={productsByTag("new").slice(0, 4)} />
    </Section>
  );
}
