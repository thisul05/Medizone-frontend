"use client";

import { Button, Icon, Select, TextField } from "@/components/shared";
import { MEDICINES } from "@/data/orders";
import { WHEN_LABELS } from "@/lib/orders";
import type { OrderItem, WhenToTake } from "@/types/orders";

const TIMES = [1, 2, 3, 4].map((n) => ({ value: String(n), label: n === 1 ? "Once" : `${n} times` }));
const WHEN = (Object.keys(WHEN_LABELS) as WhenToTake[]).map((w) => ({ value: w, label: WHEN_LABELS[w] }));

export const emptyLine = (): OrderItem => ({ name: "", qty: 1, unitPrice: 0, needsLabel: true, dose: "1 tablet", timesPerDay: 1, days: 30, when: "after_meals" });

/** One row per medicine: name, quantity, dose, times a day, days, when, and whether it needs a label. */
export function MedicineLines({ lines, onChange, error }: { lines: OrderItem[]; onChange: (lines: OrderItem[]) => void; error?: string }) {
  const update = (i: number, patch: Partial<OrderItem>) => onChange(lines.map((l, j) => (j === i ? { ...l, ...patch } : l)));

  function pickMedicine(i: number, name: string) {
    const med = MEDICINES.find((m) => m.name === name);
    const dose = name.includes("capsule") ? "1 capsule" : name.includes("pen") ? "As directed" : "1 tablet";
    update(i, { name, unitPrice: med?.price ?? 0, dose });
  }

  return (
    <div className="flex flex-col gap-3">
      {lines.map((l, i) => (
        <div key={i} className="flex flex-wrap items-end gap-3 rounded-md border border-line p-3">
          <Select label="Medicine" size="sm" placeholder="Choose a medicine" value={l.name} onChange={(e) => pickMedicine(i, e.target.value)} options={MEDICINES.map((m) => ({ value: m.name, label: m.name }))} fieldClassName="w-64" />
          <TextField label="Qty" size="sm" type="number" min={1} value={l.qty} onChange={(e) => update(i, { qty: Number(e.target.value) })} fieldClassName="w-20" />
          <TextField label="Dose" size="sm" value={l.dose ?? ""} disabled={!l.needsLabel} onChange={(e) => update(i, { dose: e.target.value })} fieldClassName="w-28" />
          <Select label="Times a day" size="sm" value={String(l.timesPerDay ?? 1)} disabled={!l.needsLabel} onChange={(e) => update(i, { timesPerDay: Number(e.target.value) })} options={TIMES} fieldClassName="w-28" />
          <TextField label="Days" size="sm" type="number" min={1} value={l.days ?? 1} disabled={!l.needsLabel} onChange={(e) => update(i, { days: Number(e.target.value) })} fieldClassName="w-20" />
          <Select label="When" size="sm" value={l.when ?? "any_time"} disabled={!l.needsLabel} onChange={(e) => update(i, { when: e.target.value as WhenToTake })} options={WHEN} fieldClassName="w-36" />
          <label className="flex h-control-sm items-center gap-2 mz-label">
            <input type="checkbox" className="size-4 accent-primary" checked={l.needsLabel} onChange={(e) => update(i, { needsLabel: e.target.checked })} />
            Label
          </label>
          <button type="button" onClick={() => onChange(lines.filter((_, j) => j !== i))} disabled={lines.length === 1} aria-label={`Remove medicine ${i + 1}`} className="flex size-8 items-center justify-center rounded-md text-danger-ink hover:bg-danger-bg disabled:text-ink-disabled disabled:hover:bg-transparent">
            <Icon name="trash" size={16} />
          </button>
        </div>
      ))}
      {error && <p className="flex items-center gap-1.5 mz-body-sm text-danger-ink"><Icon name="alert-circle" size={16} />{error}</p>}
      <div>
        <Button variant="ghost" size="sm" icon="plus" onClick={() => onChange([...lines, emptyLine()])}>
          Add medicine
        </Button>
      </div>
    </div>
  );
}
