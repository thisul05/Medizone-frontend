"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge, Button, Logo, cx } from "@/components/shared";
import { site } from "@/data/site";
import { formatDate, formatLKR } from "@/lib/format";
import { orderCode, timeOf } from "@/lib/orders";
import { PAYMENT_STATUS } from "@/lib/account/rules";
import { useAccount } from "@/lib/account/use-account";
import type { AccountPayment } from "@/types/account";
import { EmptyState, Modal, PANEL, PageTitle, Pagination, StatCard, TABLE_HEAD, TD, TH, usePaged } from "./ui";

function Receipt({ payment, customer, onClose }: { payment: AccountPayment | null; customer: string; onClose: () => void }) {
  const status = payment ? PAYMENT_STATUS[payment.status] : null;
  const paid = payment?.status === "paid";
  return (
    <Modal
      open={!!payment}
      onClose={onClose}
      title={paid ? "Payment Receipt" : "Payment Summary"}
      icon="receipt"
      footer={<Button onClick={onClose}>Close</Button>}
    >
      {payment && status && (
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3 border-b border-line pb-3">
            <div>
              <Logo height={28} />
              <p className="mt-1 mz-label">Medizone Pharmacy</p>
              <p className="mz-body-sm text-ink-muted">{site.address}</p>
            </div>
            <Badge tone={status.tone} dot>{status.label}</Badge>
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
            <dt className="text-ink-muted">Payment reference</dt><dd className="text-right mz-code">{payment.id}</dd>
            <dt className="text-ink-muted">Related order</dt><dd className="text-right mz-code">{orderCode(payment.orderId)}</dd>
            <dt className="text-ink-muted">Customer</dt><dd className="text-right">{customer}</dd>
            <dt className="text-ink-muted">{paid ? "Payment date" : "Order date"}</dt><dd className="text-right">{formatDate(payment.date)}{payment.date.length > 10 ? `, ${timeOf(payment.date)}` : ""}</dd>
            <dt className="text-ink-muted">Payment method</dt><dd className="text-right">{payment.method}</dd>
            <dt className="text-ink-muted">Payment status</dt><dd className="text-right">{status.label}</dd>
          </dl>
          <dl className="flex flex-col gap-2 rounded-md bg-surface-sunken p-4">
            <div className="flex justify-between gap-4"><dt>Subtotal</dt><dd className="mz-num">{formatLKR(payment.subtotal)}</dd></div>
            <div className="flex justify-between gap-4">
              <dt>Discount{payment.discountPercent ? ` (${payment.discountPercent}%)` : ""}</dt>
              <dd className="mz-num">{payment.discount ? `− ${formatLKR(payment.discount)}` : formatLKR(0)}</dd>
            </div>
            <div className="flex justify-between gap-4"><dt>Delivery fee</dt><dd className="mz-num">{formatLKR(payment.deliveryFee)}</dd></div>
            <div className="flex justify-between gap-4 border-t border-line pt-2">
              <dt className="mz-label">{paid ? "Amount paid" : "Amount due"}</dt>
              <dd className="mz-price">{formatLKR(payment.total)}</dd>
            </div>
          </dl>
          <p className="mz-body-sm text-ink-muted">
            {paid ? "Thank you for shopping with Medizone Pharmacy." : "No payment has been received for this order yet. This summary is not a receipt."} Demo receipt generated from order data; no card details are stored.
          </p>
        </div>
      )}
    </Modal>
  );
}

export function PaymentsView() {
  const account = useAccount();
  const [selected, setSelected] = useState<AccountPayment | null>(null);
  const paged = usePaged(account?.payments ?? [], 8);
  if (!account) return null;
  const list = account.payments;
  const paid = list.filter((p) => p.status === "paid");
  const due = list.filter((p) => p.status !== "paid");
  const totalPaid = paid.reduce((s, p) => s + p.total, 0);
  const totalDue = due.reduce((s, p) => s + p.total, 0);
  const saved = paid.reduce((s, p) => s + p.discount, 0);

  return (
    <>
      <PageTitle title="Payment History" description="Payments for your Medizone orders." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon="wallet" tone="success" label="Total paid" value={formatLKR(totalPaid, { decimals: false })} hint={`${paid.length} payment${paid.length === 1 ? "" : "s"}`} />
        <StatCard icon="clock" tone="warning" label="Awaiting payment" value={formatLKR(totalDue, { decimals: false })} hint={`${due.length} order${due.length === 1 ? "" : "s"}`} />
        <StatCard icon="percent" tone="loyalty" label="Saved with discounts" value={formatLKR(saved, { decimals: false })} hint="On paid orders" />
      </div>

      <section aria-labelledby="pay-title" className={cx(PANEL, "overflow-hidden")}>
        <h2 id="pay-title" className="border-b border-line px-5 py-3.5 mz-h3 text-primary-tint-ink">Payments</h2>
        {list.length === 0 ? (
          <EmptyState icon="wallet" title="No payments yet">Payments for your orders will appear here.</EmptyState>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px]">
                <thead className={TABLE_HEAD}>
                  <tr>
                    <th scope="col" className={TH}>Payment ID</th>
                    <th scope="col" className={TH}>Order ID</th>
                    <th scope="col" className={TH}>Date</th>
                    <th scope="col" className={cx(TH, "text-right")}>Amount (LKR)</th>
                    <th scope="col" className={TH}>Method</th>
                    <th scope="col" className={TH}>Status</th>
                    <th scope="col" className={TH}><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {paged.slice.map((p) => {
                    const s = PAYMENT_STATUS[p.status];
                    return (
                      <tr key={p.id} className="border-b border-line last:border-0 hover:bg-surface-hover">
                        <td className={cx(TD, "whitespace-nowrap mz-code")}>{p.id}</td>
                        <td className={cx(TD, "whitespace-nowrap")}>
                          <Link href={`/account/orders/${p.orderId}`} className="mz-code text-link underline-offset-2 hover:underline">{orderCode(p.orderId)}</Link>
                        </td>
                        <td className={cx(TD, "whitespace-nowrap")}>{formatDate(p.date)}</td>
                        <td className={cx(TD, "whitespace-nowrap text-right mz-num mz-label")}>{formatLKR(p.total)}</td>
                        <td className={cx(TD, "whitespace-nowrap")}>{p.method}</td>
                        <td className={TD}><Badge tone={s.tone} dot>{s.label}</Badge></td>
                        <td className={cx(TD, "text-right")}>
                          <Button size="sm" variant="ghost" icon="receipt" onClick={() => setSelected(p)}>
                            {p.status === "paid" ? "View Receipt" : "View Summary"}<span className="sr-only"> for {p.id}</span>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination {...paged} onChange={paged.setPage} noun="payments" />
          </>
        )}
      </section>

      <Receipt payment={selected} customer={account.name} onClose={() => setSelected(null)} />
    </>
  );
}
