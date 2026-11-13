"use client";

// Shared state for the Customers module. Lives in src/app/customers/layout.tsx so every page
// (customer list, profile, loyalty, feedback, reminders) reads the same records.
// Changes are saved in this browser (src/lib/customers-store.ts) and survive a refresh.

import Link from "next/link";
import { createContext, useCallback, useContext, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { prescriptions as seedPrescriptions, purchases as seedPurchases } from "@/data/customers";
import {
  getCustomerSnapshot,
  getServerCustomerSnapshot,
  resetCustomerState,
  subscribeCustomers,
  updateCustomerState,
} from "@/lib/customers-store";
import { PROTOTYPE_TODAY, buildRefillReminders, calculateLoyaltyPoints, formatLKR, getTodayISO, normalizePhone } from "@/lib/customers";
import type {
  Customer,
  CustomerFeedback,
  CustomerInput,
  FeedbackInput,
  LoyaltyTransaction,
  Purchase,
  RefillReminder,
  StoredPrescription,
} from "@/types/customers";
import { Icon, type IconName } from "./ui/Icon";

type ToastTone = "success" | "info" | "warning" | "danger";

interface ToastMessage {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
  action?: { label: string; href: string };
}

interface CustomersContextValue {
  /** Today's date (local), used for reminder statuses and "this month" figures. */
  today: string;
  customers: Customer[];
  purchases: Purchase[];
  prescriptions: StoredPrescription[];
  loyaltyTransactions: LoyaltyTransaction[];
  feedback: CustomerFeedback[];
  reminders: RefillReminder[];
  /** Set when saved browser data could not be read or written. */
  storageNotice: string | null;
  getCustomer: (id: string) => Customer | undefined;
  isPhoneTaken: (phone: string, exceptCustomerId?: string) => boolean;
  addCustomer: (input: CustomerInput) => Customer;
  updateCustomer: (id: string, input: CustomerInput) => void;
  addFeedback: (input: FeedbackInput) => CustomerFeedback;
  recordPurchasePoints: (customerId: string, amountPaid: number) => LoyaltyTransaction | null;
  markReminderSent: (reminderId: string) => void;
  resetDemoData: () => void;
  notify: (toast: Omit<ToastMessage, "id">) => void;
}

const CustomersContext = createContext<CustomersContextValue | null>(null);

export function useCustomers(): CustomersContextValue {
  const ctx = useContext(CustomersContext);
  if (!ctx) throw new Error("useCustomers must be used inside <CustomersProvider>");
  return ctx;
}

function nextNumber(ids: string[], pattern: RegExp): number {
  return ids.reduce((max, id) => Math.max(max, Number(pattern.exec(id)?.[1] ?? 0)), 0) + 1;
}

function cleanInput(input: CustomerInput): CustomerInput {
  return {
    name: input.name.trim().replace(/\s+/g, " "),
    phone: normalizePhone(input.phone),
    email: input.email?.trim() || undefined,
    address: input.address?.trim() || undefined,
    branchId: input.branchId,
    isRegular: input.isRegular,
    discountPercent: input.isRegular ? input.discountPercent : 0,
  };
}

// Today's date only changes at midnight; re-read it when the tab becomes visible again.
function subscribeToday(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

export function CustomersProvider({ children }: { children: ReactNode }) {
  const { state, notice } = useSyncExternalStore(subscribeCustomers, getCustomerSnapshot, getServerCustomerSnapshot);
  const today = useSyncExternalStore(subscribeToday, () => getTodayISO(), () => PROTOTYPE_TODAY);
  const { customers, loyaltyTransactions, feedback, sentReminders } = state;
  const purchases = seedPurchases;
  const prescriptions = seedPrescriptions;
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastCounter = useRef(0);

  const reminders = useMemo(() => buildRefillReminders(purchases, sentReminders, today), [purchases, sentReminders, today]);

  const dismissToast = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (toast: Omit<ToastMessage, "id">) => {
      toastCounter.current += 1;
      const id = toastCounter.current;
      setToasts((list) => [...list.slice(-2), { ...toast, id }]);
      if (toast.tone !== "danger") window.setTimeout(() => dismissToast(id), 5000);
    },
    [dismissToast],
  );

  const getCustomer = useCallback((id: string) => customers.find((c) => c.id === id), [customers]);

  const isPhoneTaken = useCallback(
    (phone: string, exceptCustomerId?: string) => {
      const digits = normalizePhone(phone);
      return customers.some((c) => c.phone === digits && c.id !== exceptCustomerId);
    },
    [customers],
  );

  const addCustomer = useCallback(
    (input: CustomerInput) => {
      const current = getCustomerSnapshot().state;
      const id = `cus-${String(nextNumber(current.customers.map((c) => c.id), /^cus-(\d+)$/)).padStart(2, "0")}`;
      // New customers start with 0 points and no invented history.
      const customer: Customer = { ...cleanInput(input), id, loyaltyPoints: 0, joinedOn: getTodayISO(), registeredVia: "staff" };
      updateCustomerState((s) => ({ ...s, customers: [customer, ...s.customers] }));
      return customer;
    },
    [],
  );

  const updateCustomer = useCallback((id: string, input: CustomerInput) => {
    updateCustomerState((s) => ({ ...s, customers: s.customers.map((c) => (c.id === id ? { ...c, ...cleanInput(input) } : c)) }));
  }, []);

  const addFeedback = useCallback((input: FeedbackInput) => {
    const current = getCustomerSnapshot().state;
    const n = nextNumber(current.feedback.map((f) => f.id), /^FB-(\d+)$/);
    const entry: CustomerFeedback = {
      ...input,
      comment: input.comment.trim(),
      id: `FB-${String(n).padStart(3, "0")}`,
      date: getTodayISO(),
    };
    updateCustomerState((s) => ({ ...s, feedback: [entry, ...s.feedback] }));
    return entry;
  }, []);

  const recordPurchasePoints = useCallback((customerId: string, amountPaid: number) => {
    const points = calculateLoyaltyPoints(amountPaid);
    if (points <= 0) return null;
    const current = getCustomerSnapshot().state;
    const n = nextNumber(current.loyaltyTransactions.map((t) => t.id), /^LT-(\d+)$/);
    const txn: LoyaltyTransaction = {
      id: `LT-${String(n).padStart(4, "0")}`,
      customerId,
      date: getTodayISO(),
      type: "earned",
      points,
      description: `Earned on counter purchase of ${formatLKR(amountPaid)}`,
    };
    updateCustomerState((s) => ({
      ...s,
      loyaltyTransactions: [txn, ...s.loyaltyTransactions],
      customers: s.customers.map((c) => (c.id === customerId ? { ...c, loyaltyPoints: c.loyaltyPoints + points } : c)),
    }));
    return txn;
  }, []);

  const markReminderSent = useCallback((reminderId: string) => {
    updateCustomerState((s) => (s.sentReminders[reminderId] ? s : { ...s, sentReminders: { ...s.sentReminders, [reminderId]: getTodayISO() } }));
  }, []);

  const resetDemoData = useCallback(() => resetCustomerState(), []);

  const value = useMemo<CustomersContextValue>(
    () => ({
      today,
      customers,
      purchases,
      prescriptions,
      loyaltyTransactions,
      feedback,
      reminders,
      storageNotice: notice,
      getCustomer,
      isPhoneTaken,
      addCustomer,
      updateCustomer,
      addFeedback,
      recordPurchasePoints,
      markReminderSent,
      resetDemoData,
      notify,
    }),
    [today, customers, purchases, prescriptions, loyaltyTransactions, feedback, reminders, notice, getCustomer, isPhoneTaken, addCustomer, updateCustomer, addFeedback, recordPurchasePoints, markReminderSent, resetDemoData, notify],
  );

  return (
    <CustomersContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </CustomersContext.Provider>
  );
}

const toastStyle: Record<ToastTone, { icon: IconName; box: string }> = {
  success: { icon: "check", box: "border-(--success-solid)/35 bg-(--success-bg) text-(--success-ink)" },
  info: { icon: "info", box: "border-(--info-solid)/35 bg-(--info-bg) text-(--info-ink)" },
  warning: { icon: "alert", box: "border-(--warning-solid)/35 bg-(--warning-bg) text-(--warning-ink)" },
  danger: { icon: "alertCircle", box: "border-(--danger-solid)/35 bg-(--danger-bg) text-(--danger-ink)" },
};

/** Notifications sit top right of the content area, like "Customer added successfully" in the design. */
function ToastViewport({ toasts, onDismiss }: { toasts: ToastMessage[]; onDismiss: (id: number) => void }) {
  return (
    <div aria-live="polite" className="pointer-events-none fixed top-4 right-4 left-4 z-[60] flex flex-col items-end gap-2 sm:left-auto">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`pointer-events-auto flex w-full max-w-[420px] items-start gap-2.5 rounded-md border px-4 py-2.5 shadow-(--shadow-2) ${toastStyle[t.tone].box}`}
        >
          <Icon name={toastStyle[t.tone].icon} size={16} strokeWidth={2.5} className="mt-[3px]" />
          <div className="min-w-0 flex-1 text-sm leading-5">
            <p className="font-semibold">{t.title}</p>
            {t.description ? <p className="mt-0.5 text-[13px] leading-[18px] text-(--ink)">{t.description}</p> : null}
            {t.action ? (
              <Link href={t.action.href} onClick={() => onDismiss(t.id)} className="mt-1 inline-block text-[13px] font-semibold text-(--link) underline-offset-2 hover:underline">
                {t.action.label}
              </Link>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => onDismiss(t.id)}
            aria-label="Dismiss notification"
            className="-mr-1 cursor-pointer rounded-sm p-1 opacity-80 hover:bg-black/5 hover:opacity-100"
          >
            <Icon name="x" size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
