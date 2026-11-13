"use client";

import Link from "next/link";
import { ButtonLink, CARD, Icon, cx } from "@/components/shared";
import { branchName } from "@/data/branches";
import { useAuth } from "@/lib/auth";
import { formatDate, formatLKR } from "@/lib/format";
import { PAY_LABELS, customerStatusLabel, isFinished, orderCode, orderTotals, timeOf } from "@/lib/orders";
import { useOrders } from "@/lib/orders-store";
import type { OrderStatus } from "@/types/orders";

/** A customer's own order: thank-you note after placing it, then the status timeline and details. */
export function OrderTracking({ orderId, placed }: { orderId: string; placed: boolean }) {
  const { user } = useAuth();
  const { orders } = useOrders();
  const order = orders.find((o) => o.id === orderId && o.customerId === user?.customerId);

  if (!order) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-3 px-4 py-20 text-center">
        <Icon name="bag" size={28} className="text-ink-subtle" />
        <p className="mz-h3">We could not find this order</p>
        <ButtonLink href="/orders" variant="secondary">Go to my orders</ButtonLink>
      </div>
    );
  }

  const totals = orderTotals(order);
  const delivered = order.fulfilment !== "collect";
  const flow: OrderStatus[] = ["received", "preparing", "ready", delivered ? "out_for_delivery" : "collected"];
  const current = flow.indexOf(order.status);
  const paymentText = order.paymentState === "paid" ? "Paid" : order.payMethod === "card" ? "Awaiting card payment" : order.payMethod === "cod" ? "Pay the driver on delivery" : "Pay when you collect";

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6">
      <p className="mz-body-sm text-ink-muted"><Link href="/orders" className="text-link">My orders</Link> › {orderCode(order.id)}</p>

      {placed && (
        <section className={cx(CARD, "flex flex-col items-center gap-3 py-8 text-center")}>
          <span className="flex size-14 items-center justify-center rounded-pill bg-success-bg text-success-ink"><Icon name="check" size={28} /></span>
          <h1 className="mz-h2">Thank you, {order.customerName.split(" ")[0]}. Your order is placed.</h1>
          <p className="text-ink-muted">Order number <span className="mz-code text-primary-tint-ink">{orderCode(order.id)}</span> · we will message you when it is {delivered ? "on its way" : "ready to collect"}.</p>
          {order.payMethod === "card" && order.paymentState === "pending" && <p className="rounded-md bg-warning-bg px-3 py-2 mz-body-sm text-warning-ink">Complete your card payment in the secure PayHere step to confirm the order.</p>}
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/orders">Go to my orders</ButtonLink>
            <ButtonLink href="/shop" variant="secondary">Continue shopping</ButtonLink>
          </div>
        </section>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <h2 className={placed ? "mz-h2" : "mz-h1"}>Order {orderCode(order.id)}</h2>
        <span className={cx("rounded-pill px-3 py-1 mz-caption", isFinished(order.status) ? "bg-success-bg text-success-ink" : "bg-info-bg text-info-ink")}>{customerStatusLabel(order)}</span>
      </div>
      <p className="-mt-4 text-ink-muted">Placed on {formatDate(order.receivedAt)}, {timeOf(order.receivedAt)} · {order.items.length} items · {formatLKR(totals.total)}</p>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className={CARD}>
          <h3 className="mb-4 mz-h3">Order status</h3>
          <ol className="flex flex-col">
            {flow.map((s, i) => {
              const step = order.history.find((h) => h.status === s);
              const done = i <= current;
              return (
                <li key={s} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className={cx("flex size-7 items-center justify-center rounded-pill border-2", done ? "border-success-solid bg-success-solid text-on-solid" : "border-line-strong bg-surface-raised")}>{done && <Icon name="check" size={14} />}</span>
                    {i < flow.length - 1 && <span className={cx("w-0.5 flex-1", i < current ? "bg-success-solid" : "bg-line")} style={{ minHeight: 36 }} />}
                  </div>
                  <div className="pb-6">
                    <p className={cx("mz-label", !done && "text-ink-muted")}>{customerStatusLabel({ status: s, fulfilment: order.fulfilment })}</p>
                    <p className="mz-body-sm text-ink-muted">{step ? `${formatDate(step.at)}, ${timeOf(step.at)}` : i === current + 1 ? "Next step" : "Waiting"}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <div className="flex flex-col gap-4">
          <section className={cx(CARD, "flex flex-col gap-1")}>
            <h3 className="mb-1 flex items-center gap-2 mz-label"><Icon name={delivered ? "truck" : "store"} size={18} />{delivered ? "Delivery" : "Pick up"}</h3>
            <p>{delivered ? order.address : `${branchName(order.branchId)} branch`}</p>
            {order.note && <p className="mz-body-sm text-ink-muted">{order.note}</p>}
          </section>
          <section className={cx(CARD, "flex flex-col gap-1")}>
            <h3 className="mb-1 flex items-center gap-2 mz-label"><Icon name="wallet" size={18} />Payment</h3>
            <p>{PAY_LABELS[order.payMethod]}</p>
            <p className={order.paymentState === "paid" ? "text-success-ink" : "text-warning-ink"}>{paymentText}</p>
          </section>
          <section className={cx(CARD, "flex flex-col gap-2")}>
            <h3 className="mz-label">Items</h3>
            {order.items.map((i) => <p key={i.name} className="flex justify-between gap-3 mz-body-sm"><span>{i.name} × {i.qty}</span><span className="whitespace-nowrap mz-num">{formatLKR(i.qty * i.unitPrice)}</span></p>)}
            {order.discountPercent > 0 && <p className="flex justify-between mz-body-sm text-success-ink"><span>Regular discount ({order.discountPercent}%)</span><span>− {formatLKR(totals.discount)}</span></p>}
            {totals.deliveryFee > 0 && <p className="flex justify-between mz-body-sm"><span>Delivery</span><span>{formatLKR(totals.deliveryFee)}</span></p>}
            <p className="flex justify-between border-t border-line pt-2 mz-label"><span>Total</span><span className="mz-num">{formatLKR(totals.total)}</span></p>
          </section>
          <p className="flex items-center gap-2 rounded-md bg-surface-sunken p-3 mz-body-sm"><Icon name="phone" size={16} />Need help with this order? Call +94 70 185 5855</p>
        </div>
      </div>
    </div>
  );
}
