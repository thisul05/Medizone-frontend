"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { MOCK_PREVIEW_DATA, type Report } from "@/data/reports";
import type { ReportPreview } from "@/lib/inventory-reports";

export function ReportDialog({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);
  return (
    <dialog ref={ref} aria-label="Report preview" onCancel={onClose}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      className="fixed inset-0 m-auto max-h-none max-w-none border-0 bg-transparent p-4 text-slate-800 backdrop:bg-slate-900/60 backdrop:backdrop-blur-sm">
      {children}
      <style>{`@media print {
        body > * { visibility: hidden; }
        dialog, dialog * { visibility: visible; }
        dialog { position: absolute !important; inset: 0 !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
        dialog > div { max-height: none !important; max-width: none !important; overflow: visible !important; box-shadow: none !important; }
        dialog .overflow-y-auto { overflow: visible !important; }
        dialog button { display: none !important; }
        dialog::backdrop { background: white; }
      }`}</style>
    </dialog>
  );
}

export function exportReport(report: Report, branch: string, timeframe: string, livePreview?: ReportPreview) {
  const preview = livePreview ?? MOCK_PREVIEW_DATA[report.id];
  const rows: string[][] = [
    ["Report", report.title], ["Branch", branch], ["Timeframe", timeframe],
    ["Source", livePreview ? "Saved browser inventory; current stock snapshot, date range applies to adjustments only" : "Mock data — fixed demonstration values"],
    ["Metric", report.stats], ["Status", report.status], [],
    ...(preview ? [preview.headers, ...preview.rows] : [["Description", report.description], ["Comparison", report.trend]]),
  ];
  const csv = rows.map(row => row.map(cell => {
    const safe = /^[=+@\-\t\r]/.test(cell) ? "'" + cell : cell;
    return '"' + safe.replaceAll('"', '""') + '"';
  }).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `medizone-${report.id}.csv`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
