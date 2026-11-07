"use client";

import { PRODUCT_GRID, ProductCard, useToast } from "@/components/shared";
import { getCategory, type StoreProduct } from "@/data/storefront";
import { useCart } from "@/lib/cart";

/** Storefront product cards wired to the cart. */
export function ProductGrid({ products }: { products: StoreProduct[] }) {
  const { add, setOpen } = useCart();
  const toast = useToast();

  function onAdd(p: StoreProduct) {
    if (!add(p.id)) return;
    toast({
      tone: "success",
      title: `Added to cart: ${p.name}`,
      action: { label: "View cart", onClick: () => setOpen(true) },
    });
  }

  return (
    <ul className={PRODUCT_GRID}>
      {products.map((p) => {
        const category = getCategory(p.categoryId);
        return (
          <li key={p.id}>
            <ProductCard
              name={p.name}
              brand={p.brand}
              price={p.price}
              originalPrice={p.originalPrice}
              image={p.image}
              stock={p.stock}
              note={p.note}
              warrantyMonths={p.warrantyMonths}
              category={category?.name}
              categoryIcon={category?.icon}
              isNew={p.tag === "new"}
              onAdd={() => onAdd(p)}
            />
          </li>
        );
      })}
    </ul>
  );
}
