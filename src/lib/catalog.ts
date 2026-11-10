import { categories, products as storefrontProducts, type StoreProduct } from "@/data/storefront";
import { productQuantity, stockStatus } from "@/lib/inventory";
import type { InventoryState } from "@/types/inventory";
import type { BranchId } from "@/types/roles";

export interface CatalogProduct extends StoreProduct {
  availableQuantity: number;
}

/** Inventory owns names, prices and availability; storefront data supplies presentation metadata. */
export function selectCatalog(state: InventoryState, today: string, branchId: BranchId | "all" = "all"): CatalogProduct[] {
  const metadata = new Map(storefrontProducts.map((product) => [product.id, product]));
  const batches = state.batches.filter((batch) => branchId === "all" || batch.branchId === branchId);
  return state.products.filter((product) => product.isActive && !product.rxRequired
    && categories.some((category) => category.id === product.categoryId)).map((product) => {
    const reference = metadata.get(product.id);
    const availableQuantity = productQuantity(product.id, batches, today);
    return {
      ...reference,
      id: product.id, name: product.name, brand: product.brand, categoryId: product.categoryId,
      price: product.sellingPrice,
      originalPrice: reference?.originalPrice && reference.originalPrice > product.sellingPrice ? reference.originalPrice : undefined,
      // The seed label is used only during SSR/hydration, before the browser date is ready.
      stock: today ? stockStatus(availableQuantity, product.reorderLevel) : reference?.stock ?? "out",
      availableQuantity,
      tag: reference?.tag ?? "new",
    };
  });
}

export function cartStockIssue(items: readonly { productId: string; qty: number }[], products: readonly CatalogProduct[]): string | null {
  for (const item of items) {
    const product = products.find((entry) => entry.id === item.productId);
    if (!product) return "An item in your cart is no longer available. Remove it to continue.";
    if (product.availableQuantity <= 0) return `${product.name} is out of stock. Remove it to continue.`;
    if (item.qty > product.availableQuantity) return `Only ${product.availableQuantity} units of ${product.name} are available. Reduce the quantity to continue.`;
  }
  return null;
}
