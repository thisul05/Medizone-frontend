"use client";
import { useState } from "react";
import type { CustomerReturn, ReturnStatus } from "@/types/delivery";
import StatusBadge from "./StatusBadge";

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
      <label className="mb-1 block text-xs font-medium text-gray-600">
        {label} {key !== "phone" && key !== "branchId" && <span className="text-red-500">*</span>}
      </label>
      <input
        value={form[key]}
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
          {returns.filter((r) => r.status === "requested").length} open request(s)
        </p>
        <button
          onClick={() => { setShowForm((v) => !v); setErrors({}); }}
          className="rounded bg-[#1a2f4e] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#243d63]"
        >
          {showForm ? "Cancel" : "+ New Return"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-4"
        >
          <p className="text-sm font-semibold text-[#1a2f4e]">New Return Request</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {field("Customer Name", "customerName", "e.g. Sunil Perera")}
            {field("Phone", "phone", "077XXXXXXX")}
            {field("Product Name", "productName", "e.g. OMRON HEM-7121J")}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Branch</label>
              <select
                value={form.branchId}
                onChange={(e) => setForm((f) => ({ ...f, branchId: e.target.value }))}
                className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#1a2f4e]"
              >
                {["b1", "b2", "b3", "b4"].map((b) => (
                  <option key={b} value={b}>Branch {b.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              rows={2}
              placeholder="Describe the reason for return"
              className={`w-full rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#1a2f4e] ${errors.reason ? "border-red-400" : "border-gray-300"}`}
            />
            {errors.reason && <p className="mt-0.5 text-xs text-red-500">{errors.reason}</p>}
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded bg-[#1a2f4e] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#243d63]"
            >
              Submit Return
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {["Customer", "Product", "Reason", "Date", "Status", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {returns.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">No returns found.</td>
              </tr>
            ) : (
              returns.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{r.customerName}</div>
                    <div className="text-xs text-gray-500">{r.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{r.productName}</td>
                  <td className="max-w-[200px] px-4 py-3 text-xs text-gray-500">{r.reason}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{r.requestedAt}</td>
                  <td className="px-4 py-3"><StatusBadge value={r.status} variant="return" /></td>
                  <td className="px-4 py-3">
                    {r.status === "requested" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => onStatusChange(r.id, "approved")}
                          className="rounded bg-green-600 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => onStatusChange(r.id, "rejected")}
                          className="rounded bg-red-500 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-red-600"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
