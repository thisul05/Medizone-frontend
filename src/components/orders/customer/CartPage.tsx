"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, ButtonLink, CARD, Icon, cx } from "@/components/shared";
import { getCategory } from "@/data/storefront";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { formatLKR } from "@/lib/format";
import { customerDiscount, orderTotals } from "@/lib/orders";

/** The full cart page from the Figma design. The header cart still opens the quick cart drawer. */
export function CartPage() {
  const { user } = useAuth();
  const cart = useCart();
  const router = useRouter();

  const lines = cart.items.flatMap((i) => {
    const p = cart.getProduct(i.productId);
    return p ? [{ product: p, qty: i.qty }] : [];
  });
  const count = lines.reduce((n, l) => n + l.qty, 0);
  const discountPercent = customerDiscount(user?.jobTitle);
  const totals = orderTotals({ items: lines.map((l) => ({ name: l.product.name, qty: l.qty, unitPrice: l.product.price, needsLabel: false })), discountPercent, deliveryFee: 0 });
  const stockIssue = cart.ready ? cart.validateStock("all") : null;

  function checkout() {
    if (!user) return router.push("/login?next=" + encodeURIComponent("/orders/checkout"));
    router.push("/orders/checkout");
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 sm:px-6">
      <p className="mz-body-sm text-ink-muted"><Link href="/" className="text-link">Home</Link> › Cart</p>
      <div className="flex items-baseline gap-3">
        <h1 className="mz-h1">Your cart</h1>
        {cart.ready && <span className="text-ink-muted">{count} {count === 1 ? "item" : "items"}</span>}
      </div>

      {cart.ready && lines.length === 0 ? (
        <div className={cx(CARD, "flex flex-col items-center gap-3 py-16 text-center")}>
          <Icon name="cart" size={28} className="text-ink-subtle" />
          <p className="mz-h3">Your cart is empty</p>
          <p className="text-ink-muted">Add vitamins, devices and everyday essentials to get started.</p>
          <ButtonLink href="/shop">Browse products</ButtonLink>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex min-w-0 flex-col gap-4">
            <section className={cx(CARD, "overflow-x-auto p-0")}>
              <table className="w-full min-w-[640px] text-left">
                <thead>
                  <tr className="border-b border-line bg-surface-sunken mz-overline text-ink-muted">
                    <th className="px-5 py-3 font-semibold">Product</th>
                    <th className="px-3 py-3 font-semibold">Price</th>
                    <th className="px-3 py-3 font-semibold">Quantity</th>
                    <th className="px-5 py-3 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {lines.map(({ product: p, qty }) => (
                    <tr key={p.id}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-4">
                          <span className="flex size-14 shrink-0 items-center justify-center rounded-md bg-surface-sunken"><Icon name={getCategory(p.categoryId)?.icon ?? "package"} size={24} className="text-ink-subtle" /></span>
                          <div className="flex min-w-0 flex-col">
                            {p.brand && <span className="mz-overline text-ink-muted">{p.brand}</span>}
                            <span className="mz-label">{p.name}</span>
                            <span className={cx("mz-caption", p.availableQuantity > 0 ? "text-success-ink" : "text-danger-ink")}>{p.availableQuantity > 0 ? "In stock" : "Out of stock"}</span>
                            <button type="button" onClick={() => cart.remove(p.id)} className="mt-1 flex w-fit items-center gap-1 mz-caption text-danger-ink hover:underline"><Icon name="trash" size={12} />Remove</button>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 mz-num">{formatLKR(p.price)}</td>
                      <td className="px-3 py-4">
                        <div className="flex w-fit items-center rounded-md border border-line-strong">
                          <button type="button" aria-label={`Fewer ${p.name}`} disabled={qty <= 1} onClick={() => cart.setQty(p.id, qty - 1)} className="p-2 disabled:opacity-40"><Icon name="minus" size={14} /></button>
                          <span className="w-8 text-center mz-label mz-num" aria-live="polite">{qty}</span>
                          <button type="button" aria-label={`More ${p.name}`} onClick={() => cart.setQty(p.id, qty + 1)} className="p-2"><Icon name="plus" size={14} /></button>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-right mz-label mz-num">{formatLKR(p.price * qty)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
            <div className="flex gap-3 rounded-md border border-success-solid/30 bg-success-bg p-4 text-success-ink">
              <Icon name="message" size={20} className="shrink-0" />
              <div className="flex flex-col">
                <span className="mz-label">Need prescription medicines?</span>
                <span className="mz-body-sm">Prescription medicines are not sold online (NMRA rules). Send your prescription on WhatsApp to +94 70 185 5855 and we will prepare it for you.</span>
              </div>
            </div>
            <Link href="/shop" className="w-fit mz-label text-link hover:underline">← Continue shopping</Link>
          </div>

          <aside className={cx(CARD, "flex h-fit flex-col gap-2")}>
            <h2 className="mb-1 mz-h3">Order summary</h2>
            <p className="flex justify-between"><span className="text-ink-muted">Subtotal ({count} items)</span><span className="mz-num">{formatLKR(totals.subtotal)}</span></p>
            {discountPercent > 0 && <p className="flex justify-between"><span className="text-ink-muted">Regular customer discount ({discountPercent}%)</span><span className="mz-num text-success-ink">− {formatLKR(totals.discount)}</span></p>}
            <p className="flex justify-between"><span className="text-ink-muted">Delivery</span><span className="text-ink-muted">Calculated at checkout</span></p>
            <p className="flex justify-between border-t border-line pt-2 mz-label"><span>Total</span><span className="mz-price mz-num">{formatLKR(totals.total)}</span></p>
            {stockIssue && <p className="mz-body-sm text-warning-ink">{stockIssue}</p>}
            <Button size="lg" block iconRight="arrow-right" className="mt-2" disabled={!cart.ready || !!stockIssue} onClick={checkout}>Proceed to checkout</Button>
            <p className="flex items-center justify-center gap-1.5 mz-caption text-ink-muted"><Icon name="lock" size={12} />Pay by Visa card or cash on delivery</p>
          </aside>
        </div>
      )}
    </div>
  );
}
