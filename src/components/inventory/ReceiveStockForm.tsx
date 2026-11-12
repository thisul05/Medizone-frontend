"use client";

import { useState, type FormEvent } from "react";
import { Alert, Button, Checkbox, Select, TextField } from "@/components/shared";
import { branchName, branches } from "@/data/branches";
import type { InventoryProduct, ReceiveStockInput } from "@/types/inventory";
import type { BranchId } from "@/types/roles";
import { InventoryModal } from "./InventoryModal";

interface ReceiveStockFormProps {
  products: InventoryProduct[];
  branchId: BranchId | "all";
  allowedBranches: BranchId[];
  productId?: string;
  today: string;
  onClose: () => void;
  onSave: (input: ReceiveStockInput) => { ok: boolean; error?: string };
}

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function ReceiveStockForm({ products, branchId, allowedBranches, productId, today, onClose, onSave }: ReceiveStockFormProps) {
  const activeProducts = products.filter((product) => product.isActive);
  const [selectedProduct, setSelectedProduct] = useState(activeProducts.find((product) => product.id === productId)?.id ?? activeProducts[0]?.id ?? "");
  const [selectedBranch, setSelectedBranch] = useState<BranchId>(branchId !== "all" && allowedBranches.includes(branchId) ? branchId : allowedBranches[0] ?? "b1");
  const [batchNumber, setBatchNumber] = useState("");
  const [quantity, setQuantity] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [receivedDate, setReceivedDate] = useState(today);
  const [trackExpiry, setTrackExpiry] = useState(true);
  const [expiryDate, setExpiryDate] = useState("");
  const [supplier, setSupplier] = useState("");
  const [reason, setReason] = useState("Stock received");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>();
  const product = products.find((item) => item.id === selectedProduct);

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found: Record<string, string> = {};
    if (!product?.isActive) found.productId = "Select an active product";
    if (!allowedBranches.includes(selectedBranch)) found.branchId = "Select a branch you can manage";
    if (!batchNumber.trim()) found.batchNumber = "Enter the batch number on the packaging";
    if (!quantity.trim() || !Number.isSafeInteger(Number(quantity)) || Number(quantity) < 1) found.quantity = "Enter a whole quantity of one or more";
    if (!costPrice.trim() || !Number.isFinite(Number(costPrice)) || Number(costPrice) < 0) found.costPrice = "Enter a purchase cost of zero or more";
    if (!validDate(receivedDate) || receivedDate > today) found.receivedDate = "Enter a valid received date on or before today";
    if (trackExpiry && (!validDate(expiryDate) || expiryDate < today || expiryDate < receivedDate)) found.expiryDate = "Enter an expiry date on or after today and the received date";
    if (reason.trim().length < 3) found.reason = "Enter a reason of at least three characters";
    setErrors(found);
    setError(undefined);
    if (Object.keys(found).length) {
      const field = event.currentTarget.elements.namedItem(Object.keys(found)[0]);
      if (field instanceof HTMLElement) field.focus();
      return;
    }
    const result = onSave({ productId: selectedProduct, branchId: selectedBranch, batchNumber: batchNumber.trim(), quantity: Number(quantity), costPrice: Number(costPrice), receivedDate, expiryDate: trackExpiry ? expiryDate : null, supplier: supplier.trim(), reason: reason.trim() });
    if (result.ok) onClose();
    else setError(result.error ?? "The stock could not be received. Check the batch details and try again.");
  }

  return (
    <InventoryModal title="Receive stock" description="Record a batch at its receiving branch. Each batch keeps its own cost and expiry date." onClose={onClose}>
      <form onSubmit={save} onInvalid={(event) => {
        const input = event.target as HTMLInputElement;
        setErrors((current) => ({ ...current, [input.name]: input.validationMessage }));
      }}>
        <div className="flex flex-col gap-5 px-5 py-5 sm:px-6">
          {error && <Alert tone="danger">{error}</Alert>}
          {!activeProducts.length && <Alert tone="warning" title="Add an active product first">You need an active product before you can receive stock.</Alert>}
          {!allowedBranches.length && <Alert tone="danger">There are no branches available for receiving stock.</Alert>}
          <Select name="productId" label="Product" placeholder="Select a product" value={selectedProduct} options={activeProducts.map((item) => ({ value: item.id, label: `${item.name} · ${item.sku}` }))} onChange={(event) => setSelectedProduct(event.target.value)} required error={errors.productId} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select name="branchId" label="Receiving branch" value={selectedBranch} options={branches.filter((branch) => allowedBranches.includes(branch.id)).map((branch) => ({ value: branch.id, label: branchName(branch.id) }))} onChange={(event) => setSelectedBranch(event.target.value as BranchId)} required error={errors.branchId} />
            <TextField name="batchNumber" label="Batch number" placeholder="BN-2026-001" value={batchNumber} onChange={(event) => setBatchNumber(event.target.value)} required maxLength={60} error={errors.batchNumber} className="mz-code" />
            <TextField name="quantity" label={`Quantity${product ? ` (${product.unit})` : ""}`} type="number" min="1" step="1" max={Number.MAX_SAFE_INTEGER} value={quantity} onChange={(event) => setQuantity(event.target.value)} required error={errors.quantity} />
            <TextField name="costPrice" label="Purchase cost per unit" prefix="Rs." type="number" min="0" step="0.01" value={costPrice} onChange={(event) => setCostPrice(event.target.value)} required error={errors.costPrice} />
            <TextField name="receivedDate" label="Received date" type="date" max={today} value={receivedDate} onChange={(event) => setReceivedDate(event.target.value)} required error={errors.receivedDate} />
            <TextField name="supplier" label="Supplier" optional placeholder="Supplier name" value={supplier} onChange={(event) => setSupplier(event.target.value)} maxLength={120} />
          </div>
          <div className="flex flex-col gap-4 rounded-md border border-line bg-surface-sunken p-4">
            <Checkbox label="Track an expiry date" checked={trackExpiry} onChange={(event) => setTrackExpiry(event.target.checked)} description="Leave checked for medicines. Clear only for products with no expiry date." />
            {trackExpiry && <TextField name="expiryDate" label="Expiry date" type="date" min={receivedDate > today ? receivedDate : today} value={expiryDate} onChange={(event) => setExpiryDate(event.target.value)} required error={errors.expiryDate} hint="Use the expiry date printed on the batch packaging." />}
          </div>
          <TextField name="reason" label="Receiving note" value={reason} onChange={(event) => setReason(event.target.value)} required minLength={3} maxLength={240} error={errors.reason} hint="This note is saved in the stock movement history." />
        </div>
        <div className="flex flex-wrap justify-end gap-3 border-t border-line bg-surface-sunken px-5 py-4 sm:px-6">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" icon="package" disabled={!activeProducts.length || !allowedBranches.length}>Receive stock</Button>
        </div>
      </form>
    </InventoryModal>
  );
}

export default ReceiveStockForm;
