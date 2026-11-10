"use client";

import { useState, type FormEvent } from "react";
import { Alert, Button, Select, TextField } from "@/components/shared";
import { branchName, branches } from "@/data/branches";
import { formatDate } from "@/lib/format";
import { expiryInfo } from "@/lib/inventory";
import type { AdjustStockInput, InventoryProduct, StockBatch } from "@/types/inventory";
import type { BranchId } from "@/types/roles";
import { InventoryModal } from "./InventoryModal";

interface AdjustmentFormProps {
  batch: StockBatch;
  product: InventoryProduct;
  allowedBranches: BranchId[];
  today: string;
  onClose: () => void;
  onSave: (input: AdjustStockInput) => { ok: boolean; error?: string };
}

export function AdjustmentForm({ batch, product, allowedBranches, today, onClose, onSave }: AdjustmentFormProps) {
  const expired = expiryInfo(batch.expiryDate, today).status === "expired";
  const destinations = allowedBranches.filter((id) => id !== batch.branchId);
  const [type, setType] = useState<AdjustStockInput["type"]>(expired ? "write_off" : "decrease");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [toBranchId, setToBranchId] = useState<BranchId | "">(destinations[0] ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>();
  const options = expired
    ? [{ value: "write_off", label: "Write off expired stock" }]
    : [
      { value: "decrease", label: "Decrease stock" },
      { value: "increase", label: "Increase stock" },
      { value: "write_off", label: "Write off damaged stock" },
      ...(destinations.length ? [{ value: "transfer", label: "Transfer to another branch" }] : []),
    ];

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found: Record<string, string> = {};
    if (!options.some((option) => option.value === type)) found.type = "Select an available adjustment type";
    if (!quantity.trim() || !Number.isSafeInteger(Number(quantity)) || Number(quantity) < 1) found.quantity = "Enter a whole quantity of one or more";
    else if (type !== "increase" && Number(quantity) > batch.quantity) found.quantity = `You can adjust up to ${batch.quantity} ${product.unit}`;
    if (reason.trim().length < 3) found.reason = "Enter a reason of at least three characters";
    if (type === "transfer" && (!toBranchId || !destinations.includes(toBranchId))) found.toBranchId = "Select a different branch you can manage";
    setErrors(found);
    setError(undefined);
    if (Object.keys(found).length) {
      const field = event.currentTarget.elements.namedItem(Object.keys(found)[0]);
      if (field instanceof HTMLElement) field.focus();
      return;
    }
    const input: AdjustStockInput = { batchId: batch.id, type, quantity: Number(quantity), reason: reason.trim() };
    if (type === "transfer" && toBranchId) input.toBranchId = toBranchId;
    const result = onSave(input);
    if (result.ok) onClose();
    else setError(result.error ?? "The adjustment could not be saved. Check the quantity and try again.");
  }

  return (
    <InventoryModal title="Adjust stock" description={product.name} onClose={onClose}>
      <form onSubmit={save} onInvalid={(event) => {
        const input = event.target as HTMLInputElement;
        setErrors((current) => ({ ...current, [input.name]: input.validationMessage }));
      }}>
        <div className="flex flex-col gap-5 px-5 py-5 sm:px-6">
          {error && <Alert tone="danger">{error}</Alert>}
          <dl className="grid grid-cols-2 gap-4 rounded-md border border-line bg-surface-sunken p-4">
            <div><dt className="mz-body-sm text-ink-muted">Batch number</dt><dd className="mt-1 mz-code">{batch.batchNumber}</dd></div>
            <div><dt className="mz-body-sm text-ink-muted">Branch</dt><dd className="mt-1 font-medium">{branchName(batch.branchId)}</dd></div>
            <div><dt className="mz-body-sm text-ink-muted">Recorded quantity</dt><dd className="mt-1 mz-num font-semibold">{batch.quantity.toLocaleString()} {product.unit}</dd></div>
            <div><dt className="mz-body-sm text-ink-muted">Expiry date</dt><dd className="mt-1">{batch.expiryDate ? formatDate(batch.expiryDate) : "No expiry date"}</dd></div>
          </dl>
          {expired && <Alert tone="danger" title="Expired stock is quarantined">This batch is excluded from available stock. Only a write-off for disposal can be recorded.</Alert>}
          <Select name="type" label="Adjustment type" options={options} value={type} onChange={(event) => setType(event.target.value as AdjustStockInput["type"])} required error={errors.type} />
          {type === "transfer" && <Select name="toBranchId" label="Destination branch" placeholder="Select a branch" options={branches.filter((branch) => destinations.includes(branch.id)).map((branch) => ({ value: branch.id, label: branchName(branch.id) }))} value={toBranchId} onChange={(event) => setToBranchId(event.target.value as BranchId)} required error={errors.toBranchId} hint="The same batch and expiry date are retained at the destination." />}
          <TextField name="quantity" label={`Quantity to ${type === "increase" ? "add" : type === "transfer" ? "transfer" : type === "write_off" ? "write off" : "remove"} (${product.unit})`} type="number" min="1" step="1" max={type === "increase" ? Number.MAX_SAFE_INTEGER - batch.quantity : batch.quantity} value={quantity} onChange={(event) => setQuantity(event.target.value)} required error={errors.quantity} hint={type === "increase" ? "Use an increase to correct a stock count. Receive new deliveries as a new batch." : `This batch contains ${batch.quantity.toLocaleString()} ${product.unit}.`} />
          <TextField name="reason" label="Reason for adjustment" placeholder={type === "write_off" ? "Expired batch removed for disposal" : type === "transfer" ? "Branch stock replenishment" : "Physical stock count correction"} value={reason} onChange={(event) => setReason(event.target.value)} required minLength={3} maxLength={240} error={errors.reason} hint="The reason and quantity are saved in the stock movement history." />
          {type !== "increase" && batch.quantity === 0 && <Alert tone="warning">This batch has no stock to remove or transfer.</Alert>}
        </div>
        <div className="flex flex-wrap justify-end gap-3 border-t border-line bg-surface-sunken px-5 py-4 sm:px-6">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" icon="check" variant={type === "write_off" ? "danger" : "primary"} disabled={type !== "increase" && batch.quantity === 0}>Save adjustment</Button>
        </div>
      </form>
    </InventoryModal>
  );
}

export default AdjustmentForm;
