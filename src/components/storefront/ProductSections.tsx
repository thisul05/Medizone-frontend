"use client";

// Homepage sections subscribe to the same catalogue as the shop and cart.
import { useCatalog } from "@/lib/use-catalog";
import { ProductGrid } from "./ProductGrid";
import { Section } from "./Section";

export function FeaturedProducts() {
  const { products } = useCatalog();
  return (
    <Section title="Featured products" subtitle="Nutrition and supplements our pharmacists recommend most." viewAll={{ href: "/shop" }}>
      <ProductGrid products={products.filter((product) => product.tag === "featured")} />
    </Section>
  );
}

export function OffersThisWeek() {
  const { products } = useCatalog();
  return (
    <Section id="offers" title="Offers this week" subtitle="Savings on devices, vitamins and baby care while stocks last." viewAll={{ href: "/shop?offers=1", label: "View all offers" }}>
      <ProductGrid products={products.filter((product) => product.tag === "offer")} />
    </Section>
  );
}

export function HealthDevices() {
  const { products } = useCatalog();
  return (
    <Section
      id="devices"
      title="Health monitoring devices"
      subtitle="Warranty support through the supplier, with a loan device for some glucometers while yours is repaired."
      viewAll={{ href: "/shop?category=devices" }}
    >
      <ProductGrid products={products.filter((product) => product.tag === "device")} />
    </Section>
  );
}

export function Bestsellers() {
  const { products } = useCatalog();
  return (
    <Section title="This week's bestsellers" subtitle="What Piliyandala is buying this week.">
      <ProductGrid products={products.filter((product) => product.tag === "bestseller")} />
    </Section>
  );
}

export function NewArrivals() {
  const { products } = useCatalog();
  return (
    <Section title="New arrivals" subtitle="Just in at our branches." viewAll={{ href: "/shop" }}>
      <ProductGrid products={products.filter((product) => product.tag === "new").slice(0, 4)} />
    </Section>
  );
}
