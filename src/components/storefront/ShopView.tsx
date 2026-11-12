"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button, Icon, Select, cx } from "@/components/shared";
import { getCategory } from "@/data/storefront";
import { useCatalog } from "@/lib/use-catalog";
import { ProductGrid } from "./ProductGrid";
import { CONTAINER } from "./Section";
import { ShopFilters } from "./ShopFilters";

type Sort = "recommended" | "price-asc" | "price-desc" | "name";

const SORTS = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name: A to Z" },
];

/** Reads q, category and offers from the URL. Must be rendered inside <Suspense>. */
export function ShopView() {
  const { products } = useCatalog();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const q = params.get("q")?.trim() ?? "";
  const category = getCategory(params.get("category") ?? "") ? params.get("category") : null;
  const offers = params.get("offers") === "1";
  const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState<Sort>("recommended");

  function update(changes: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const results = useMemo(() => {
    const term = q.toLowerCase();
    const list = products.filter((p) => {
      if (category && p.categoryId !== category) return false;
      if (offers && !(p.originalPrice && p.originalPrice > p.price)) return false;
      if (inStock && p.stock === "out") return false;
      if (!term) return true;
      const cat = getCategory(p.categoryId)?.name ?? "";
      return [p.name, p.brand ?? "", cat].some((s) => s.toLowerCase().includes(term));
    });
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [products, q, category, offers, inStock, sort]);

  const categoryName = category ? getCategory(category)?.name : undefined;
  const heading = q ? `Search results for “${q}”` : categoryName ?? (offers ? "Offers this week" : "All products");
  const filtered = !!(q || category || offers || inStock);

  function clearAll() {
    setInStock(false);
    router.replace(pathname, { scroll: false });
  }

  return (
    <div className={cx(CONTAINER, "py-8 lg:py-10")}>
      <nav aria-label="Breadcrumb" className="mb-3">
        <ol className="flex flex-wrap items-center gap-1.5 mz-body-sm text-ink-muted">
          <li><Link href="/" className="text-link hover:underline">Home</Link></li>
          <li aria-hidden><Icon name="chevron-right" size={16} /></li>
          <li>
            {categoryName ? <Link href="/shop" className="text-link hover:underline">Shop</Link> : <span aria-current="page">Shop</span>}
          </li>
          {categoryName && (
            <>
              <li aria-hidden><Icon name="chevron-right" size={16} /></li>
              <li aria-current="page">{categoryName}</li>
            </>
          )}
        </ol>
      </nav>
      <h1 className="mb-6 mz-h1 lg:mb-8">{heading}</h1>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:gap-8">
        <aside aria-label="Filters">
          <ShopFilters
            category={category}
            offers={offers}
            inStock={inStock}
            onCategory={(id) => update({ category: id })}
            onOffers={(on) => update({ offers: on ? "1" : null })}
            onInStock={setInStock}
          />
        </aside>

        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <p className="text-ink-muted" aria-live="polite">
              {results.length} product{results.length === 1 ? "" : "s"}
            </p>
            <div className="flex flex-wrap items-end gap-3">
              {filtered && (
                <Button variant="ghost" size="md" icon="x" onClick={clearAll}>Clear filters</Button>
              )}
              <Select label="Sort by" labelHidden value={sort} onChange={(e) => setSort(e.target.value as Sort)} options={SORTS} className="w-52" />
            </div>
          </div>

          {results.length > 0 ? (
            <ProductGrid products={results} />
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-line bg-surface-raised px-6 py-16 text-center">
              <Icon name="search" size={28} className="text-ink-subtle" />
              <p className="mz-h3">No products match</p>
              <p className="max-w-sm text-ink-muted">Try another search word, or clear the filters to see everything we stock.</p>
              <Button variant="secondary" onClick={clearAll}>Clear filters</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
