import Link from "next/link";
import { brands } from "@/data/storefront";
import { Section } from "./Section";

export function BrandsStrip() {
  return (
    <Section title="Brands we stock" subtitle="Quality, internationally recognised brands.">
      <ul className="flex flex-wrap gap-3">
        {brands.map((b) => (
          <li key={b}>
            <Link
              href={`/shop?q=${encodeURIComponent(b)}`}
              className="inline-flex h-control-lg items-center rounded-pill border border-line-strong bg-surface-raised px-5 mz-label text-primary-tint-ink transition-colors duration-150 hover:bg-primary-tint"
            >
              {b}
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
