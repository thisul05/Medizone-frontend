"use client";

import { useEffect } from "react";
import { Alert, Button, Icon, useToast } from "@/components/shared";
import { formatPhone } from "@/lib/format";
import { orderCode, readyMessage } from "@/lib/orders";
import type { Order } from "@/types/orders";

/** Shows the "your order is ready" message to copy into WhatsApp. Nothing is sent. */
export function ReadyMessageModal({ order, onClose, onNotified }: { order: Order; onClose: () => void; onNotified: () => void }) {
  const toast = useToast();
  const message = readyMessage(order);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      toast({ tone: "success", title: "Message copied", description: "Paste it into the customer's WhatsApp chat." });
    } catch {
      toast({ tone: "warning", title: "Could not copy", description: "Select the message and copy it by hand." });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-(--scrim)" onClick={onClose} aria-hidden />
      <div role="dialog" aria-modal="true" aria-labelledby="ready-title" className="relative flex w-full max-w-lg flex-col gap-4 rounded-lg bg-surface-raised p-6 shadow-3">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-pill bg-success-bg text-success-ink">
            <Icon name="check" />
          </span>
          <div className="flex-1">
            <h2 id="ready-title" className="mz-h3">
              Order {orderCode(order.id)} is ready
            </h2>
            <p className="mz-body-sm text-ink-muted">Send this message to the customer on WhatsApp</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-ink-muted hover:bg-surface-hover">
            <Icon name="x" />
          </button>
        </div>

        <p className="mz-body-sm">
          <span className="text-ink-muted">To: </span>
          <span className="font-semibold">
            {order.customerName} · {formatPhone(order.phone)}
          </span>
        </p>

        <div className="rounded-md bg-surface-sunken p-4">
          <p className="whitespace-pre-line rounded-md bg-success-bg p-3 text-ink">{message}</p>
        </div>

        <Alert tone="neutral">This prototype does not send the message. Copy it and send it on WhatsApp.</Alert>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" icon="file-text" onClick={copy}>
            Copy message
          </Button>
          <Button icon="check" onClick={onNotified} disabled={order.notified}>
            {order.notified ? "Customer notified" : "Mark customer as notified"}
          </Button>
        </div>
      </div>
    </div>
  );
}
