"use client";

import { Badge, ButtonLink, cx } from "@/components/shared";
import { branchName } from "@/data/branches";
import { formatDate, formatLKR } from "@/lib/format";
import { FULFILMENT_LABELS, PAY_LABELS, customerStatusLabel, orderCode, orderTotals, timeOf } from "@/lib/orders";
import { PAYMENT_STATUS, discountLabel, orderStatusTone, paymentForOrder } from "@/lib/account/rules";
import { useAccount } from "@/lib/account/use-account";
import { DetailList, EmptyState, PANEL, PageTitle, Panel, TABLE_HEAD, TD, TH } from "./ui";

export function OrderDetailView({ orderId }: { orderId: string }) {
  const account = useAccount();
  if (!account) return null;
  const order = account.orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <div className={PANEL}>
        <EmptyState icon="package" title="Order not found" action={<ButtonLink href="/account/orders" icon="arrow-left" variant="secondary">Back to Orders</ButtonLink>}>
          We couldn&apos;t find order {orderCode(orderId)} in your account. Check the order number, or pick it from your order list.
        </EmptyState>
      </div>
    );
  }

  const totals = orderTotals(order);
  const payment = paymentForOrder(order);
  const payStatus = PAYMENT_STATUS[payment.status];
  const delivered = order.fulfilment !== "collect";

  return (
    <>
      <div>
        <ButtonLink href="/account/orders" variant="ghost" size="sm" icon="arrow-left" className="-ml-3">Back to Orders</ButtonLink>
      </div>
      <PageTitle
        title={`Order ${orderCode(order.id)}`}
        description={`Placed on ${formatDate(order.receivedAt)} at ${timeOf(order.receivedAt)}`}
        actions={<Badge tone={orderStatusTone(order)} dot className="h-8 px-3 mz-label">{customerStatusLabel(order)}</Badge>}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-5">
          <Panel title="Products" bodyClassName="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px]">
                <thead className={TABLE_HEAD}>
                  <tr>
                    <th scope="col" className={TH}>Product</th>
                    <th scope="col" className={cx(TH, "text-right")}>Qty</th>
                    <th scope="col" className={cx(TH, "text-right")}>Unit price</th>
                    <th scope="col" className={cx(TH, "text-right")}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((i) => (
                    <tr key={i.name} className="border-b border-line last:border-0">
                      <td className={TD}>{i.name}</td>
                      <td className={cx(TD, "text-right mz-num")}>{i.qty}</td>
                      <td className={cx(TD, "whitespace-nowrap text-right mz-num")}>{formatLKR(i.unitPrice)}</td>
                      <td className={cx(TD, "whitespace-nowrap text-right mz-num mz-label")}>{formatLKR(i.qty * i.unitPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <dl className="flex flex-col gap-2 border-t border-line px-4 py-4 sm:ml-auto sm:w-80">
              <div className="flex justify-between gap-4"><dt className="text-ink-muted">Subtotal</dt><dd className="mz-num">{formatLKR(totals.subtotal)}</dd></div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">{order.discountPercent ? discountLabel(order.discountPercent) : "Discount"}</dt>
                <dd className="mz-num text-success-ink">{totals.discount ? `− ${formatLKR(totals.discount)}` : formatLKR(0)}</dd>
              </div>
              <div className="flex justify-between gap-4"><dt className="text-ink-muted">Delivery fee</dt><dd className="mz-num">{totals.deliveryFee ? formatLKR(totals.deliveryFee) : "Free"}</dd></div>
              <div className="flex justify-between gap-4 border-t border-line pt-2"><dt className="mz-label">Grand total</dt><dd className="mz-price">{formatLKR(totals.total)}</dd></div>
            </dl>
          </Panel>
        </div>

        <div className="flex flex-col gap-5">
          <Panel title={delivered ? "Delivery" : "Collection"}>
            <DetailList
              className="-my-2.5"
              rows={[
                ["Method", FULFILMENT_LABELS[order.fulfilment]],
                [delivered ? "Delivery address" : "Collect from", delivered ? order.address ?? "Not given" : `${branchName(order.branchId)} branch`],
                ["Branch", branchName(order.branchId)],
              ]}
            />
          </Panel>
          <Panel title="Payment">
            <DetailList
              className="-my-2.5"
              rows={[
                ["Payment method", PAY_LABELS[order.payMethod]],
                ["Payment status", <Badge key="p" tone={payStatus.tone} dot>{payStatus.label}</Badge>],
                ["Payment reference", <span key="id" className="mz-code">{payment.id}</span>],
              ]}
            />
            <ButtonLink href="/account/payments" variant="ghost" size="sm" iconRight="arrow-right" className="-ml-3 mt-2">Payment history</ButtonLink>
          </Panel>
          <ButtonLink href={`/orders/${order.id}`} variant="secondary" icon="truck" block>Track this order</ButtonLink>
        </div>
      </div>
    </>
  );
}
