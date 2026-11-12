import { Icon, cx } from "@/components/shared";
import { formatDate } from "@/lib/format";
import { TODAY, timeOf } from "@/lib/orders";
import type { Order, OrderStatus } from "@/types/orders";

const LABELS: Record<OrderStatus, string> = {
  received: "Received",
  preparing: "Preparing",
  ready: "Ready",
  collected: "Collected",
  out_for_delivery: "Out for delivery",
};

const when = (at: string) => (at.startsWith(TODAY) ? timeOf(at) : `${formatDate(at)}, ${timeOf(at)}`);

/** Received -> Preparing -> Ready -> Collected (or Out for delivery), with who moved it and when. */
export function OrderStepper({ order }: { order: Order }) {
  const last: OrderStatus = order.fulfilment === "collect" ? "collected" : "out_for_delivery";
  const flow: OrderStatus[] = ["received", "preparing", "ready", last];
  const current = flow.indexOf(order.status);
  const finished = current === flow.length - 1;

  return (
    <ol className="grid grid-cols-4" aria-label="Order status">
      {flow.map((s, i) => {
        const step = order.history.find((h) => h.status === s);
        const done = i < current || (finished && i === current);
        const isCurrent = i === current && !finished;
        return (
          <li key={s} className="flex flex-col gap-2" aria-current={isCurrent ? "step" : undefined}>
            <div className="flex items-center">
              <span
                className={cx(
                  "flex size-7 shrink-0 items-center justify-center rounded-pill border-2 mz-caption",
                  done && "border-success-solid bg-success-solid text-on-solid",
                  isCurrent && "border-warning-solid bg-surface-raised",
                  !done && !isCurrent && "border-line-strong bg-surface-raised text-ink-subtle",
                )}
              >
                {done ? <Icon name="check" size={14} /> : isCurrent ? <span className="size-2.5 rounded-pill bg-warning-solid" /> : i + 1}
              </span>
              {i < flow.length - 1 && <span className={cx("h-0.5 flex-1", i < current ? "bg-success-solid" : "bg-line")} />}
            </div>
            <p className={cx("mz-label", !done && !isCurrent && "text-ink-muted")}>{LABELS[s]}</p>
            <p className="mz-body-sm text-ink-muted">
              {step ? `${when(step.at)} · ${step.by}` : s === "ready" ? "Customer gets the ready message" : order.fulfilment === "collect" ? "At the counter" : "With the driver or rider"}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
