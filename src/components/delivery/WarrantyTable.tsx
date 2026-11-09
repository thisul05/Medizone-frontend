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
  warrantyMonths: "",
  loanDevice: false,
  branchId: "",
};

const TERMINAL: WarrantyStatus[] = ["replaced", "returned"];
const ROWS_PER_PAGE = 5;

const BRANCHES = [
  { id: "b1", label: "Piliyandala (Main branch)" },
  { id: "b2", label: "Miriswattha" },
  { id: "b3", label: "Kesbewa" },
  { id: "b4", label: "Moratuwa" },
  { id: "b5", label: "Thalawathugoda" },
];

export default function WarrantyTable({ claims, onStatusChange, onAddClaim }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(ROWS_PER_PAGE);

  const totalPages = Math.max(1, Math.ceil(claims.length / rowsPerPage));
  const paginated = claims.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const startRow = claims.length === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const endRow = Math.min(page * rowsPerPage, claims.length);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.customerName.trim()) e.customerName = "Required";
    if (!form.productName.trim()) e.productName = "Required";
    if (!form.serialNo.trim()) e.serialNo = "Required";
    if (!form.purchaseDate) e.purchaseDate = "Required";
    if (!form.warrantyMonths) e.warrantyMonths = "Required";
    if (!form.branchId) e.branchId = "Required";
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
    setPage(1);
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setErrors({});
    setShowForm(false);
  };

  const activeCount = claims.filter((c) => !TERMINAL.includes(c.status)).length;

  const inp = (label: string, key: string, type = "text", placeholder = "") => (
    <div>
      <label className="mb-1 block text-sm font-medium text-ink">
        {label} <span className="text-danger-ink">*</span>
      </label>
      <input
        type={type}
        value={(form as Record<string, unknown>)[key] as string}
        onChange={(ev) => setForm((f) => ({ ...f, [key]: ev.target.value }))}
        placeholder={placeholder}
        className={`h-10 w-full rounded-md border px-3 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-focus ${errors[key] ? "border-danger-ink" : "border-line"}`}
      />
      {errors[key] && <p className="mt-0.5 text-xs text-danger-ink">{errors[key]}</p>}
    </div>
  );

  /* ── Full-page new claim form ─────────────────────────────────── */
  if (showForm) {
    return (
      <div className="space-y-6">
        {/* Back + heading */}
        <div>
          <button
            type="button"
            onClick={handleCancel}
            className="mb-3 flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink"
          >
            <Icon name="chevron-left" size={16} />
            Back
          </button>
          <h2 className="text-xl font-bold text-ink">New Warranty Claim</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Fill in the details from the customer&apos;s invoice and product label.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Section 1 */}
          <div className="rounded-lg border border-line bg-surface-raised p-6">
            <h3 className="mb-4 text-sm font-semibold text-ink">Customer &amp; product details</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {inp("Customer Name", "customerName", "text", "e.g. Sunil Perera")}
              {inp("Product Name", "productName", "text", "e.g. OMRON HEM-7121J")}
              {inp("Serial Number", "serialNo", "text", "e.g. OM-2024-00123")}
              {inp("Purchase Date", "purchaseDate", "date")}
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-ink">Branch</label>
                <select
                  value={form.branchId}
                  onChange={(e) => setForm((f) => ({ ...f, branchId: e.target.value }))}
                  className={`h-10 w-full rounded-md border px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-focus ${errors.branchId ? "border-danger-ink" : "border-line"}`}
                >
                  <option value="">Select branch</option>
                  {BRANCHES.map((b) => (
                    <option key={b.id} value={b.id}>{b.label}</option>
                  ))}
                </select>
                {errors.branchId && <p className="mt-0.5 text-xs text-danger-ink">{errors.branchId}</p>}
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="rounded-lg border border-line bg-surface-raised p-6">
            <h3 className="mb-4 text-sm font-semibold text-ink">Warranty details</h3>
            <div className="space-y-4">
              <div className="max-w-sm">
                <label className="mb-1 block text-sm font-medium text-ink">
                  Warranty Period <span className="text-danger-ink">*</span>
                </label>
                <select
                  value={form.warrantyMonths}
                  onChange={(e) => setForm((f) => ({ ...f, warrantyMonths: e.target.value }))}
                  className={`h-10 w-full rounded-md border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-focus ${errors.warrantyMonths ? "border-danger-ink text-ink" : "border-line"} ${form.warrantyMonths === "" ? "text-ink-subtle" : "text-ink"}`}
                >
                  <option value="">Select warranty period</option>
                  <option value="12">12 months (1 year)</option>
                  <option value="24">24 months (2 years)</option>
                  <option value="36">36 months (3 years)</option>
                </select>
                {errors.warrantyMonths && <p className="mt-0.5 text-xs text-danger-ink">{errors.warrantyMonths}</p>}
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={form.loanDevice}
                  onChange={(e) => setForm((f) => ({ ...f, loanDevice: e.target.checked }))}
                  className="h-4 w-4 rounded accent-primary"
                />
                Loan device provided to customer.
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between">
            <Button variant="secondary" type="button" onClick={handleCancel}>Cancel</Button>
            <Button type="submit">Submit Claim</Button>
          </div>
        </form>
      </div>
    );
  }

  /* ── Claims list ──────────────────────────────────────────────── */
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-ink">Warranty claims</p>
          <p className="mz-body-sm text-ink-muted">{activeCount} active claim(s)</p>
        </div>
        <Button onClick={() => setShowForm(true)} icon="plus">New Claim</Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="bg-surface-sunken">
            <tr>
              {["Customer", "Product / Serial No.", "Warranty End Date", "Status", "Loan Device", "Action"].map((h) => (
                <th key={h} className="border-b border-line px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-surface-raised">
            {claims.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Icon name="clipboard" size={32} className="text-ink-disabled" />
                    <p className="text-sm font-medium text-ink-disabled">No warranty claims found.</p>
                    <p className="text-xs text-primary">New claims will appear here once they are created.</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((c) => {
                const endDate = warrantyEndDate(c.purchaseDate, c.warrantyMonths);
                const valid = warrantyValid(c.purchaseDate, c.warrantyMonths);
                const isTerminal = TERMINAL.includes(c.status);
                return (
                  <tr key={c.id} className="transition-colors hover:bg-surface-hover">
                    <td className="px-4 py-3">
                      <div className="font-medium text-ink">{c.customerName}</div>
                      <div className="mz-body-sm text-ink-muted">{c.customerId}</div>
                    </td>
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
                        <Button size="sm" variant="secondary" onClick={() => onStatusChange(c.id, nextWarrantyStatus(c.status))}>
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
        <span>Showing {claims.length === 0 ? "0 of 0" : `${startRow}–${endRow} of ${claims.length}`} claims</span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-ink-muted">Rows per page</span>
            <span className="rounded border border-line px-2 py-0.5 text-xs text-ink">{rowsPerPage} ▾</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded px-2 py-1 text-xs hover:bg-surface-hover disabled:opacity-40"
            >
              &lsaquo; Previous
            </button>
            <span className="rounded-md bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-on">{page}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded px-2 py-1 text-xs hover:bg-surface-hover disabled:opacity-40"
            >
              Next &rsaquo;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
