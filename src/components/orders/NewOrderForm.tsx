"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, Button, ButtonLink, CARD, Select, TextField, cx, useToast } from "@/components/shared";
import { branches } from "@/data/branches";
import { customers } from "@/data/customers";
import { useAuth } from "@/lib/auth";
import { formatDate, formatLKR } from "@/lib/format";
import { FULFILMENT_LABELS, TODAY, nextRepeat, orderTotals } from "@/lib/orders";
import { useOrders } from "@/lib/orders-store";
import type { Fulfilment, OrderItem, RepeatEvery } from "@/types/orders";
import type { BranchId } from "@/types/roles";
import { MedicineLines, emptyLine } from "./MedicineLines";

const PAY_FOR: Record<Fulfilment, "pay_at_counter" | "cod" | "bank_transfer"> = { collect: "pay_at_counter", own_driver: "cod", pickme_flash: "bank_transfer" };
const FEE: Record<Fulfilment, number> = { collect: 0, own_driver: 350, pickme_flash: 0 };
const segment = (on: boolean) => cx("h-control-sm rounded-md px-3 mz-label", on ? "bg-surface-raised text-primary-tint-ink shadow-1" : "text-ink-muted");

/** Record a prescription the customer sent on WhatsApp or handed in, so staff can prepare it in advance. */
export function NewOrderForm() {
  const { user, activeBranchId } = useAuth();
  const { addOrder } = useOrders();
  const router = useRouter();
  const toast = useToast();
  const home = activeBranchId && activeBranchId !== "all" ? activeBranchId : user?.branchId !== "all" ? (user?.branchId as BranchId) : "b1";

  const [via, setVia] = useState<"whatsapp" | "branch">("whatsapp");
  const [phone, setPhone] = useState("");
  const [newName, setNewName] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [doctor, setDoctor] = useState("");
  const [clinic, setClinic] = useState("");
  const [lines, setLines] = useState<OrderItem[]>([emptyLine()]);
  const [fulfilment, setFulfilment] = useState<Fulfilment>("collect");
  const [address, setAddress] = useState("");
  const [branchId, setBranchId] = useState<BranchId>(home ?? "b1");
  const [readyBy, setReadyBy] = useState("16:00");
  const [repeat, setRepeat] = useState<"none" | RepeatEvery>("none");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const digits = phone.replace(/\D/g, "");
  const customer = digits.length === 10 ? customers.find((c) => c.phone === digits) : undefined;
  const discount = customer?.discountPercent ?? 0;
  const items = lines.filter((l) => l.name);
  const totals = orderTotals({ items, discountPercent: discount, deliveryFee: FEE[fulfilment] });

  function save() {
    const e: Record<string, string> = {};
    if (digits.length !== 10) e.phone = "Enter a 10-digit mobile number";
    else if (!customer && !newName.trim()) e.name = "Enter the customer's name";
    if (via === "whatsapp" && !photo) e.photo = "Add the prescription photo from WhatsApp";
    if (!doctor.trim()) e.doctor = "Enter the doctor's name";
    if (items.length === 0 || items.some((i) => i.qty < 1)) e.lines = "Add at least one medicine with a quantity above zero";
    if (fulfilment !== "collect" && !address.trim() && !customer?.address) e.address = "Enter the delivery address";
    setErrors(e);
    if (Object.keys(e).length) return;

    const name = customer?.name ?? newName.trim();
    const customerId = customer?.id ?? `new-${digits}`;
    const id = addOrder(
      {
        source: via, customerId, customerName: name, phone: digits, branchId, items, fulfilment,
        address: fulfilment === "collect" ? undefined : address.trim() || customer?.address, readyBy: `${TODAY}T${readyBy}`,
        payMethod: PAY_FOR[fulfilment], paymentState: "pending", discountPercent: discount, deliveryFee: FEE[fulfilment],
      },
      {
        customerId, customerName: name, phone: digits, branchId, doctor: doctor.trim(), clinic: clinic.trim(), via, imageUrl: photo ?? "",
        repeat: repeat === "none" ? undefined : { every: repeat, lastDate: TODAY, nextDate: nextRepeat(TODAY, repeat) },
      },
    );
    toast({ tone: "success", title: `Order ${id.toUpperCase()} saved`, description: "It is in the order queue as Received." });
    router.push("/orders?tab=queue");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex min-w-0 flex-col gap-6">
        <section className={cx(CARD, "flex flex-col gap-4")}>
          <h2 className="mz-h3">1. Customer</h2>
          <div className="flex w-fit gap-1 rounded-md bg-surface-sunken p-1" role="group" aria-label="Order source">
            <button type="button" className={segment(via === "whatsapp")} onClick={() => setVia("whatsapp")} aria-pressed={via === "whatsapp"}>WhatsApp prescription</button>
            <button type="button" className={segment(via === "branch")} onClick={() => setVia("branch")} aria-pressed={via === "branch"}>Handed in at branch</button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="Mobile number" icon="phone" inputMode="numeric" placeholder="077 123 4567" value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phone} hint="The number the customer messaged from" />
            {digits.length === 10 && !customer && <TextField label="Customer name" value={newName} onChange={(e) => setNewName(e.target.value)} error={errors.name} hint="New customer: not in the customer list yet" />}
          </div>
          {customer && (
            <Alert tone="success" title={customer.name}>
              {customer.id} · {customer.address} · {customer.isRegular ? `Regular customer, ${customer.discountPercent}% off` : "Not a regular customer"}
            </Alert>
          )}
        </section>

        <section className={cx(CARD, "flex flex-col gap-4")}>
          <h2 className="mz-h3">2. Prescription</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="Doctor" value={doctor} onChange={(e) => setDoctor(e.target.value)} error={errors.doctor} placeholder="Dr. A. Gunawardena" />
            <TextField label="Hospital or clinic" optional value={clinic} onChange={(e) => setClinic(e.target.value)} />
          </div>
          <MedicineLines lines={lines} onChange={setLines} error={errors.lines} />
        </section>

        <section className={cx(CARD, "flex flex-col gap-4")}>
          <h2 className="mz-h3">3. Collection or delivery</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {(Object.keys(FULFILMENT_LABELS) as Fulfilment[]).map((f) => (
              <label key={f} className={cx("flex cursor-pointer gap-3 rounded-md border p-3", fulfilment === f ? "border-primary bg-primary-tint" : "border-line-strong")}>
                <input type="radio" name="fulfilment" className="mt-0.5 size-4 accent-primary" checked={fulfilment === f} onChange={() => setFulfilment(f)} />
                <span className="flex flex-col">
                  <span className="mz-label">{FULFILMENT_LABELS[f]}</span>
                  <span className="mz-body-sm text-ink-muted">{f === "collect" ? "Customer picks it up" : f === "own_driver" ? "Prior arrangement · COD possible" : "Arranged by the customer"}</span>
                </span>
              </label>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Select label="Branch" value={branchId} onChange={(e) => setBranchId(e.target.value as BranchId)} options={branches.map((b) => ({ value: b.id, label: b.name }))} />
            <TextField label="Ready by" type="time" value={readyBy} onChange={(e) => setReadyBy(e.target.value)} />
            {fulfilment !== "collect" && <TextField label="Delivery address" value={address} placeholder={customer?.address} onChange={(e) => setAddress(e.target.value)} error={errors.address} />}
          </div>
        </section>

        <section className={cx(CARD, "flex flex-wrap items-end gap-4")}>
          <Select label="4. Repeat this order" value={repeat} onChange={(e) => setRepeat(e.target.value as typeof repeat)} options={[{ value: "none", label: "Do not repeat" }, { value: "week", label: "Every week" }, { value: "month", label: "Every month" }]} hint="For regular customers who collect weekly or monthly" fieldClassName="w-72" />
          {repeat !== "none" && <p className="pb-6 mz-label text-primary-tint-ink">Next preparation: {formatDate(nextRepeat(TODAY, repeat))}</p>}
        </section>
      </div>

      <aside className="flex flex-col gap-6">
        <section className={cx(CARD, "flex flex-col gap-3")}>
          <h2 className="mz-h3">Prescription photo</h2>
          <div className={cx("flex h-56 items-center justify-center overflow-hidden rounded-md border border-dashed bg-surface-sunken", errors.photo ? "border-danger-solid" : "border-line-strong")}>
            {/* eslint-disable-next-line @next/next/no-img-element -- local preview from the chosen file */}
            {photo ? <img src={photo} alt="Prescription preview" className="h-full w-full object-contain" /> : <p className="px-4 text-center mz-body-sm text-ink-muted">Choose the photo the customer sent. It is shown here only, not uploaded.</p>}
          </div>
          <input type="file" accept="image/*" aria-label="Prescription photo" onChange={(e) => { const f = e.target.files?.[0]; if (f) setPhoto(URL.createObjectURL(f)); }} className="w-full mz-body-sm file:mr-3 file:rounded-md file:border file:border-line-strong file:bg-surface-raised file:px-3 file:py-1.5 file:mz-label" />
          {errors.photo && <p className="mz-body-sm text-danger-ink">{errors.photo}</p>}
        </section>

        <section className={cx(CARD, "flex flex-col gap-2")}>
          <h2 className="mz-h3">Order summary</h2>
          {[["Medicines", String(items.length)], ["Labels to print", String(items.filter((i) => i.needsLabel).length)], ["Subtotal", formatLKR(totals.subtotal)], [`Regular discount (${discount}%)`, `− ${formatLKR(totals.discount)}`], ["Delivery", formatLKR(totals.deliveryFee)]].map(([k, v]) => (
            <p key={k} className="flex justify-between"><span className="text-ink-muted">{k}</span><span className="mz-num">{v}</span></p>
          ))}
          <p className="flex justify-between border-t border-line pt-2 mz-label"><span>Estimated total</span><span className="mz-price mz-num">{formatLKR(totals.total)}</span></p>
          <p className="mz-body-sm text-ink-muted">Status after saving: Received. Payment is taken at the counter or on delivery.</p>
          <Button size="lg" block className="mt-2" onClick={save}>Save order</Button>
          <ButtonLink href="/orders?tab=queue" variant="secondary" block>Cancel</ButtonLink>
        </section>
      </aside>
    </div>
  );
}
