"use client";

import Link from "next/link";
import { ButtonLink, CARD, Icon, cx, type IconName } from "@/components/shared";
import { branchName } from "@/data/branches";
import { useAuth } from "@/lib/auth";
import { formatDate, formatLKR, formatPhone } from "@/lib/format";
import { PAY_LABELS, customerStatusLabel, isFinished, orderCode, orderTotals, timeOf } from "@/lib/orders";
import { useOrders } from "@/lib/orders-store";
import type { Order, OrderStatus } from "@/types/orders";
import { AccountFrame } from "./AccountFrame";
import { itemIcon } from "./item-icon";

function paymentText(order: Order) {
  if (order.paymentState === "paid") return "Paid";
  if (order.payMethod === "card") return "Awaiting card payment";
  if (order.payMethod === "cod") return "Pay the driver on delivery";
  return "Pay when you collect";
}

function Tile({ icon, label, title, detail }: { icon: IconName; label: string; title: string; detail?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-md border border-line p-4 text-left">
      <span className="flex items-center gap-2 mz-caption text-ink-muted"><Icon name={icon} size={16} className="text-primary-tint-ink" />{label}</span>
      <span className="mz-label">{title}</span>
      {detail && <span className="mz-body-sm text-ink-muted">{detail}</span>}
    </div>
  );
}

/** Shown once, right after the customer places an order. */
function OrderConfirmed({ order }: { order: Order }) {
  const delivered = order.fulfilment !== "collect";
  const totals = orderTotals(order);
  const next = delivered
    ? [
        { title: "Order placed", detail: "Now" },
        { title: "Packing", detail: "Pharmacy prepares it" },
        { title: "Out for delivery", detail: order.deliverySlot ?? "Our driver brings it" },
        { title: "Delivered", detail: order.address ? `To ${order.address.split(",").slice(0, 2).join(",")}` : "To your address" },
      ]
    : [
        { title: "Order placed", detail: "Now" },
        { title: "Packing", detail: "Pharmacy prepares it" },
        { title: "Ready to collect", detail: "We send you a message" },
        { title: "Collected", detail: `At ${branchName(order.branchId)} branch` },
      ];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <section className={cx(CARD, "flex flex-col items-center gap-3 px-6 py-10 text-center sm:px-10")}>
        <span className="flex size-16 items-center justify-center rounded-pill bg-success-bg text-success-ink"><Icon name="check" size={32} /></span>
        <h1 className="mt-2 mz-h2">Thank you, {order.customerName.split(" ")[0]}! Your order is placed.</h1>
        <p className="text-ink-muted">Order number <span className="mz-label text-primary-tint-ink">{orderCode(order.id)}</span></p>
        {order.email && <p className="flex items-center gap-1.5 mz-body-sm text-ink-muted"><Icon name="mail" size={14} />A confirmation has been sent to {order.email}</p>}

        <div className="mt-4 w-full rounded-lg bg-surface-sunken p-5 text-left">
          <p className="mb-4 mz-label">What happens next</p>
          <ol className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {next.map((s, i) => (
              <li key={s.title} className="flex flex-col gap-1">
                <div className="flex items-center">
                  <span className={cx("flex size-6 shrink-0 items-center justify-center rounded-pill mz-caption", i === 0 ? "bg-success-solid text-on-solid" : "border border-line-strong bg-surface-raised text-ink-muted")}>
                    {i === 0 ? <Icon name="check" size={12} /> : i + 1}
                  </span>
                  {i < next.length - 1 && <span className="ml-2 hidden h-0.5 flex-1 bg-line sm:block" />}
                </div>
                <span className="mz-label">{s.title}</span>
                <span className="mz-caption text-ink-muted">{s.detail}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="grid w-full gap-3 sm:grid-cols-3">
          <Tile icon={delivered ? "truck" : "store"} label={delivered ? "Delivery" : "Pick up"} title={delivered ? "Home delivery by our driver" : `${branchName(order.branchId)} branch`} detail={delivered ? order.address : "Ready within 2 hours"} />
          <Tile icon="card" label="Payment" title={`${PAY_LABELS[order.payMethod]} · ${paymentText(order).toLowerCase()}`} detail={formatLKR(totals.total)} />
          <Tile icon="bag" label="Items" title={`${order.items.length} ${order.items.length === 1 ? "item" : "items"}`} detail={order.items.map((i) => i.name).join(", ")} />
        </div>

        {order.payMethod === "card" && order.paymentState === "pending" && (
          <p className="w-full rounded-md bg-warning-bg px-3 py-2 mz-body-sm text-warning-ink">Complete your card payment in the secure PayHere step to confirm the order.</p>
        )}

        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <ButtonLink href={`/orders/${order.id}`} iconRight="arrow-right">Track order</ButtonLink>
          <ButtonLink href="/shop" variant="secondary">Continue shopping</ButtonLink>
        </div>
        <p className="mz-caption text-ink-muted">You can see all your orders any time in My Account › My Orders.</p>
      </section>
    </div>
  );
}

/** One line under each step of the timeline. */
function stepText(status: OrderStatus, delivered: boolean): string {
  if (status === "received") return "We received your order.";
  if (status === "preparing") return "The pharmacy is checking and packing your items.";
  if (status === "ready") return delivered ? "Packed and waiting for our driver." : "Ready for you at the branch.";
  if (status === "out_for_delivery") return "Your order is with our driver.";
  return "You collected your order.";
}

/** The banner above the timeline: what the customer can expect next. */
function expectation(order: Order): { icon: IconName; title: string; detail: string } | null {
  const delivered = order.fulfilment !== "collect";
  if (isFinished(order.status)) return null;
  if (delivered && order.status === "ready") return { icon: "truck", title: "Packed and waiting for the driver", detail: order.deliverySlot ?? "We will message you when it is on its way" };
  if (!delivered && order.status === "ready") return { icon: "store", title: `Ready to collect at ${branchName(order.branchId)} branch`, detail: "Bring your order number when you come" };
  if (delivered) return { icon: "truck", title: order.deliverySlot ? `Expected ${order.deliverySlot.charAt(0).toLowerCase()}${order.deliverySlot.slice(1)}` : "On the way soon", detail: "Our driver will call you before arriving" };
  return { icon: "store", title: "Ready within 2 hours", detail: "We send you a message when it is ready" };
}

/** A customer's own order: the confirmation right after placing it, then the status timeline and details. */
export function OrderTracking({ orderId, placed }: { orderId: string; placed: boolean }) {
  const { user } = useAuth();
  const { orders } = useOrders();
  const order = orders.find((o) => o.id === orderId && o.customerId === user?.customerId);

  if (!order) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-3 px-4 py-20 text-center">
        <Icon name="bag" size={28} className="text-ink-subtle" />
        <p className="mz-h3">We could not find this order</p>
        <ButtonLink href="/account/orders" variant="secondary">Go to My Orders</ButtonLink>
      </div>
    );
  }
  if (placed) return <OrderConfirmed order={order} />;

  const totals = orderTotals(order);
  const delivered = order.fulfilment !== "collect";
  const flow: OrderStatus[] = ["received", "preparing", "ready", delivered ? "out_for_delivery" : "collected"];
  const current = flow.indexOf(order.status);
  const banner = expectation(order);

  return (
    <AccountFrame crumb={orderCode(order.id)}>
      <div className="flex flex-col gap-2">
        <Link href="/account/orders" className="w-fit mz-body-sm text-link hover:underline">← Back to My Orders</Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="mz-h1">Order {orderCode(order.id)}</h1>
          <span className={cx("rounded-pill px-3 py-1 mz-caption", isFinished(order.status) ? "bg-success-bg text-success-ink" : "bg-info-bg text-info-ink")}>{customerStatusLabel(order)}</span>
        </div>
        <p className="text-ink-muted">Placed on {formatDate(order.receivedAt)}, {timeOf(order.receivedAt)} · {order.items.length} items · {formatLKR(totals.total)}</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section className={cx(CARD, "flex flex-col gap-5")}>
          {banner && (
            <div className="flex items-center gap-3 rounded-md bg-primary-tint p-4 text-primary-tint-ink">
              <Icon name={banner.icon} size={22} />
              <div className="flex flex-col"><span className="mz-label">{banner.title}</span><span className="mz-body-sm">{banner.detail}</span></div>
            </div>
          )}
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
                    <p className="flex flex-wrap items-baseline gap-x-2">
                      <span className={cx("mz-label", !done && "text-ink-muted")}>{customerStatusLabel({ status: s, fulfilment: order.fulfilment })}</span>
                      <span className="mz-caption text-ink-muted">{step ? `${formatDate(step.at)}, ${timeOf(step.at)}` : i === current + 1 ? "Next step" : "Waiting"}</span>
                    </p>
                    <p className="mz-body-sm text-ink-muted">{stepText(s, delivered)}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <div className="flex flex-col gap-4">
          <section className={cx(CARD, "flex flex-col gap-1")}>
            <h2 className="mb-1 flex items-center gap-2 mz-label"><Icon name={delivered ? "map-pin" : "store"} size={18} />{delivered ? "Delivery address" : "Pick up"}</h2>
            <p className="mz-label">{order.customerName}</p>
            <p>{delivered ? order.address : `${branchName(order.branchId)} branch`}</p>
            <p className="mz-body-sm text-ink-muted">{formatPhone(order.phone)}</p>
          </section>
          <section className={cx(CARD, "flex flex-col gap-1")}>
            <h2 className="mb-1 flex items-center gap-2 mz-label"><Icon name="card" size={18} />Payment</h2>
            <p>{PAY_LABELS[order.payMethod]}</p>
            <p className={order.paymentState === "paid" ? "text-success-ink" : "text-warning-ink"}>{paymentText(order)} · {formatLKR(totals.total)}</p>
          </section>
          <section className={cx(CARD, "flex flex-col gap-3")}>
            <h2 className="flex items-center gap-2 mz-label"><Icon name="bag" size={18} />Items</h2>
            {order.items.map((i) => (
              <div key={i.name} className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-surface-sunken"><Icon name={itemIcon(i.productId)} size={16} className="text-ink-subtle" /></span>
                <span className="flex min-w-0 flex-1 flex-col"><span className="mz-body-sm">{i.name}</span><span className="mz-caption text-ink-muted">Qty {i.qty} · {formatLKR(i.qty * i.unitPrice)}</span></span>
              </div>
            ))}
            {order.discountPercent > 0 && <p className="flex justify-between mz-body-sm text-success-ink"><span>Regular discount ({order.discountPercent}%)</span><span>− {formatLKR(totals.discount)}</span></p>}
            {totals.deliveryFee > 0 && <p className="flex justify-between mz-body-sm"><span>Delivery</span><span>{formatLKR(totals.deliveryFee)}</span></p>}
            <p className="flex justify-between border-t border-line pt-2 mz-label"><span>Total</span><span className="mz-num">{formatLKR(totals.total)}</span></p>
          </section>
          <p className="flex items-center gap-2 rounded-md bg-surface-sunken p-3 mz-body-sm"><Icon name="phone" size={16} />Need help with this order? Call +94 70 185 5855</p>
        </div>
      </div>
    </AccountFrame>
  );
}
