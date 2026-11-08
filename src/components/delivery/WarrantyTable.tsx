"use client";
import { useState } from "react";
import type { WarrantyClaim, WarrantyStatus } from "@/types/delivery";
import { warrantyEndDate, warrantyValid, nextWarrantyStatus } from "@/lib/delivery";
import { formatDate } from "@/lib/format";
import StatusBadge from "@/components/shared/StatusBadge";
import { Button } from "@/components/shared/Button";
import { Icon } from "@/components/shared/Icon";

interface Props {
  claims: WarrantyClaim[];
  onStatusChange: (id: string, status: WarrantyStatus) => void;
  onAddClaim: (c: Omit<WarrantyClaim, "id">) => void;
}

const emptyForm = {
  customerName: "",
  productName: "",
  serialNo: "",
  purchaseDate: "",
  warrantyMonths: "24",
  loanDevice: false,
  branchId: "b1",
};

const TERMINAL: WarrantyStatus[] = ["replaced", "returned"];

export default function WarrantyTable({ claims, onStatusChange, onAddClaim }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.customerName.trim()) e.customerName = "Required";
    if (!form.productName.trim()) e.productName = "Required";
    if (!form.serialNo.trim()) e.serialNo = "Required";
    if (!form.purchaseDate) e.purchaseDate = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onAddClaim({
      ...form,
      warrantyMonths: parseInt(form.warrantyMonths),
      status: "received",
      customerId: `cus-new-${Date.now()}`,
    });
    setForm(emptyForm);
    setErrors({});
    setShowForm(false);
  };

  const inp = (label: string, key: string, type = "text", placeholder = "") => (
    <div>
      <label className="mb-1 block text-xs font-medium text-ink-muted">
        {label} <span className="text-danger-ink">*</span>
      </label>
      <input
        type={type}
        value={(form as Record<string, unknown>)[key] as string}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className={`h-control-sm w-full rounded-md border px-3 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-1 focus:ring-focus ${errors[key] ? "border-danger-ink" : "border-line"}`}
      />
      {errors[key] && <p className="mt-0.5 text-xs text-danger-ink">{errors[key]}</p>}
    </div>
  );

  const activeCount = claims.filter((c) => !TERMINAL.includes(c.status)).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-ink">Warranty claims</p>
          <p className="mz-body-sm text-ink-muted">{activeCount} active claim(s)</p>
        </div>
        <Button
          onClick={() => { setShowForm((v) => !v); setErrors({}); }}
          icon={showForm ? undefined : "plus"}
        >
          {showForm ? "Cancel" : "New Claim"}
        </Button>
      </div>

      {/* New claim form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-info-bg bg-info-bg p-4">
          <p className="mz-label text-primary">New Warranty Claim</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {inp("Customer Name", "customerName", "text", "e.g. Sunil Perera")}
            {inp("Product Name", "productName", "text", "e.g. OMRON HEM-7121J")}
            {inp("Serial Number", "serialNo", "text", "e.g. OM-2024-00123")}
            {inp("Purchase Date", "purchaseDate", "date")}
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-muted">Warranty Period</label>
              <select
                value={form.warrantyMonths}
                onChange={(e) => setForm((f) => ({ ...f, warrantyMonths: e.target.value }))}
                className="h-control-sm w-full rounded-md border border-line px-3 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-focus"
              >
                <option value="12">12 months (1 year)</option>
                <option value="24">24 months (2 years)</option>
                <option value="36">36 months (3 years)</option>
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={form.loanDevice}
                  onChange={(e) => setForm((f) => ({ ...f, loanDevice: e.target.checked }))}
                  className="h-4 w-4 rounded accent-primary"
                />
                Loan device provided to customer
              </label>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Submit claim</Button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="bg-surface-sunken">
            <tr>
              {["Customer", "Product / Serial", "Warranty End", "Status", "Loan Device", "Action"].map((h) => (
                <th key={h} className="border-b border-line px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-surface-raised">
            {claims.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-ink-disabled">No warranty claims found.</td>
              </tr>
            ) : (
              claims.map((c) => {
                const endDate = warrantyEndDate(c.purchaseDate, c.warrantyMonths);
                const valid = warrantyValid(c.purchaseDate, c.warrantyMonths);
                const isTerminal = TERMINAL.includes(c.status);
                return (
                  <tr key={c.id} className="transition-colors hover:bg-surface-hover">
                    <td className="px-4 py-3 font-medium text-ink">{c.customerName}</td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-ink">{c.productName}</div>
                      <div className="mz-code text-ink-subtle">{c.serialNo}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-ink">{formatDate(endDate)}</div>
                      <div className={`mt-0.5 text-xs font-medium ${valid ? "text-success-ink" : "text-danger-ink"}`}>
                        {valid ? "In warranty" : "Expired"}
                      </div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge kind="warranty" status={c.status} /></td>
                    <td className="px-4 py-3">
                      {c.loanDevice ? (
                        <span className="inline-flex items-center rounded-full bg-info-bg px-2.5 py-0.5 text-xs font-medium text-info-ink">
                          Provided
                        </span>
                      ) : (
                        <span className="text-xs text-ink-disabled">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {!isTerminal ? (
                        <Button size="sm" onClick={() => onStatusChange(c.id, nextWarrantyStatus(c.status))}>
                          Next Step →
                        </Button>
                      ) : (
                        <span className="text-xs text-ink-disabled">Closed</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-ink-muted">
        <span>Showing {claims.length} claim(s)</span>
        <div className="flex items-center gap-1">
          <button className="rounded px-2 py-1 hover:bg-surface-hover disabled:opacity-40" disabled>
            <Icon name="chevron-left" size={16} />
          </button>
          <span className="rounded-md bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-on">1</span>
          <button className="rounded px-2 py-1 hover:bg-surface-hover disabled:opacity-40" disabled>
            <Icon name="chevron-right" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
