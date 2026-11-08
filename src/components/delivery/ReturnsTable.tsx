"use client";
import { useState } from "react";
import type { CustomerReturn, ReturnStatus } from "@/types/delivery";
import { formatDate, formatPhone } from "@/lib/format";
import StatusBadge from "@/components/shared/StatusBadge";
import { Button } from "@/components/shared/Button";
import { Icon } from "@/components/shared/Icon";

interface Props {
  returns: CustomerReturn[];
  onStatusChange: (id: string, status: ReturnStatus) => void;
  onAddReturn: (r: Omit<CustomerReturn, "id">) => void;
}

const emptyForm = {
  customerName: "",
  phone: "",
  productName: "",
  reason: "",
  branchId: "b1",
};

export default function ReturnsTable({ returns, onStatusChange, onAddReturn }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Partial<typeof emptyForm>>({});

  const validate = () => {
    const e: Partial<typeof emptyForm> = {};
    if (!form.customerName.trim()) e.customerName = "Required";
    if (!form.productName.trim()) e.productName = "Required";
    if (!form.reason.trim()) e.reason = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onAddReturn({
      ...form,
      customerId: `cus-new-${Date.now()}`,
      status: "requested",
      requestedAt: new Date().toISOString().slice(0, 10),
    });
    setForm(emptyForm);
    setErrors({});
    setShowForm(false);
  };

  const field = (label: string, key: keyof typeof emptyForm, placeholder = "") => (
    <div>
      <label className="mb-1 block text-xs font-medium text-ink-muted">
        {label} {key !== "phone" && key !== "branchId" && <span className="text-danger-ink">*</span>}
      </label>
      <input
        value={form[key] as string}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className={`h-control-sm w-full rounded-md border px-3 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-1 focus:ring-focus ${errors[key] ? "border-danger-ink" : "border-line"}`}
      />
      {errors[key] && <p className="mt-0.5 text-xs text-danger-ink">{errors[key]}</p>}
    </div>
  );

  const openCount = returns.filter((r) => r.status === "requested").length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-ink">Customer returns</p>
          <p className="mz-body-sm text-ink-muted">{openCount} open request(s)</p>
        </div>
        <Button
          onClick={() => { setShowForm((v) => !v); setErrors({}); }}
          icon={showForm ? undefined : "plus"}
        >
          {showForm ? "Cancel" : "New Return"}
        </Button>
      </div>

      {/* New return form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-info-bg bg-info-bg p-4">
          <p className="mz-label text-primary">New Return Request</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {field("Customer Name", "customerName", "e.g. Sunil Perera")}
            {field("Phone", "phone", "07X XXX XXXX")}
            {field("Product Name", "productName", "e.g. OMRON HEM-7121J")}
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-muted">Branch</label>
              <select
                value={form.branchId}
                onChange={(e) => setForm((f) => ({ ...f, branchId: e.target.value }))}
                className="h-control-sm w-full rounded-md border border-line px-3 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-focus"
              >
                {["b1", "b2", "b3", "b4"].map((b) => (
                  <option key={b} value={b}>Branch {b.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-muted">
              Reason <span className="text-danger-ink">*</span>
            </label>
            <textarea
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              rows={2}
              placeholder="Describe the reason for return"
              className={`w-full rounded-md border px-3 py-2 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-1 focus:ring-focus ${errors.reason ? "border-danger-ink" : "border-line"}`}
            />
            {errors.reason && <p className="mt-0.5 text-xs text-danger-ink">{errors.reason}</p>}
          </div>
          <div className="flex justify-end">
            <Button type="submit">Submit return</Button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="bg-surface-sunken">
            <tr>
              {["Customer", "Product", "Reason", "Date", "Status", "Actions"].map((h) => (
                <th key={h} className="border-b border-line px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-surface-raised">
            {returns.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-ink-disabled">No returns found.</td>
              </tr>
            ) : (
              returns.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-surface-hover">
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink">{r.customerName}</div>
                    <div className="mz-body-sm text-ink-muted">{formatPhone(r.phone)}</div>
                  </td>
                  <td className="px-4 py-3 text-ink">{r.productName}</td>
                  <td className="max-w-[200px] px-4 py-3 text-xs text-ink-muted">{r.reason}</td>
                  <td className="px-4 py-3 text-xs text-ink-muted">{formatDate(r.requestedAt)}</td>
                  <td className="px-4 py-3"><StatusBadge kind="customerReturn" status={r.status} /></td>
                  <td className="px-4 py-3">
                    {r.status === "requested" && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="success" onClick={() => onStatusChange(r.id, "approved")}>
                          Approve
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => onStatusChange(r.id, "rejected")}>
                          Reject
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-ink-muted">
        <span>Showing {returns.length} return(s)</span>
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
