"use client";
import { useState } from "react";
import { warrantyValid, warrantyEndDate } from "@/lib/delivery";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/shared/Button";
import { Icon } from "@/components/shared/Icon";

type InnerTab = "checker" | "history" | "guide";

const INNER_TABS: { id: InnerTab; label: string; count?: number }[] = [
  { id: "checker", label: "Checker" },
  { id: "history", label: "Check history", count: 48 },
  { id: "guide", label: "Warranty guide" },
];

const KPI = [
  { label: "Checks today", value: 48, sub: "7 Nov 2026", icon: "calendar" as const },
  { label: "Valid warranties", value: 36, sub: "Of today's checks", icon: "shield-check" as const },
  { label: "Expired warranties", value: 12, sub: "Of today's checks", icon: "alert-circle" as const },
  { label: "Expiring within 30 days", value: 7, sub: "Of valid checks today", icon: "clock" as const },
];

const todayIso = new Date().toISOString().slice(0, 10);

export default function WarrantyChecker() {
  const [purchaseDate, setPurchaseDate] = useState("");
  const [months, setMonths] = useState("24");
  const [result, setResult] = useState<{
    valid: boolean;
    endDate: string;
    purchaseDate: string;
    months: string;
    checkedAt: string;
  } | null>(null);
  const [innerTab, setInnerTab] = useState<InnerTab>("checker");

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseDate) return;
    setResult({
      valid: warrantyValid(purchaseDate, parseInt(months)),
      endDate: warrantyEndDate(purchaseDate, parseInt(months)),
      purchaseDate,
      months,
      checkedAt: todayIso,
    });
  };

  const handleNewCheck = () => {
    setPurchaseDate("");
    setMonths("24");
    setResult(null);
  };

  const daysRemaining = result
    ? Math.round((new Date(result.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="space-y-5">
      {/* KPI row + New check button */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
          {KPI.map((s) => (
            <div key={s.label} className="rounded-lg border border-line bg-surface-raised p-4 shadow-1">
              <div className="mb-2 flex items-start justify-between">
                <p className="mz-overline text-ink-muted">{s.label}</p>
                <Icon name={s.icon} size={15} className="text-ink-subtle" />
              </div>
              <p className="mz-kpi text-primary">{s.value}</p>
              <p className="mz-body-sm mt-1 text-ink-subtle">{s.sub}</p>
            </div>
          ))}
        </div>
        <Button icon="plus" onClick={handleNewCheck}>New check</Button>
      </div>

      {/* Inner tabs */}
      <div className="border-b border-line">
        <div className="flex gap-6">
          {INNER_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setInnerTab(t.id)}
              className={`flex items-center gap-1.5 border-b-2 pb-2.5 text-sm font-medium transition-colors ${
                innerTab === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              {t.label}
              {t.count !== undefined && (
                <span className={`rounded-full px-1.5 py-0.5 text-xs ${
                  innerTab === t.id ? "bg-primary text-primary-on" : "bg-surface-sunken text-ink-muted"
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Checker tab */}
      {innerTab === "checker" && (
        <div className="space-y-4">
          {/* Form */}
          <div className="rounded-lg border border-line bg-surface-raised p-5 shadow-1">
            <h3 className="mz-h3 mb-0.5 text-primary">Check warranty</h3>
            <p className="mb-4 mz-body-sm text-ink-muted">
              Enter the purchase date and warranty period shown on the customer&apos;s invoice.
            </p>
            <form onSubmit={handleCheck} className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <div>
                <label className="mb-1 block mz-label text-ink">Purchase date</label>
                <input
                  type="date"
                  required
                  value={purchaseDate}
                  onChange={(e) => { setPurchaseDate(e.target.value); setResult(null); }}
                  className="h-control-md w-full rounded-md border border-line px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-focus"
                />
                <p className="mt-1 mz-caption text-ink-subtle">Use the original invoice date.</p>
              </div>
              <div>
                <label className="mb-1 block mz-label text-ink">Warranty period</label>
                <select
                  value={months}
                  onChange={(e) => { setMonths(e.target.value); setResult(null); }}
                  className="h-control-md w-full rounded-md border border-line px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-focus"
                >
                  <option value="12">12 months</option>
                  <option value="24">24 months</option>
                  <option value="36">36 months</option>
                </select>
                <p className="mt-1 mz-caption text-ink-subtle">Available periods: 12 months / 24 months / 36 months</p>
              </div>
              <div className="pb-[22px]">
                <Button type="submit" icon="shield-check">Check Warranty</Button>
              </div>
            </form>
          </div>

          {/* Result card */}
          {result && (
            <div className={`rounded-lg border-2 p-5 ${
              result.valid ? "border-success-solid bg-success-bg" : "border-danger-solid bg-danger-bg"
            }`}>
              {/* Header */}
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    result.valid ? "bg-success-solid" : "bg-danger-solid"
                  }`}>
                    <Icon name={result.valid ? "circle-check" : "x"} size={20} className="text-white" />
                  </div>
                  <div>
                    <p className={`mz-h3 ${result.valid ? "text-success-ink" : "text-danger-ink"}`}>
                      {result.valid ? "Warranty Valid" : "Warranty Expired"}
                    </p>
                    <p className={`mz-body-sm ${result.valid ? "text-success-ink" : "text-danger-ink"}`}>
                      {result.valid
                        ? `This purchase is covered for another ${daysRemaining} days.`
                        : `Coverage ended ${Math.abs(daysRemaining)} days ago.`}
                    </p>
                  </div>
                </div>
                <StatusBadge valid={result.valid} />
              </div>

              {/* 3-col summary */}
              <div className="rounded-md border border-line bg-surface-raised px-4 py-3">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="mz-overline text-ink-subtle">Purchase date</p>
                    <p className="mt-1 mz-label text-ink">{formatDate(result.purchaseDate)}</p>
                  </div>
                  <div>
                    <p className="mz-overline text-ink-subtle">Warranty period</p>
                    <p className="mt-1 mz-label text-ink">{result.months} months</p>
                  </div>
                  <div>
                    <p className="mz-overline text-ink-subtle">Warranty end date</p>
                    <p className={`mt-1 mz-label font-semibold ${result.valid ? "text-success-ink" : "text-danger-ink"}`}>
                      {formatDate(result.endDate)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer note + timestamp */}
              <div className="mt-3 flex items-start justify-between gap-4">
                <div className="flex items-start gap-2">
                  <Icon name="info" size={14} className={`mt-0.5 shrink-0 ${result.valid ? "text-ink-subtle" : "text-danger-ink"}`} />
                  <p className={`mz-body-sm ${result.valid ? "text-ink-subtle" : "text-danger-ink"}`}>
                    {result.valid
                      ? "Verify the original invoice and product serial number before registering a claim."
                      : "Standard warranty claims are no longer eligible. Refer the customer to paid service options."}
                  </p>
                </div>
                <p className="mz-caption shrink-0 text-ink-subtle">Checked {formatDate(result.checkedAt)}</p>
              </div>
            </div>
          )}

          {/* How coverage is calculated */}
          <div className="rounded-lg border border-line bg-surface-sunken px-4 py-3">
            <p className="mz-label text-ink-muted">How coverage is calculated</p>
            <p className="mt-1 mz-body-sm text-ink-subtle">
              Warranty end date = purchase date + selected warranty period. Results are based on today&apos;s date and do not confirm claim eligibility.
            </p>
          </div>

          {/* Page footer */}
          <p className="mz-caption text-ink-subtle">
            Medizone staff tools · Branch 1 (main) · {formatDate(todayIso)}
          </p>
        </div>
      )}

      {/* History tab placeholder */}
      {innerTab === "history" && (
        <div className="rounded-lg border border-line bg-surface-raised px-4 py-10 text-center">
          <p className="mz-body-sm text-ink-disabled">No check history available in this preview.</p>
        </div>
      )}

      {/* Guide tab placeholder */}
      {innerTab === "guide" && (
        <div className="rounded-lg border border-line bg-surface-raised px-4 py-10 text-center">
          <p className="mz-body-sm text-ink-disabled">Warranty guide coming soon.</p>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ valid }: { valid: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-semibold ${
      valid ? "bg-success-bg text-success-ink" : "bg-danger-bg text-danger-ink"
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${valid ? "bg-success-solid" : "bg-danger-solid"}`} />
      {valid ? "In warranty" : "Expired"}
    </span>
  );
}
