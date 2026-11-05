"use client";
import { useState } from "react";
import { warrantyValid, warrantyEndDate } from "@/lib/delivery";

export default function WarrantyChecker() {
  const [purchaseDate, setPurchaseDate] = useState("");
  const [months, setMonths] = useState("24");
  const [result, setResult] = useState<{ valid: boolean; endDate: string } | null>(null);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseDate) return;
    setResult({
      valid: warrantyValid(purchaseDate, parseInt(months)),
      endDate: warrantyEndDate(purchaseDate, parseInt(months)),
    });
  };

  return (
    <div className="mx-auto max-w-md space-y-5">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-base font-semibold text-[#1a2f4e]">Warranty Validity Check</h3>
        <p className="mb-5 text-xs text-gray-500">
          Enter the purchase date and warranty period to check if a device is still under warranty.
        </p>
        <form onSubmit={handleCheck} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Purchase Date</label>
            <input
              type="date"
              required
              value={purchaseDate}
              onChange={(e) => { setPurchaseDate(e.target.value); setResult(null); }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f4e]"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Warranty Period</label>
            <select
              value={months}
              onChange={(e) => { setMonths(e.target.value); setResult(null); }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f4e]"
            >
              <option value="12">12 months — 1 year</option>
              <option value="24">24 months — 2 years</option>
              <option value="36">36 months — 3 years</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-[#1a2f4e] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#243d63]"
          >
            Check Warranty
          </button>
        </form>
      </div>

      {result && (
        <div
          className={`rounded-lg border-2 p-6 text-center transition-all ${
            result.valid
              ? "border-green-400 bg-green-50"
              : "border-red-400 bg-red-50"
          }`}
        >
          <div className={`text-4xl font-bold ${result.valid ? "text-green-500" : "text-red-400"}`}>
            {result.valid ? "✓" : "✗"}
          </div>
          <div className={`mt-2 text-xl font-bold ${result.valid ? "text-green-700" : "text-red-600"}`}>
            {result.valid ? "Warranty Valid" : "Warranty Expired"}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Warranty end date:{" "}
            <span className="font-semibold text-gray-800">{result.endDate}</span>
          </div>
          {!result.valid && (
            <p className="mt-2 text-xs text-red-500">
              This device is no longer covered. The customer is responsible for repair costs.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
