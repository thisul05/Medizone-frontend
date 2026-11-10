"use client";

import { Button } from "@/components/shared/Button";
import { Icon, type IconName } from "@/components/shared/Icon";
import StatusBadge from "@/components/shared/StatusBadge";
import { cx } from "@/components/shared/cx";
import { branchName } from "@/data/branches";
import { INVENTORY_CATEGORIES } from "@/data/inventory";
import { formatDate, formatLKR } from "@/lib/format";
import { expiryInfo, productQuantity, stockStatus } from "@/lib/inventory";
import type { InventoryProduct, StockBatch, StockMovement } from "@/types/inventory";

const headerCell = "bg-surface-sunken px-4 py-3 text-left mz-caption font-semibold text-ink-muted border-b border-line";
const cell = "px-4 py-4 align-top mz-body-sm";
const numberCell = `${cell} text-right mz-num whitespace-nowrap`;
const quantityFormat = new Intl.NumberFormat("en-LK");
const movementDate = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Colombo", day: "numeric", month: "short", year: "numeric" });
const movementTime = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Colombo", hour: "numeric", minute: "2-digit", hour12: true });

const expiryClass = {
  expired: "bg-danger-bg text-danger-ink",
  red: "bg-expiry-red text-expiry-on-red",
  orange: "bg-expiry-orange text-expiry-on-orange",
  yellow: "bg-expiry-yellow text-expiry-on-yellow",
  ok: "bg-neutral-bg text-neutral-ink",
  none: "bg-neutral-bg text-neutral-ink",
};

export function ExpiryTag({ expiryDate, today }: { expiryDate: string | null; today: string }) {
  const expiry = expiryInfo(expiryDate, today);
  return (
    <span className={cx("inline-flex min-h-6 items-center gap-1.5 whitespace-nowrap rounded-pill px-2.5 py-1 mz-caption", expiryClass[expiry.status])}>
      <Icon name={expiry.status === "expired" ? "alert" : "calendar"} size={14} />
      {expiry.label}
    </span>
  );
}

function EmptyTable({ icon, title, description }: { icon: IconName; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-line bg-surface-raised px-6 py-12 text-center shadow-1">
      <div className="mb-4 rounded-lg bg-surface-sunken p-3 text-ink-muted"><Icon name={icon} size={28} /></div>
      <h3 className="mz-h3">{title}</h3>
      <p className="mt-2 max-w-md mz-body-sm text-ink-muted">{description}</p>
    </div>
  );
}

export function ProductTable({ products, batches, today, onView, onEdit }: {
  products: InventoryProduct[];
  batches: StockBatch[];
  today: string;
  onView: (id: string) => void;
  onEdit: (product: InventoryProduct) => void;
}) {
  if (!products.length) return <EmptyTable icon="package" title="No products found" description="Try a different search or filter, or add a product to start tracking its stock." />;

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface-raised shadow-1">
      <div className="overflow-x-auto" role="region" aria-label="Product inventory table" tabIndex={0}>
        <table className="w-full min-w-[930px] border-collapse">
          <caption className="sr-only">Product inventory. Available quantities exclude expired batches.</caption>
          <thead><tr>
            <th scope="col" className={headerCell}>Product</th>
            <th scope="col" className={headerCell}>Category</th>
            <th scope="col" className={cx(headerCell, "text-right")}>Available</th>
            <th scope="col" className={cx(headerCell, "text-right")}>Reorder at</th>
            <th scope="col" className={cx(headerCell, "text-right")}>Selling price</th>
            <th scope="col" className={headerCell}>Stock status</th>
            <th scope="col" className={cx(headerCell, "text-right")}>Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-line">
            {products.map((product) => {
              const quantity = productQuantity(product.id, batches, today);
              return (
                <tr key={product.id} className="transition-colors duration-150 hover:bg-surface-hover">
                  <th scope="row" className={cx(cell, "min-w-64 text-left font-normal")}>
                    <button type="button" onClick={() => onView(product.id)} className="rounded-sm text-left font-semibold text-link hover:underline" aria-label={`View batches for ${product.name}`}>
                      {product.name}
                    </button>
                    <p className="mt-1 text-ink-muted">{product.genericName || product.brand}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span className="mz-code text-ink-subtle">{product.sku}</span>
                      {product.rxRequired && <span className="mz-caption text-ink-muted">Prescription required</span>}
                      {!product.isActive && <span className="mz-caption text-ink-muted">Inactive</span>}
                    </div>
                  </th>
                  <td className={cx(cell, "text-ink-muted")}>{INVENTORY_CATEGORIES.find((category) => category.id === product.categoryId)?.name ?? product.categoryId}</td>
                  <td className={numberCell}><p className="font-semibold">{quantityFormat.format(quantity)}</p><p className="mt-1 mz-caption text-ink-muted">{product.unit}</p></td>
                  <td className={cx(numberCell, "text-ink-muted")}>{quantityFormat.format(product.reorderLevel)}</td>
                  <td className={numberCell}>{formatLKR(product.sellingPrice)}</td>
                  <td className={cell}><StatusBadge kind="stock" status={stockStatus(quantity, product.reorderLevel)} /></td>
                  <td className={cx(cell, "text-right")}><Button variant="ghost" size="sm" onClick={() => onEdit(product)} aria-label={`Edit ${product.name}`}>Edit product</Button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="border-t border-line px-4 py-3 mz-caption text-ink-muted">Available stock excludes expired batches. Select a product to view its batches.</p>
    </div>
  );
}

export function BatchTable({ batches, products, today, onAdjust, onReceive }: {
  batches: StockBatch[];
  products: InventoryProduct[];
  today: string;
  onAdjust: (batch: StockBatch) => void;
  onReceive?: (productId: string) => void;
}) {
  if (!batches.length) return <EmptyTable icon="package" title="No batches found" description="Receive stock to record a batch, or change your filters to see other inventory." />;

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface-raised shadow-1">
      <div className="overflow-x-auto" role="region" aria-label="Stock batches table" tabIndex={0}>
        <table className="w-full min-w-[1050px] border-collapse">
          <caption className="sr-only">Stock batches with quantities, expiry dates and stock adjustment actions.</caption>
          <thead><tr>
            <th scope="col" className={headerCell}>Product / batch</th>
            <th scope="col" className={headerCell}>Branch</th>
            <th scope="col" className={cx(headerCell, "text-right")}>On hand</th>
            <th scope="col" className={cx(headerCell, "text-right")}>Unit cost</th>
            <th scope="col" className={headerCell}>Expiry</th>
            <th scope="col" className={cx(headerCell, "text-right")}>Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-line">{batches.map((batch) => {
            const product = products.find((item) => item.id === batch.productId);
            const expired = expiryInfo(batch.expiryDate, today).status === "expired";
            return (
              <tr key={batch.id} className="transition-colors duration-150 hover:bg-surface-hover">
                <th scope="row" className={cx(cell, "min-w-60 text-left font-normal")}>
                  <p className="font-semibold">{product?.name ?? batch.productId}</p>
                  <p className="mt-1 mz-code text-ink-muted">{batch.batchNumber}</p>
                  <p className="mt-1.5 mz-caption text-ink-subtle">Received {formatDate(batch.receivedDate)}</p>
                  {batch.supplier && <p className="mt-0.5 mz-caption text-ink-muted">{batch.supplier}</p>}
                </th>
                <td className={cx(cell, "text-ink-muted")}>{branchName(batch.branchId)}</td>
                <td className={numberCell}><p className="font-semibold">{quantityFormat.format(batch.quantity)}</p><p className="mt-1 mz-caption text-ink-muted">{product?.unit ?? "units"}</p></td>
                <td className={numberCell}>{formatLKR(batch.costPrice)}</td>
                <td className={cell}>
                  <p className="mb-1.5 whitespace-nowrap mz-num">{batch.expiryDate ? formatDate(batch.expiryDate) : "No expiry date"}</p>
                  <ExpiryTag expiryDate={batch.expiryDate} today={today} />
                </td>
                <td className={cx(cell, "text-right")}>
                  <div className="flex justify-end gap-1">
                    <Button variant={expired && batch.quantity > 0 ? "secondary" : "ghost"} size="sm" onClick={() => onAdjust(batch)} aria-label={`${expired && batch.quantity > 0 ? "Dispose stock from" : "Adjust stock in"} batch ${batch.batchNumber}`}>
                      {expired && batch.quantity > 0 ? "Dispose stock" : "Adjust stock"}
                    </Button>
                    {onReceive && product?.isActive && <Button variant="ghost" size="sm" onClick={() => onReceive(batch.productId)} aria-label={`Receive stock for ${product.name}`}>Receive stock</Button>}
                  </div>
                </td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>
    </div>
  );
}

const movementLabel: Record<StockMovement["type"], string> = {
  receive: "Stock received",
  increase: "Stock increase",
  decrease: "Stock decrease",
  write_off: "Stock written off",
  transfer_in: "Transfer in",
  transfer_out: "Transfer out",
};

export function MovementTable({ movements, products, batches = [] }: { movements: StockMovement[]; products: InventoryProduct[]; batches?: StockBatch[] }) {
  if (!movements.length) return <EmptyTable icon="clipboard" title="No stock movements yet" description="Received stock, adjustments and disposals will appear here with their reasons and quantities." />;

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface-raised shadow-1">
      <div className="overflow-x-auto" role="region" aria-label="Stock movement history table" tabIndex={0}>
        <table className="w-full min-w-[980px] border-collapse">
          <caption className="sr-only">Stock movement history. Quantity changes are signed and balances are for the affected batch.</caption>
          <thead><tr>
            <th scope="col" className={headerCell}>Product</th>
            <th scope="col" className={headerCell}>Movement / reason</th>
            <th scope="col" className={headerCell}>Branch</th>
            <th scope="col" className={cx(headerCell, "text-right")}>Change</th>
            <th scope="col" className={cx(headerCell, "text-right")}>Batch balance</th>
            <th scope="col" className={headerCell}>Recorded</th>
          </tr></thead>
          <tbody className="divide-y divide-line">{movements.map((movement) => {
            const product = products.find((item) => item.id === movement.productId);
            const batch = batches.find((item) => item.id === movement.batchId);
            const recorded = new Date(movement.createdAt);
            return (
              <tr key={movement.id} className="transition-colors duration-150 hover:bg-surface-hover">
                <th scope="row" className={cx(cell, "min-w-52 text-left font-normal")}>
                  <p className="font-semibold">{product?.name ?? movement.productId}</p>
                  <p className="mt-1 mz-code text-ink-muted">{product?.sku ?? movement.productId}</p>
                  <p className="mt-1 mz-caption text-ink-muted">Batch <span className="mz-code">{batch?.batchNumber ?? movement.batchId}</span></p>
                </th>
                <td className={cx(cell, "max-w-80")}>
                  <p className="font-semibold">{movementLabel[movement.type]}</p>
                  <p className="mt-1 break-words text-ink-muted">{movement.reason}</p>
                  <p className="mt-1.5 mz-code text-ink-subtle">{movement.id}</p>
                </td>
                <td className={cx(cell, "text-ink-muted")}>{branchName(movement.branchId)}</td>
                <td className={cx(numberCell, "font-semibold", movement.quantity > 0 ? "text-success-ink" : movement.quantity < 0 ? "text-danger-ink" : "text-ink")}>
                  {movement.quantity > 0 ? "+" : ""}{quantityFormat.format(movement.quantity)}
                </td>
                <td className={numberCell}>{quantityFormat.format(movement.balanceAfter)}</td>
                <td className={cell}>
                  <p className="whitespace-nowrap mz-num">{movementDate.format(recorded)}</p>
                  <p className="mt-1 whitespace-nowrap mz-caption mz-num text-ink-subtle">{movementTime.format(recorded)} · Colombo</p>
                  <p className="mt-1 text-ink-muted">{movement.performedBy}</p>
                </td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>
    </div>
  );
}
