import type { Delivery, DeliveryStatus, WarrantyStatus } from "@/types/delivery";

export function warrantyValid(purchase: string, months: number, today = new Date()): boolean {
  const end = new Date(purchase);
  end.setMonth(end.getMonth() + months);
  return today <= end;
}

export function warrantyEndDate(purchase: string, months: number): string {
  const end = new Date(purchase);
  end.setMonth(end.getMonth() + months);
  return end.toISOString().slice(0, 10);
}

export const codToHandOver = (ds: Delivery[]): number =>
  ds.filter((d) => d.codCollected).reduce((s, d) => s + d.codAmount, 0);

const deliveryFlow: DeliveryStatus[] = ["pending", "out", "delivered"];
export const nextDeliveryStatus = (s: DeliveryStatus): DeliveryStatus =>
  deliveryFlow[deliveryFlow.indexOf(s) + 1] ?? s;

const warrantyFlow: WarrantyStatus[] = [
  "received",
  "sent_to_supplier",
  "repaired",
  "replaced",
  "returned",
];
export const nextWarrantyStatus = (s: WarrantyStatus): WarrantyStatus =>
  warrantyFlow[warrantyFlow.indexOf(s) + 1] ?? s;
