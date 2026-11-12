"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, Button, ButtonLink, CARD, Icon, Select, TextField, cx, useToast } from "@/components/shared";
import { branches, branchName } from "@/data/branches";
import { useAuth } from "@/lib/auth";
import { getCustomerProfile } from "@/lib/auth-store";
import { useCart } from "@/lib/cart";
import { formatLKR } from "@/lib/format";
import { DELIVERY_FEE, customerDiscount, orderTotals } from "@/lib/orders";
import { useOrders } from "@/lib/orders-store";
import type { OrderItem } from "@/types/orders";
import type { BranchId } from "@/types/roles";

type Method = "delivery" | "pickup";
type Pay = "card" | "cod" | "pay_at_counter";

const SLOTS = ["Tomorrow, 9 am – 1 pm", "Tomorrow, 2 pm – 6 pm", "Day after tomorrow, 9 am – 1 pm"];

function Choice({ checked, onChange, title, detail, price }: { checked: boolean; onChange: () => void; title: string; detail: string; price?: string }) {
  return (
    <label className={cx("flex cursor-pointer items-start gap-3 rounded-md border p-4", checked ? "border-primary bg-primary-tint" : "border-line-strong hover:bg-surface-hover")}>
      <input type="radio" checked={checked} onChange={onChange} className="mt-0.5 size-4 accent-primary" />
      <span className="flex flex-1 flex-col">
        <span className="mz-label">{title}</span>
        <span className="mz-body-sm text-ink-muted">{detail}</span>
      </span>
      {price && <span className="mz-label">{price}</span>}
    </label>
  );
}

/** Customer checkout for shop items: 1 Delivery, 2 Review and place the order. Card payment itself is Module 8's. */
export function CheckoutView() {
  const { user } = useAuth();
  const cart = useCart();
  const { addOrder } = useOrders();
  const router = useRouter();
  const toast = useToast();
  const profile = user?.customerId ? getCustomerProfile(user.customerId) : undefined;

  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [method, setMethod] = useState<Method>("delivery");
  const [address, setAddress] = useState(profile ? [profile.addressLine, profile.city].filter(Boolean).join(", ") : "");
  const [branchId, setBranchId] = useState<BranchId>(user?.branchId && user.branchId !== "all" ? user.branchId : "b1");
  const [slot, setSlot] = useState(SLOTS[0]);
  const [note, setNote] = useState("");
  const [pay, setPay] = useState<Pay>("card");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState(false);

  const items: OrderItem[] = cart.items.flatMap((i) => {
    const p = cart.getProduct(i.productId);
    return p ? [{ name: p.name, qty: i.qty, unitPrice: p.price, productId: p.id, needsLabel: false }] : [];
  });
  const discountPercent = customerDiscount(user?.jobTitle);
  const totals = orderTotals({ items, discountPercent, deliveryFee: method === "delivery" ? DELIVERY_FEE : 0 });
  const payMethod: Pay = method === "pickup" && pay === "cod" ? "pay_at_counter" : method === "delivery" && pay === "pay_at_counter" ? "cod" : pay;

  if (user && user.role !== "customer") return <Alert tone="info" title="Checkout is for customers">Sign in with a customer account to place an online order.</Alert>;
  if (cart.ready && items.length === 0) {
    return (
      <div className={cx(CARD, "flex flex-col items-center gap-3 py-16 text-center")}>
        <Icon name="cart" size={28} className="text-ink-subtle" />
        <p className="mz-h3">Your cart is empty</p>
        <p className="text-ink-muted">Add vitamins, devices and everyday essentials to get started.</p>
        <ButtonLink href="/shop">Browse products</ButtonLink>
      </div>
    );
  }

  function next() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Enter your name";
    if (phone.replace(/\D/g, "").length !== 10) e.phone = "Enter a 10-digit mobile number";
    if (method === "delivery" && address.trim().length < 8) e.address = "Enter your full delivery address";
    setErrors(e);
    if (!Object.keys(e).length) setStep(2);
  }

  async function place() {
    const issue = cart.validateStock(method === "pickup" ? branchId : "all");
    if (issue) return toast({ tone: "warning", title: issue });
    setPlacing(true);
    await new Promise((r) => setTimeout(r, 400));
    const id = addOrder({
      source: "online", customerId: user?.customerId ?? user?.id ?? "guest", customerName: name.trim(), phone: phone.replace(/\D/g, ""),
      branchId, items, fulfilment: method === "delivery" ? "own_driver" : "collect", address: method === "delivery" ? address.trim() : undefined,
      payMethod, paymentState: "pending", discountPercent, deliveryFee: totals.deliveryFee, note: [method === "delivery" ? slot : "", note.trim()].filter(Boolean).join(" · ") || undefined,
    });
    cart.clear();
    router.push(`/orders/${id}?placed=1`);
  }

  const steps = ["Delivery", "Review and place order"];
  return (
    <div className="flex flex-col gap-6">
      <ol className="flex flex-wrap items-center gap-3" aria-label="Checkout steps">
        {steps.map((s, i) => (
          <li key={s} className="flex items-center gap-2" aria-current={step === i + 1 ? "step" : undefined}>
            <span className={cx("flex size-7 items-center justify-center rounded-pill mz-caption", step > i + 1 ? "bg-success-solid text-on-solid" : step === i + 1 ? "bg-primary text-primary-on" : "border border-line-strong text-ink-muted")}>
              {step > i + 1 ? <Icon name="check" size={14} /> : i + 1}
            </span>
            <span className={cx("mz-label", step < i + 1 && "text-ink-muted")}>{s}</span>
            {i < steps.length - 1 && <span className="mx-2 h-0.5 w-16 bg-line" />}
          </li>
        ))}
      </ol>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        {step === 1 ? (
          <div className="flex min-w-0 flex-col gap-6">
            <section className={cx(CARD, "grid gap-4 md:grid-cols-2")}>
              <h2 className="mz-h3 md:col-span-2">Contact details</h2>
              <TextField label="Full name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
              <TextField label="Mobile number" icon="phone" value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phone} />
            </section>
            <section className={cx(CARD, "flex flex-col gap-3")}>
              <h2 className="mz-h3">How would you like to get your order?</h2>
              <Choice checked={method === "delivery"} onChange={() => setMethod("delivery")} title="Home delivery" detail="By our pharmacy driver · Piliyandala, Kesbewa and Maharagama areas" price={formatLKR(DELIVERY_FEE)} />
              <Choice checked={method === "pickup"} onChange={() => setMethod("pickup")} title="Pick up at a branch" detail="We send you a message when it is ready" price="Free" />
              {method === "delivery" ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <TextField label="Delivery address" value={address} onChange={(e) => setAddress(e.target.value)} error={errors.address} placeholder="45/2, Temple Road, Piliyandala" fieldClassName="md:col-span-2" />
                  <Select label="Preferred delivery time" value={slot} onChange={(e) => setSlot(e.target.value)} options={SLOTS.map((s) => ({ value: s, label: s }))} />
                  <TextField label="Note for the driver" optional value={note} onChange={(e) => setNote(e.target.value)} />
                </div>
              ) : (
                <Select label="Branch to collect from" value={branchId} onChange={(e) => setBranchId(e.target.value as BranchId)} options={branches.map((b) => ({ value: b.id, label: b.confirmed ? `${b.name}, ${b.area}` : `${b.name} (details coming soon)` }))} fieldClassName="max-w-md" />
              )}
            </section>
          </div>
        ) : (
          <div className="flex min-w-0 flex-col gap-6">
            <section className={cx(CARD, "flex flex-col gap-2")}>
              <div className="flex justify-between"><h2 className="mz-h3">Delivery details</h2><button type="button" className="mz-label text-link" onClick={() => setStep(1)}>Edit</button></div>
              <p>{name} · {phone}</p>
              <p className="text-ink-muted">{method === "delivery" ? `Home delivery by our driver to ${address} · ${slot}` : `Pick up at ${branchName(branchId)} branch`}</p>
              {note && <p className="text-ink-muted">Note: {note}</p>}
            </section>
            <section className={cx(CARD, "flex flex-col gap-3")}>
              <div className="flex justify-between"><h2 className="mz-h3">Items ({items.length})</h2><button type="button" className="mz-label text-link" onClick={() => cart.setOpen(true)}>Edit cart</button></div>
              {items.map((i) => (
                <p key={i.name} className="flex justify-between gap-4 border-b border-line pb-2 last:border-0"><span>{i.name} <span className="text-ink-muted">× {i.qty}</span></span><span className="mz-num">{formatLKR(i.qty * i.unitPrice)}</span></p>
              ))}
            </section>
            <section className={cx(CARD, "flex flex-col gap-3")}>
              <h2 className="mz-h3">How would you like to pay?</h2>
              <Choice checked={payMethod === "card"} onChange={() => setPay("card")} title="Visa or Mastercard" detail="You complete the card payment in the secure PayHere step after placing the order" />
              {method === "delivery" ? (
                <Choice checked={payMethod === "cod"} onChange={() => setPay("cod")} title="Cash on delivery" detail="Pay our driver in cash when your order arrives" />
              ) : (
                <Choice checked={payMethod === "pay_at_counter"} onChange={() => setPay("pay_at_counter")} title="Pay at the branch" detail="Pay by cash or card when you collect" />
              )}
            </section>
          </div>
        )}

        <aside className={cx(CARD, "flex h-fit flex-col gap-2")}>
          <h2 className="mb-1 mz-h3">Order summary</h2>
          <p className="flex justify-between"><span className="text-ink-muted">Subtotal ({items.length} items)</span><span className="mz-num">{formatLKR(totals.subtotal)}</span></p>
          {discountPercent > 0 && <p className="flex justify-between"><span className="text-ink-muted">Regular customer discount ({discountPercent}%)</span><span className="mz-num text-success-ink">− {formatLKR(totals.discount)}</span></p>}
          <p className="flex justify-between"><span className="text-ink-muted">{method === "delivery" ? "Home delivery" : "Pick up"}</span><span className="mz-num">{method === "delivery" ? formatLKR(DELIVERY_FEE) : "Free"}</span></p>
          <p className="flex justify-between border-t border-line pt-2 mz-label"><span>Total</span><span className="mz-price mz-num">{formatLKR(totals.total)}</span></p>
          {step === 1 ? (
            <Button size="lg" block iconRight="arrow-right" className="mt-2" onClick={next}>Continue to review</Button>
          ) : (
            <Button size="lg" block className="mt-2" loading={placing} onClick={place}>Place order</Button>
          )}
          {step === 2 && <Button variant="ghost" block onClick={() => setStep(1)}>Back to delivery</Button>}
          <p className="mt-1 flex items-center gap-1.5 mz-body-sm text-ink-muted"><Icon name="lock" size={14} />Prescription medicines are not sold online. Send your prescription on WhatsApp instead.</p>
        </aside>
      </div>
    </div>
  );
}
