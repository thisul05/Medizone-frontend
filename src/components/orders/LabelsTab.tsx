"use client";

import { useState } from "react";
import { Alert, Button, CARD, Icon, Select, TextField, cx, useToast } from "@/components/shared";
import { branchName } from "@/data/branches";
import { POS_BILLS as posBills } from "@/lib/orders-store";
import { formatLKR } from "@/lib/format";
import { WHEN_LABELS, labelText, orderCode } from "@/lib/orders";
import type { Order, OrderItem } from "@/types/orders";
import { DispensingLabel } from "./DispensingLabel";

// While printing, show only the labels: black on white, nothing else on the page.
const PRINT_CSS = `@media print {
  html, body { background: #fff !important; min-height: 0 !important; }
  body *:not(:has(.mz-label-sheet)):not(.mz-label-sheet):not(.mz-label-sheet *) { display: none !important; }
  body * { visibility: hidden !important; min-height: 0 !important; }
  .mz-label-sheet, .mz-label-sheet * { visibility: visible !important; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  .mz-label-sheet { position: absolute; left: 0; top: 0; display: flex !important; flex-wrap: wrap; gap: 8px; }
  @page { margin: 10mm; }
}`;

const segment = (on: boolean) => cx("h-control-sm rounded-md px-3 mz-label", on ? "bg-surface-raised text-primary-tint-ink shadow-1" : "text-ink-muted");

interface Source {
  reference: string;
  patient: string;
  date: string;
  branch: string;
  items: OrderItem[];
}

/** Pick an order or a POS bill, tick the medicines that need instructions, preview and print the stickers. */
export function LabelsTab({ orders, initialOrderId }: { orders: Order[]; initialOrderId?: string }) {
  const toast = useToast();
  const withLabels = orders.filter((o) => o.items.some((i) => i.needsLabel));
  const [mode, setMode] = useState<"order" | "pos">("order");
  const [orderId, setOrderId] = useState(initialOrderId && withLabels.some((o) => o.id === initialOrderId) ? initialOrderId : (withLabels[0]?.id ?? ""));
  const [billQuery, setBillQuery] = useState("POS-30871");
  const [billId, setBillId] = useState("POS-30871");
  const [billError, setBillError] = useState("");
  const [skip, setSkip] = useState<Record<string, boolean>>({});
  const [warning, setWarning] = useState("");
  const [patientName, setPatientName] = useState("");
  const [copies, setCopies] = useState(1);
  const [page, setPage] = useState(0);

  const order = withLabels.find((o) => o.id === orderId);
  const bill = posBills.find((b) => b.id === billId);
  const source: Source | undefined =
    mode === "order"
      ? order && { reference: orderCode(order.id), patient: order.customerName, date: order.receivedAt, branch: branchName(order.branchId), items: order.items }
      : bill && { reference: bill.id, patient: patientName.trim() || (bill.customerName === "Walk-in customer" ? "—" : bill.customerName), date: bill.date, branch: "Miriswaththa", items: bill.items };

  const key = (i: OrderItem) => `${source?.reference}-${i.name}`;
  const chosen = (source?.items ?? []).filter((i) => i.needsLabel && !skip[key(i)]);
  const current = chosen[Math.min(page, chosen.length - 1)];

  function findBill() {
    const id = billQuery.trim().toUpperCase();
    if (posBills.some((b) => b.id === id)) {
      setBillId(id);
      setBillError("");
      setPatientName("");
      setPage(0);
    } else setBillError("No POS bill with this number. Check the number on the receipt.");
  }

  function print() {
    window.print();
    toast({ tone: "success", title: `${chosen.length * copies} label${chosen.length * copies === 1 ? "" : "s"} sent to the printer` });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
      <style>{PRINT_CSS}</style>
      <div className="flex min-w-0 flex-col gap-6">
        <section className={cx(CARD, "flex flex-col gap-4")}>
          <h2 className="mz-h3">1. Choose the order</h2>
          <div className="flex w-fit gap-1 rounded-md bg-surface-sunken p-1" role="group" aria-label="Where the order comes from">
            <button type="button" className={segment(mode === "order")} onClick={() => { setMode("order"); setPage(0); }} aria-pressed={mode === "order"}>Order from queue</button>
            <button type="button" className={segment(mode === "pos")} onClick={() => { setMode("pos"); setPage(0); }} aria-pressed={mode === "pos"}>POS bill</button>
          </div>
          {mode === "order" ? (
            <Select label="Order" value={orderId} onChange={(e) => { setOrderId(e.target.value); setPage(0); }} options={withLabels.map((o) => ({ value: o.id, label: `${orderCode(o.id)} · ${o.customerName}` }))} hint="Online, WhatsApp, at-branch and repeat orders" fieldClassName="max-w-md" />
          ) : (
            <div className="flex flex-wrap items-start gap-3">
              <TextField label="POS bill number" icon="search" value={billQuery} onChange={(e) => setBillQuery(e.target.value)} error={billError} hint={`Recent: ${posBills.map((b) => b.id).join(", ")}`} fieldClassName="w-80" />
              <Button className="mt-6" onClick={findBill}>Find</Button>
              <TextField label="Patient name on the label" value={patientName} placeholder={bill?.customerName === "Walk-in customer" ? "Ask the customer's name" : bill?.customerName} onChange={(e) => setPatientName(e.target.value)} fieldClassName="w-72" />
            </div>
          )}
          {mode === "pos" && bill && <Alert tone="info">Bill {bill.id} · {bill.customerName} · {bill.items.length} items. Bills are read from the existing POS system.</Alert>}
        </section>

        <section className={cx(CARD, "flex flex-col gap-3")}>
          <h2 className="mz-h3">2. Tick the items that need a label</h2>
          <p className="mz-body-sm text-ink-muted">Only medicines with usage instructions need a sticker.</p>
          {(source?.items ?? []).map((i) => (
            <label key={key(i)} className={cx("flex items-start gap-3 rounded-md border border-line p-3", !i.needsLabel && "bg-surface-sunken")}>
              <input type="checkbox" className="mt-1 size-4 accent-primary" disabled={!i.needsLabel} checked={i.needsLabel && !skip[key(i)]} onChange={(e) => { setSkip({ ...skip, [key(i)]: !e.target.checked }); setPage(0); }} />
              <span className="flex flex-1 flex-col">
                <span className="mz-label">{i.name} <span className="font-normal text-ink-muted">· Qty {i.qty} · {formatLKR(i.qty * i.unitPrice)}</span></span>
                <span className="mz-body-sm text-ink-muted">{i.needsLabel ? `${labelText(i)} · ${WHEN_LABELS[i.when ?? "any_time"]}` : "No instructions needed"}</span>
              </span>
            </label>
          ))}
          <TextField label="Extra warning on every label" optional value={warning} placeholder="Complete the full course, even if you feel better" onChange={(e) => setWarning(e.target.value)} fieldClassName="max-w-xl" />
        </section>
      </div>

      <section className={cx(CARD, "flex h-fit flex-col gap-4")}>
        <div className="flex items-center justify-between">
          <h2 className="mz-h3">Label preview</h2>
          {chosen.length > 0 && (
            <div className="flex items-center gap-2 mz-body-sm text-ink-muted">
              Label {Math.min(page, chosen.length - 1) + 1} of {chosen.length}
              <button type="button" aria-label="Previous label" disabled={page === 0} onClick={() => setPage(page - 1)} className="rounded-md border border-line-strong p-1 disabled:opacity-40"><Icon name="chevron-left" size={16} /></button>
              <button type="button" aria-label="Next label" disabled={page >= chosen.length - 1} onClick={() => setPage(page + 1)} className="rounded-md border border-line-strong p-1 disabled:opacity-40"><Icon name="chevron-right" size={16} /></button>
            </div>
          )}
        </div>
        <div className="flex justify-center rounded-md bg-surface-sunken p-5">
          {current && source ? <DispensingLabel item={current} patient={source.patient} date={source.date} reference={source.reference} branch={source.branch} warning={warning} /> : <p className="py-10 text-ink-muted">Tick at least one medicine to see its label.</p>}
        </div>
        <Select label="Copies of each label" value={String(copies)} onChange={(e) => setCopies(Number(e.target.value))} options={[1, 2, 3].map((n) => ({ value: String(n), label: String(n) }))} fieldClassName="w-40" />
        <Button size="lg" block icon="tag" disabled={chosen.length === 0} onClick={print}>
          Print {chosen.length * copies} label{chosen.length * copies === 1 ? "" : "s"}
        </Button>
      </section>

      {/* Hidden on screen; the only thing on paper. */}
      <div className="mz-label-sheet hidden" aria-hidden>
        {source && chosen.flatMap((i) => Array.from({ length: copies }, (_, n) => <DispensingLabel key={`${key(i)}-${n}`} item={i} patient={source.patient} date={source.date} reference={source.reference} branch={source.branch} warning={warning} print />))}
      </div>
    </div>
  );
}
