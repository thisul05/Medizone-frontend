"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Alert, Button, ButtonLink, CARD, Icon, Select, TextField, cx, useToast, type IconName } from "@/components/shared";
import { branches, branchName } from "@/data/branches";
import { getCategory } from "@/data/storefront";
import { useAuth } from "@/lib/auth";
import { getCustomerProfile } from "@/lib/auth-store";
import { useCart } from "@/lib/cart";
import { formatLKR, formatPhone } from "@/lib/format";
import { DELIVERY_FEE, customerDiscount, orderTotals } from "@/lib/orders";
import { useOrders } from "@/lib/orders-store";
import type { OrderItem } from "@/types/orders";
import type { BranchId } from "@/types/roles";

type Method = "delivery" | "pickup";
type Pay = "card" | "cod" | "pay_at_counter";

const SLOTS = ["Tomorrow, 9 am – 1 pm", "Tomorrow, 2 pm – 6 pm", "Day after tomorrow, 9 am – 1 pm"];

function Choice({ checked, onChange, title, detail, price, icon }: { checked: boolean; onChange: () => void; title: string; detail: string; price?: string; icon?: IconName }) {
  return (
    <label className={cx("flex cursor-pointer items-start gap-3 rounded-md border p-4", checked ? "border-primary bg-primary-tint" : "border-line-strong hover:bg-surface-hover")}>
      <input type="radio" checked={checked} onChange={onChange} className="mt-0.5 size-4 accent-primary" />
      <span className="flex flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-2 mz-label">{icon && <Icon name={icon} size={18} />}{title}</span>
        <span className="mz-body-sm text-ink-muted">{detail}</span>
        {price && <span className={cx("mt-1 mz-label", price === "Free" && "text-success-ink")}>{price}</span>}
      </span>
    </label>
  );
}

/** One of the three small boxes in "Delivery details" on the review step. */
function DetailTile({ icon, label, children }: { icon: IconName; label: string; children: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-md border border-line bg-surface-sunken p-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary-tint text-primary-tint-ink"><Icon name={icon} size={16} /></span>
      <div className="flex min-w-0 flex-col">
        <span className="mz-caption text-ink-muted">{label}</span>
        {children}
      </div>
    </div>
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
  const [email, setEmail] = useState(user?.email ?? "");
  const [method, setMethod] = useState<Method>("delivery");
  const [address, setAddress] = useState(profile ? [profile.addressLine, profile.city].filter(Boolean).join(", ") : "");
  const [branchId, setBranchId] = useState<BranchId>(user?.branchId && user.branchId !== "all" ? user.branchId : "b1");
  const [slot, setSlot] = useState(SLOTS[0]);
  const [note, setNote] = useState("");
  const [pay, setPay] = useState<Pay>("card");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState(false);

  const lines = cart.items.flatMap((i) => {
    const p = cart.getProduct(i.productId);
    return p ? [{ product: p, qty: i.qty }] : [];
  });
  const items: OrderItem[] = lines.map(({ product: p, qty }) => ({ name: p.name, qty, unitPrice: p.price, productId: p.id, needsLabel: false }));
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
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = "Enter a valid email, or leave it empty";
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
      source: "online", customerId: user?.customerId ?? user?.id ?? "guest", customerName: name.trim(), phone: phone.replace(/\D/g, ""), email: email.trim() || undefined,
      branchId, items, fulfilment: method === "delivery" ? "own_driver" : "collect", address: method === "delivery" ? address.trim() : undefined,
      deliverySlot: method === "delivery" ? slot : undefined,
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
            {i < steps.length - 1 && <span className={cx("mx-2 h-0.5 w-16", step > 1 ? "bg-success-solid" : "bg-line")} />}
          </li>
        ))}
      </ol>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        {step === 1 ? (
          <div className="flex min-w-0 flex-col gap-6">
            <section className={cx(CARD, "grid gap-4 md:grid-cols-3")}>
              <h2 className="mz-h3 md:col-span-3">Contact details</h2>
              <TextField label="Full name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
              <TextField label="Mobile number" icon="phone" value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phone} />
              <TextField label="Email" optional type="email" icon="mail" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
            </section>
            <section className={cx(CARD, "flex flex-col gap-3")}>
              <h2 className="mz-h3">How would you like to get your order?</h2>
              <div className="grid gap-3 md:grid-cols-2">
                <Choice icon="truck" checked={method === "delivery"} onChange={() => setMethod("delivery")} title="Home delivery" detail="By our pharmacy driver · 1–2 days · Piliyandala, Kesbewa and Maharagama areas" price={formatLKR(DELIVERY_FEE)} />
                <Choice icon="store" checked={method === "pickup"} onChange={() => setMethod("pickup")} title="Pick up at a branch" detail="Ready within 2 hours · we send you a message when it is ready" price="Free" />
              </div>
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
            <section className={cx(CARD, "flex flex-col gap-4")}>
              <div className="flex justify-between"><h2 className="mz-h3">Delivery details</h2><button type="button" className="mz-label text-link" onClick={() => setStep(1)}>Edit</button></div>
              <div className="grid gap-3 md:grid-cols-3">
                <DetailTile icon="user" label="Contact">
                  <span className="mz-label">{name}</span>
                  <span className="mz-body-sm text-ink-muted">{formatPhone(phone)}{email.trim() && ` · ${email.trim()}`}</span>
                </DetailTile>
                {method === "delivery" ? (
                  <>
                    <DetailTile icon="map-pin" label="Address"><span className="mz-label">{address}</span></DetailTile>
                    <DetailTile icon="truck" label="Delivery">
                      <span className="mz-label">Home delivery by pharmacy driver</span>
                      <span className="mz-body-sm text-ink-muted">{slot}</span>
                    </DetailTile>
                  </>
                ) : (
                  <DetailTile icon="store" label="Pick up">
                    <span className="mz-label">{branchName(branchId)} branch</span>
                    <span className="mz-body-sm text-ink-muted">Ready within 2 hours</span>
                  </DetailTile>
                )}
              </div>
              {note.trim() && <p className="mz-body-sm"><span className="text-ink-muted">Note for the driver:</span> {note.trim()}</p>}
            </section>

            <section className={cx(CARD, "flex flex-col gap-3")}>
              <div className="flex justify-between"><h2 className="mz-h3">Items ({items.length})</h2><button type="button" className="mz-label text-link" onClick={() => cart.setOpen(true)}>Edit cart</button></div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-sunken mz-overline text-ink-muted">
                      <th className="rounded-l-md px-3 py-2 font-semibold">Product</th>
                      <th className="px-3 py-2 font-semibold">Qty</th>
                      <th className="px-3 py-2 font-semibold">Price</th>
                      <th className="rounded-r-md px-3 py-2 text-right font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {lines.map(({ product: p, qty }) => (
                      <tr key={p.id}>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-3">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-surface-sunken"><Icon name={getCategory(p.categoryId)?.icon ?? "package"} size={18} className="text-ink-subtle" /></span>
                            <span className="flex flex-col"><span className="mz-label">{p.name}</span>{p.brand && <span className="mz-caption text-ink-muted">{p.brand}</span>}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 mz-num">{qty}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-ink-muted mz-num">{formatLKR(p.price)}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-right mz-label mz-num">{formatLKR(p.price * qty)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className={cx(CARD, "flex flex-col gap-3")}>
              <h2 className="mz-h3">How would you like to pay?</h2>
              <Choice icon="card" checked={payMethod === "card"} onChange={() => setPay("card")} title="Visa or Mastercard" detail="You complete the card payment in the secure PayHere step after placing the order" />
              {method === "delivery" ? (
                <Choice icon="banknote" checked={payMethod === "cod"} onChange={() => setPay("cod")} title="Cash on delivery" detail="Pay our driver in cash when your order arrives" />
              ) : (
                <Choice icon="store" checked={payMethod === "pay_at_counter"} onChange={() => setPay("pay_at_counter")} title="Pay at the branch" detail="Pay by cash or card when you collect" />
              )}
            </section>

            <p className="flex items-center gap-2 rounded-md bg-info-bg px-4 py-3 mz-body-sm text-info-ink">
              <Icon name="info" size={16} />After you place the order, the pharmacy prepares it and you can follow its status in My orders.
            </p>
          </div>
        )}

        <aside className={cx(CARD, "flex h-fit flex-col gap-2")}>
          <h2 className="mb-1 mz-h3">{step === 1 ? "Order summary" : "Price details"}</h2>
          {step === 1 && (
            <ul className="mb-2 flex flex-col gap-3 border-b border-line pb-4">
              {lines.map(({ product: p, qty }) => (
                <li key={p.id} className="flex items-center gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-surface-sunken">
                    <Icon name={getCategory(p.categoryId)?.icon ?? "package"} size={20} className="text-ink-subtle" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="line-clamp-2 mz-label">{p.name}</span>
                    <span className="mz-caption text-ink-muted">Qty {qty}</span>
                  </span>
                  <span className="mz-label mz-num">{formatLKR(p.price * qty)}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="flex justify-between"><span className="text-ink-muted">Subtotal ({items.length} items)</span><span className="mz-num">{formatLKR(totals.subtotal)}</span></p>
          {discountPercent > 0 && <p className="flex justify-between"><span className="text-ink-muted">Regular customer discount ({discountPercent}%)</span><span className="mz-num text-success-ink">− {formatLKR(totals.discount)}</span></p>}
          <p className="flex justify-between"><span className="text-ink-muted">{method === "delivery" ? "Home delivery" : "Pick up"}</span><span className="mz-num">{method === "delivery" ? formatLKR(DELIVERY_FEE) : "Free"}</span></p>
          <p className="flex justify-between border-t border-line pt-2 mz-label"><span>{step === 1 ? "Total" : "Total to pay"}</span><span className="mz-price mz-num">{formatLKR(totals.total)}</span></p>
          {step === 1 ? (
            <Button size="lg" block iconRight="arrow-right" className="mt-2" onClick={next}>Continue to review</Button>
          ) : (
            <>
              <Button size="lg" block className="mt-2" loading={placing} onClick={place}>Place order</Button>
              <button type="button" className="mt-1 self-center mz-body-sm text-link hover:underline" onClick={() => setStep(1)}>← Back to delivery</button>
            </>
          )}
          {step === 1 && <p className="mt-1 flex items-center gap-1.5 mz-body-sm text-ink-muted"><Icon name="lock" size={14} />Prescription medicines are not sold online. Send your prescription on WhatsApp instead.</p>}
        </aside>
      </div>
    </div>
  );
}
