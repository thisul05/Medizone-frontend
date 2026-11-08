"use client";

// Session state for the Customers module. Lives in src/app/customers/layout.tsx, so everything
// added on one page (customers, feedback, points, sent reminders) shows on the others until refresh.

import Link from "next/link";
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import {
  customers as initialCustomers,
  feedback as initialFeedback,
  loyaltyTransactions as initialTransactions,
  prescriptions as initialPrescriptions,
  purchases as initialPurchases,
  sentReminders as initialSent,
} from "@/data/customers";
import { PROTOTYPE_TODAY, buildRefillReminders, calculateLoyaltyPoints, formatLKR, normalizePhone } from "@/lib/customers";
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
  customers: Customer[];
  purchases: Purchase[];
  prescriptions: StoredPrescription[];
  loyaltyTransactions: LoyaltyTransaction[];
  feedback: CustomerFeedback[];
  reminders: RefillReminder[];
  getCustomer: (id: string) => Customer | undefined;
  isPhoneTaken: (phone: string, exceptCustomerId?: string) => boolean;
  addCustomer: (input: CustomerInput) => Customer;
  updateCustomer: (id: string, input: CustomerInput) => void;
  addFeedback: (input: FeedbackInput) => CustomerFeedback;
  recordPurchasePoints: (customerId: string, amountPaid: number) => LoyaltyTransaction | null;
  markReminderSent: (reminderId: string) => void;
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
    address: input.address.trim(),
    branchId: input.branchId,
    isRegular: input.isRegular,
    discountPercent: input.isRegular ? input.discountPercent : 0,
  };
}

export function CustomersProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [purchases] = useState<Purchase[]>(initialPurchases);
  const [prescriptions] = useState<StoredPrescription[]>(initialPrescriptions);
  const [loyaltyTransactions, setLoyaltyTransactions] = useState<LoyaltyTransaction[]>(initialTransactions);
  const [feedback, setFeedback] = useState<CustomerFeedback[]>(initialFeedback);
  const [sent, setSent] = useState<Record<string, string>>(initialSent);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastCounter = useRef(0);

  const reminders = useMemo(() => buildRefillReminders(purchases, sent), [purchases, sent]);

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
      const id = `cus-${String(nextNumber(customers.map((c) => c.id), /^cus-(\d+)$/)).padStart(2, "0")}`;
      const customer: Customer = { ...cleanInput(input), id, loyaltyPoints: 0, joinedOn: PROTOTYPE_TODAY };
      setCustomers((list) => [customer, ...list]);
      return customer;
    },
    [customers],
  );

  const updateCustomer = useCallback((id: string, input: CustomerInput) => {
    setCustomers((list) => list.map((c) => (c.id === id ? { ...c, ...cleanInput(input) } : c)));
  }, []);

  const addFeedback = useCallback(
    (input: FeedbackInput) => {
      const n = nextNumber(feedback.map((f) => f.id), /^FB-(\d+)$/);
      const entry: CustomerFeedback = {
        ...input,
        comment: input.comment.trim(),
        id: `FB-${String(n).padStart(3, "0")}`,
        date: PROTOTYPE_TODAY,
      };
      setFeedback((list) => [entry, ...list]);
      return entry;
    },
    [feedback],
  );

  const recordPurchasePoints = useCallback(
    (customerId: string, amountPaid: number) => {
      const points = calculateLoyaltyPoints(amountPaid);
      if (points <= 0) return null;
      const n = nextNumber(loyaltyTransactions.map((t) => t.id), /^LT-(\d+)$/);
      const txn: LoyaltyTransaction = {
        id: `LT-${String(n).padStart(4, "0")}`,
        customerId,
        date: PROTOTYPE_TODAY,
        type: "earned",
        points,
        description: `Earned on counter purchase of ${formatLKR(amountPaid)}`,
      };
      setLoyaltyTransactions((list) => [txn, ...list]);
      setCustomers((list) => list.map((c) => (c.id === customerId ? { ...c, loyaltyPoints: c.loyaltyPoints + points } : c)));
      return txn;
    },
    [loyaltyTransactions],
  );

  const markReminderSent = useCallback((reminderId: string) => {
    setSent((map) => ({ ...map, [reminderId]: PROTOTYPE_TODAY }));
  }, []);

  const value = useMemo<CustomersContextValue>(
    () => ({
      customers,
      purchases,
      prescriptions,
      loyaltyTransactions,
      feedback,
      reminders,
      getCustomer,
      isPhoneTaken,
      addCustomer,
      updateCustomer,
      addFeedback,
      recordPurchasePoints,
      markReminderSent,
      notify,
    }),
    [customers, purchases, prescriptions, loyaltyTransactions, feedback, reminders, getCustomer, isPhoneTaken, addCustomer, updateCustomer, addFeedback, recordPurchasePoints, markReminderSent, notify],
  );

  return (
    <CustomersContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </CustomersContext.Provider>
  );
}

const toastIcon: Record<ToastTone, { icon: IconName; className: string }> = {
  success: { icon: "checkCircle", className: "bg-(--success-bg) text-(--success-ink)" },
  info: { icon: "info", className: "bg-(--info-bg) text-(--info-ink)" },
  warning: { icon: "alert", className: "bg-(--warning-bg) text-(--warning-ink)" },
  danger: { icon: "alertCircle", className: "bg-(--danger-bg) text-(--danger-ink)" },
};

function ToastViewport({ toasts, onDismiss }: { toasts: ToastMessage[]; onDismiss: (id: number) => void }) {
  return (
    <div aria-live="polite" className="pointer-events-none fixed right-4 bottom-4 left-4 z-[60] flex flex-col items-end gap-2 sm:left-auto">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className="pointer-events-auto flex w-full max-w-[380px] items-start gap-3 rounded-md border border-(--border) bg-(--surface-raised) px-4 py-3.5 text-(--ink) shadow-(--shadow-2)"
        >
          <span className={`grid size-7 flex-none place-items-center rounded-full ${toastIcon[t.tone].className}`}>
            <Icon name={toastIcon[t.tone].icon} size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{t.title}</p>
            {t.description ? <p className="mt-0.5 text-[13px] leading-[18px] text-(--ink-muted)">{t.description}</p> : null}
            {t.action ? (
              <Link href={t.action.href} onClick={() => onDismiss(t.id)} className="mt-1 inline-block text-sm font-semibold text-(--link) underline-offset-2 hover:underline">
                {t.action.label}
              </Link>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => onDismiss(t.id)}
            aria-label="Dismiss"
            className="cursor-pointer rounded-sm p-1 text-(--ink-subtle) hover:bg-(--surface-hover) hover:text-(--ink)"
          >
            <Icon name="x" size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
