import type { IconName } from "@/components/shared";
import { getCategory, products } from "@/data/storefront";

/** The shop category icon for a product, or a package for anything else (for example a prescription medicine). */
export function itemIcon(productId?: string): IconName {
  const product = productId ? products.find((p) => p.id === productId) : undefined;
  return (product && getCategory(product.categoryId)?.icon) || "package";
}
