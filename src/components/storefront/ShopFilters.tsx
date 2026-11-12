"use client";

import { Checkbox, Icon, cx } from "@/components/shared";
import { categories } from "@/data/storefront";
import { useCatalog } from "@/lib/use-catalog";

interface ShopFiltersProps {
  category: string | null;
  offers: boolean;
  inStock: boolean;
  onCategory: (id: string | null) => void;
  onOffers: (on: boolean) => void;
  onInStock: (on: boolean) => void;
}

function CategoryButton({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cx(
        "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left transition-colors duration-150",
        active ? "bg-primary-tint font-semibold text-primary-tint-ink" : "text-ink hover:bg-surface-hover",
      )}
    >
      <span>{label}</span>
      <span className="mz-body-sm text-ink-muted mz-num">{count}</span>
    </button>
  );
}

/** Side column at 1024px and up; stacked above the results on smaller screens. */
export function ShopFilters({ category, offers, inStock, onCategory, onOffers, onInStock }: ShopFiltersProps) {
  const { products } = useCatalog();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 rounded-lg border border-line bg-surface-raised p-4">
        <h2 className="flex items-center gap-2 mz-label">
          <Icon name="filter" size={20} /> Show only
        </h2>
        <Checkbox label="Offers only" checked={offers} onChange={(e) => onOffers(e.target.checked)} />
        <Checkbox label="In stock only" checked={inStock} onChange={(e) => onInStock(e.target.checked)} />
      </div>

      {/* Phone and tablet: a compact select-like list in a disclosure. Desktop: full list. */}
      <details className="group rounded-lg border border-line bg-surface-raised lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 mz-label [&::-webkit-details-marker]:hidden">
          Categories{category ? `: ${categories.find((c) => c.id === category)?.name ?? ""}` : ""}
          <Icon name="chevron-down" className="text-ink-subtle group-open:rotate-180" />
        </summary>
        <div className="flex flex-col gap-0.5 px-2 pb-3">
          <CategoryButton active={!category} onClick={() => onCategory(null)} label="All products" count={products.length} />
          {categories.map((c) => (
            <CategoryButton key={c.id} active={category === c.id} onClick={() => onCategory(c.id)} label={c.name} count={products.filter((p) => p.categoryId === c.id).length} />
          ))}
        </div>
      </details>

      <nav aria-label="Categories" className="hidden flex-col gap-2 lg:flex">
        <h2 className="px-3 mz-label">Categories</h2>
        <div className="flex flex-col gap-0.5">
          <CategoryButton active={!category} onClick={() => onCategory(null)} label="All products" count={products.length} />
          {categories.map((c) => (
            <CategoryButton key={c.id} active={category === c.id} onClick={() => onCategory(c.id)} label={c.name} count={products.filter((p) => p.categoryId === c.id).length} />
          ))}
        </div>
      </nav>
    </div>
  );
}
