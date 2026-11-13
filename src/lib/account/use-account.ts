"use client";

// Everything the customer account pages show, for the signed-in customer only.
// Identity comes from the auth session; orders and payments from the shared orders store.
import { useMemo, useSyncExternalStore } from "react";
import { getAccountSeed } from "@/data/account";
import { useAuth } from "@/lib/auth";
import { getCustomerProfile } from "@/lib/auth-store";
import { getInitials } from "@/lib/customers";
import { customerDiscount, isFinished } from "@/lib/orders";
import { useOrders } from "@/lib/orders-store";
import type { AccountPrescription, AccountProfile, SavedAddress } from "@/types/account";
import type { BranchId } from "@/types/roles";
import { buildLoyaltyLedger, buildRefillReminders, loyaltyTotals, paymentForOrder, todayISO } from "./rules";
import { useAccountEdits } from "./store";

const noopSubscribe = () => () => {};

/** Today's local date. Read in a store snapshot so rendering stays pure; the server never renders account pages. */
export function useToday(): string {
  return useSyncExternalStore(noopSubscribe, () => todayISO(), () => "");
}

export function useAccount() {
  const { user } = useAuth();
  const edits = useAccountEdits();
  const { orders, prescriptions } = useOrders();
  const today = useToday();

  return useMemo(() => {
    if (!user || user.role !== "customer") return null;
    const customerId = user.customerId ?? user.id;
    const seed = getAccountSeed(customerId);
    const mine = edits[customerId] ?? {};
    const registration = getCustomerProfile(customerId);
    const branchId: BranchId = user.branchId === "all" ? "b1" : user.branchId;

    const profile: AccountProfile = mine.profile ?? {
      name: user.name,
      email: user.email ?? registration?.email ?? "",
      phone: user.phone ?? registration?.phone ?? "",
    };

    const seededAddresses: SavedAddress[] = seed.addresses.length
      ? seed.addresses.map((a, i) => ({ ...a, id: `addr-${customerId}-${i + 1}` }))
      : registration?.addressLine || registration?.city
        ? [{ id: `addr-${customerId}-1`, label: "Home", fullName: user.name, phone: user.phone ?? "", addressLine: registration.addressLine ?? "", city: registration.city, district: "", postalCode: "", isDefault: true }]
        : [];
    const addresses = mine.addresses ?? seededAddresses;
    const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];

    const discount = customerDiscount(user.jobTitle);
    const isRegular = discount > 0;
    const statusLabel = isRegular ? "Regular Customer" : /new/i.test(user.jobTitle) ? "New Customer" : "Customer";

    const myOrders = orders.filter((o) => o.customerId === customerId).sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
    const payments = myOrders.map(paymentForOrder);
    const ledger = buildLoyaltyLedger(seed, myOrders);
    const loyalty = { ledger, ...loyaltyTotals(ledger) };

    const feedback = [...(mine.feedback ?? []), ...seed.feedback].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
    const reminders = today ? buildRefillReminders(seed, today) : [];

    // Prescriptions received by Module 4 for this customer, plus the account's own history.
    const fromStore: AccountPrescription[] = prescriptions
      .filter((p) => p.customerId === customerId)
      .map((p) => {
        const order = orders.find((o) => o.id === p.orderId);
        return {
          id: p.id, date: p.receivedOn, doctor: p.doctor, clinic: p.clinic, branchId: p.branchId, via: p.via,
          status: order && isFinished(order.status) ? "dispensed" : "under_review",
          medicines: (order?.items ?? []).map((i) => ({ name: i.name, dosage: i.dose ? `${i.dose}, ${i.timesPerDay ?? 1} times a day` : "As directed", quantity: String(i.qty) })),
        };
      });
    const accountPrescriptions = [...fromStore, ...seed.prescriptions.filter((s) => !fromStore.some((p) => p.id === s.id))].sort((a, b) => b.date.localeCompare(a.date));

    const name = profile.name || user.name;
    return {
      customerId,
      name,
      firstName: name.split(/\s+/)[0],
      initials: getInitials(name),
      profile,
      branchId,
      memberSince: user.createdAt,
      discount,
      isRegular,
      statusLabel,
      addresses,
      defaultAddress,
      orders: myOrders,
      payments,
      loyalty,
      feedback,
      reminders,
      prescriptions: accountPrescriptions,
    };
  }, [user, edits, orders, prescriptions, today]);
}

export type AccountData = NonNullable<ReturnType<typeof useAccount>>;
