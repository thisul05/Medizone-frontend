"use client";

// A small browser store so orders stay the same across pages: a customer's checkout appears in
// the staff queue, and status changes show in My Orders. Saved in localStorage; nothing is sent anywhere.
import { useSyncExternalStore } from "react";
import { orders as seedOrders, posBills as seedPosBills, prescriptions as seedPrescriptions } from "@/data/orders";
import { readItem, writeItem } from "@/lib/auth-store";
import { SEED_SHIFT, nextRepeat, nextStatus, shiftDates, TODAY } from "@/lib/orders";
import type { Order, Prescription } from "@/types/orders";

interface OrdersState {
  orders: Order[];
  prescriptions: Prescription[];
}

// v2: sample dates now follow the real calendar, so older saved copies are replaced once.
const KEY = "mz.orders.v2";
const SEED: OrdersState = shiftDates({ orders: seedOrders, prescriptions: seedPrescriptions }, SEED_SHIFT);

/** Counter (POS) bills for Labels and Overview, dated around today like the orders. */
export const POS_BILLS = shiftDates(seedPosBills, SEED_SHIFT);

let cache: OrdersState | undefined;
const listeners = new Set<() => void>();

function read(): OrdersState {
  if (cache === undefined) {
    try {
      const raw = readItem(KEY);
      cache = raw ? (JSON.parse(raw) as OrdersState) : SEED;
    } catch {
      cache = SEED;
    }
  }
  return cache;
}

function write(next: OrdersState) {
  cache = next;
  writeItem(KEY, JSON.stringify(next));
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const now = () => `${TODAY}T${new Date().toTimeString().slice(0, 5)}`;

/** The next free order id, "ord-19". */
function newOrderId(orders: Order[]): string {
  const max = Math.max(0, ...orders.map((o) => Number(o.id.replace("ord-", "")) || 0));
  return `ord-${String(max + 1).padStart(2, "0")}`;
}

function newPrescriptionId(list: Prescription[]): string {
  const max = Math.max(1100, ...list.map((p) => Number(p.id.replace("RX-", "")) || 0));
  return `RX-${max + 1}`;
}

/** Move an order one step forward. */
function advance(orderId: string, by: string) {
  const s = read();
  write({
    ...s,
    orders: s.orders.map((o) => {
      if (o.id !== orderId) return o;
      const status = nextStatus(o);
      if (status === o.status) return o;
      return { ...o, status, history: [...o.history, { status, at: now(), by }] };
    }),
  });
}

function markNotified(orderId: string) {
  const s = read();
  write({ ...s, orders: s.orders.map((o) => (o.id === orderId ? { ...o, notified: true } : o)) });
}

/** Save a new order. Returns its id. A prescription order also stores the prescription. */
function addOrder(order: Omit<Order, "id" | "history" | "status" | "receivedAt" | "notified">, prescription?: Omit<Prescription, "id" | "orderId" | "receivedOn">): string {
  const s = read();
  const id = newOrderId(s.orders);
  const at = now();
  let prescriptions = s.prescriptions;
  let prescriptionId: string | undefined;
  if (prescription) {
    prescriptionId = newPrescriptionId(s.prescriptions);
    prescriptions = [{ ...prescription, id: prescriptionId, orderId: id, receivedOn: TODAY }, ...s.prescriptions];
  }
  const full: Order = { ...order, id, prescriptionId, receivedAt: at, status: "received", notified: false, history: [{ status: "received", at, by: "System" }] };
  write({ orders: [full, ...s.orders], prescriptions });
  return id;
}

/** Prepare a repeat order now: copy the last order, then move the next date on. */
function prepareRepeat(prescriptionId: string) {
  const s = read();
  const p = s.prescriptions.find((x) => x.id === prescriptionId);
  const last = p && s.orders.find((o) => o.id === p.orderId);
  if (!p?.repeat || !last) return;
  const id = newOrderId(s.orders);
  const at = now();
  const order: Order = { ...last, id, source: "repeat", status: "received", notified: false, receivedAt: at, history: [{ status: "received", at, by: "System" }], paymentState: "pending" };
  const repeat = { ...p.repeat, lastDate: TODAY, nextDate: nextRepeat(TODAY, p.repeat.every) };
  write({
    orders: [order, ...s.orders],
    prescriptions: s.prescriptions.map((x) => (x.id === prescriptionId ? { ...x, orderId: id, repeat } : x)),
  });
}

function setRepeatPaused(prescriptionId: string, paused: boolean) {
  const s = read();
  write({
    ...s,
    prescriptions: s.prescriptions.map((p) => (p.id === prescriptionId && p.repeat ? { ...p, repeat: { ...p.repeat, paused } } : p)),
  });
}

/** Put the sample data back. */
function reset() {
  write(SEED);
}

export function useOrders() {
  const state = useSyncExternalStore(subscribe, read, () => SEED);
  return { ...state, advance, markNotified, addOrder, prepareRepeat, setRepeatPaused, reset };
}
