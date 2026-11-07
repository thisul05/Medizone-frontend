"use client";
import { useState } from "react";
import type { WarrantyClaim, WarrantyStatus } from "@/types/delivery";
import { warrantyEndDate, warrantyValid, nextWarrantyStatus } from "@/lib/delivery";
import StatusBadge from "./StatusBadge";

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
      <label className="mb-1 block text-xs font-medium text-gray-600">
        {label} <span className="text-red-500">*</span>
      </label>
      <input
        type={type}
        value={(form as Record<string, unknown>)[key] as string}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className={`w-full rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#1a2f4e] ${errors[key] ? "border-red-400" : "border-gray-300"}`}
      />
      {errors[key] && <p className="mt-0.5 text-xs text-red-500">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {claims.filter((c) => !TERMINAL.includes(c.status)).length} active claim(s)
        </p>
        <button
          onClick={() => { setShowForm((v) => !v); setErrors({}); }}
          className="rounded bg-[#1a2f4e] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#243d63]"
        >
          {showForm ? "Cancel" : "+ New Claim"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-semibold text-[#1a2f4e]">New Warranty Claim</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {inp("Customer Name", "customerName", "text", "e.g. Sunil Perera")}
            {inp("Product Name", "productName", "text", "e.g. OMRON HEM-7121J")}
            {inp("Serial Number", "serialNo", "text", "e.g. OM-2024-00123")}
            {inp("Purchase Date", "purchaseDate", "date")}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Warranty Period</label>
              <select
                value={form.warrantyMonths}
                onChange={(e) => setForm((f) => ({ ...f, warrantyMonths: e.target.value }))}
                className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#1a2f4e]"
              >
                <option value="12">12 months (1 year)</option>
                <option value="24">24 months (2 years)</option>
                <option value="36">36 months (3 years)</option>
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.loanDevice}
                  onChange={(e) => setForm((f) => ({ ...f, loanDevice: e.target.checked }))}
                  className="h-4 w-4 rounded accent-[#1a2f4e]"
                />
                Loan device provided to customer
              </label>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="rounded bg-[#1a2f4e] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#243d63]">
              Submit Claim
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {["Customer", "Product / Serial", "Warranty End", "Status", "Loan Device", "Action"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {claims.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">No warranty claims found.</td>
              </tr>
            ) : (
              claims.map((c) => {
                const endDate = warrantyEndDate(c.purchaseDate, c.warrantyMonths);
                const valid = warrantyValid(c.purchaseDate, c.warrantyMonths);
                const isTerminal = TERMINAL.includes(c.status);
                return (
                  <tr key={c.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.customerName}</td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-gray-800">{c.productName}</div>
                      <div className="font-mono text-xs text-gray-400">{c.serialNo}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-gray-700">{endDate}</div>
                      <div className={`mt-0.5 text-xs font-medium ${valid ? "text-green-600" : "text-red-500"}`}>
                        {valid ? "In warranty" : "Expired"}
                      </div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge value={c.status} variant="warranty" /></td>
                    <td className="px-4 py-3">
                      {c.loanDevice ? (
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                          Provided
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {!isTerminal ? (
                        <button
                          onClick={() => onStatusChange(c.id, nextWarrantyStatus(c.status))}
                          className="rounded bg-[#1a2f4e] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#243d63]"
                        >
                          Next Step →
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">Closed</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
