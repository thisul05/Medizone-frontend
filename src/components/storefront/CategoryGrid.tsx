"use client";

import Link from "next/link";
import { Icon } from "@/components/shared";
import { categories } from "@/data/storefront";
import { useCatalog } from "@/lib/use-catalog";
import { Section } from "./Section";

export function CategoryGrid() {
  const { products } = useCatalog();
  return (
    <Section id="categories" title="Explore our range" subtitle="Ten categories of everyday health products, chosen by our pharmacists.">
      <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {categories.map((c) => {
          const n = products.filter((product) => product.categoryId === c.id).length;
          return (
            <li key={c.id}>
              <Link
                href={`/shop?category=${c.id}`}
                className="flex h-full flex-col items-start gap-3 rounded-lg border border-line bg-surface-raised p-4 shadow-1 transition-shadow duration-150 hover:shadow-2 sm:p-5"
              >
                <span className="flex size-12 items-center justify-center rounded-pill bg-primary-tint text-primary-tint-ink">
                  <Icon name={c.icon} />
                </span>
                <span className="mz-label text-ink">{c.name}</span>
                <span className="mt-auto mz-body-sm text-ink-muted">
                  {n} product{n === 1 ? "" : "s"}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
