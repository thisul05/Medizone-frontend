"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Button, ButtonLink, CARD, Icon, cx, useToast, type IconName } from "@/components/shared";
import StatusBadge from "@/components/shared/StatusBadge";
import { branchName } from "@/data/branches";
import { useAuth } from "@/lib/auth";
import { formatDate, formatLKR, formatPhone } from "@/lib/format";
import { FULFILMENT_LABELS, PAY_LABELS, WHEN_LABELS, labelText, labelledItems, nextActionLabel, nextStatus, orderCode, orderTotals, timeOf } from "@/lib/orders";
import { useOrders } from "@/lib/orders-store";
import { SourceBadge } from "./OrderBadges";
import { OrderStepper } from "./OrderStepper";
import { ReadyMessageModal } from "./ReadyMessageModal";

function InfoCard({ title, icon, rows, children }: { title: string; icon: IconName; rows: [string, ReactNode][]; children?: ReactNode }) {
  return (
    <section className={cx(CARD, "flex flex-col gap-2")}>
      <h2 className="mb-1 flex items-center gap-2 mz-h3"><Icon name={icon} size={20} className="text-primary-tint-ink" />{title}</h2>
      {rows.map(([k, v]) => (
        <p key={k} className="flex justify-between gap-4"><span className="text-ink-muted">{k}</span><span className="text-right">{v}</span></p>
      ))}
      {children}
    </section>
  );
}

/** One order: status steps, items with label instructions, customer, delivery, payment and the ready message. */
export function OrderDetail({ orderId }: { orderId: string }) {
  const { user } = useAuth();
  const { orders, prescriptions, advance, markNotified } = useOrders();
  const toast = useToast();
  const [showMessage, setShowMessage] = useState(false);
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <div className="flex flex-col items-center gap-3 p-16 text-center">
        <Icon name="clipboard" size={28} className="text-ink-subtle" />
        <p className="mz-h3">Order {orderCode(orderId)} was not found</p>
        <ButtonLink href="/orders?tab=queue" variant="secondary">Back to the order queue</ButtonLink>
      </div>
    );
  }

  const rx = prescriptions.find((p) => p.id === order.prescriptionId);
  const totals = orderTotals(order);
  const action = nextActionLabel(order);
  const labels = labelledItems(order.items).length;

  function move() {
    if (!order) return;
    const to = nextStatus(order);
    advance(order.id, user?.name ?? "Staff");
    toast({ tone: "success", title: `${orderCode(order.id)} moved to ${to.replaceAll("_", " ")}` });
    if (to === "ready") setShowMessage(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mz-body-sm text-ink-muted"><Link href="/orders?tab=queue" className="text-link">Orders</Link> / {orderCode(order.id)}</p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="mz-h1">Order {orderCode(order.id)}</h1>
            <SourceBadge source={order.source} />
            <StatusBadge kind="order" status={order.status} />
          </div>
          <p className="text-ink-muted">Received {formatDate(order.receivedAt)}, {timeOf(order.receivedAt)} · {branchName(order.branchId)} branch</p>
        </div>
        <div className="flex gap-3">
          {labels > 0 && <ButtonLink href={`/orders?tab=labels&order=${order.id}`} variant="secondary" icon="tag">Print labels ({labels})</ButtonLink>}
          {action && <Button iconRight="arrow-right" onClick={move}>{action}</Button>}
        </div>
      </div>

      <section className={CARD}>
        <h2 className="mb-4 mz-h3">Order status</h2>
        <OrderStepper order={order} />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-6">
          <section className={cx(CARD, "overflow-x-auto")}>
            <h2 className="mb-3 mz-h3">Items <span className="mz-body-sm text-ink-muted">· {labels} need labels</span></h2>
            <table className="w-full min-w-[640px] text-left">
              <thead className="bg-surface-sunken text-xs font-semibold text-ink-muted">
                <tr>{["Item", "Qty", "Instructions", "Label", "Price"].map((h) => <th key={h} className={cx("px-3 py-2", (h === "Qty" || h === "Price") && "text-right")}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {order.items.map((i) => (
                  <tr key={i.name} className="border-b border-line">
                    <td className="px-3 py-3 mz-label">{i.name}</td>
                    <td className="px-3 py-3 text-right mz-num">{i.qty}</td>
                    <td className="px-3 py-3">{i.needsLabel ? `${labelText(i)} · ${WHEN_LABELS[i.when ?? "any_time"]}` : <span className="text-ink-muted">No instructions needed</span>}</td>
                    <td className="px-3 py-3">{i.needsLabel ? <Icon name="check" size={18} className="text-success-ink" /> : <span className="text-ink-subtle">—</span>}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-right mz-num">{formatLKR(i.qty * i.unitPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="ml-auto mt-3 flex max-w-xs flex-col gap-1">
              <p className="flex justify-between"><span className="text-ink-muted">Subtotal</span><span className="mz-num">{formatLKR(totals.subtotal)}</span></p>
              {order.discountPercent > 0 && <p className="flex justify-between"><span className="text-ink-muted">Regular discount ({order.discountPercent}%)</span><span className="mz-num">− {formatLKR(totals.discount)}</span></p>}
              {totals.deliveryFee > 0 && <p className="flex justify-between"><span className="text-ink-muted">Delivery</span><span className="mz-num">{formatLKR(totals.deliveryFee)}</span></p>}
              <p className="flex justify-between border-t border-line pt-1 mz-label"><span>Total</span><span className="mz-price mz-num">{formatLKR(totals.total)}</span></p>
            </div>
          </section>

          <div className="grid gap-6 md:grid-cols-2">
            <InfoCard title="Prescription" icon="file-text" rows={rx ? [["Prescription", <span key="id" className="mz-code">{rx.id}</span>], ["Doctor", rx.doctor], ["Clinic", rx.clinic || "—"], ["Received", `${formatDate(rx.receivedOn)} · ${rx.via === "branch" ? "at branch" : rx.via === "repeat" ? "repeat order" : "WhatsApp"}`]] : [["Prescription", "Not needed for shop items"]]} />
            <InfoCard title="Notes" icon="message" rows={[]}>
              <p className={cx("rounded-md p-3", order.note ? "bg-warning-bg text-warning-ink" : "text-ink-muted")}>{order.note ?? "No notes for this order."}</p>
            </InfoCard>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <InfoCard title="Customer" icon="user" rows={[["Name", order.customerName], ["Phone", formatPhone(order.phone)], ["Customer ID", order.customerId]]}>
            {order.customerId.startsWith("cus-") && <Link href={`/customers/${order.customerId}`} className="mz-label text-link">View customer profile →</Link>}
          </InfoCard>
          <InfoCard title="Collection or delivery" icon="truck" rows={[["Method", FULFILMENT_LABELS[order.fulfilment]], ...(order.address ? [["Address", order.address] as [string, string]] : []), ...(order.readyBy ? [["Ready by", timeOf(order.readyBy)] as [string, string]] : []), ["Branch", branchName(order.branchId)]]}>
            {order.fulfilment !== "collect" && <Link href="/delivery?tab=deliveries" className="mz-label text-link">Open in Delivery →</Link>}
          </InfoCard>
          <InfoCard title="Payment" icon="wallet" rows={[["Method", PAY_LABELS[order.payMethod]], ["Status", <span key="s" className={order.paymentState === "paid" ? "text-success-ink" : "text-warning-ink"}>{order.paymentState === "paid" ? "Paid" : "To pay"}</span>], ["Amount", formatLKR(totals.total)]]} />
          <InfoCard title="Ready message" icon="message" rows={[]}>
            {order.status === "received" || order.status === "preparing" ? (
              <p className="flex items-center gap-2 rounded-md bg-surface-sunken p-3 mz-body-sm text-ink-muted"><Icon name="lock" size={16} />Available after the order is marked Ready</p>
            ) : (
              <>
                <p className={cx("mz-body-sm", order.notified ? "text-success-ink" : "text-warning-ink")}>{order.notified ? "Customer has been notified" : "Customer not notified yet"}</p>
                <Button variant="secondary" icon="message" onClick={() => setShowMessage(true)}>Preview ready message</Button>
              </>
            )}
          </InfoCard>
        </div>
      </div>

      {showMessage && <ReadyMessageModal order={order} onClose={() => setShowMessage(false)} onNotified={() => { markNotified(order.id); setShowMessage(false); toast({ tone: "success", title: "Customer marked as notified" }); }} />}
    </div>
  );
}
