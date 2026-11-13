"use client";

// Browser store for the customer's own edits: profile changes, saved addresses and feedback.
// One key ("mz.account.v1"), split by customer id, so nothing here touches other modules' data.
// No passwords or card details are ever stored.
import { useSyncExternalStore } from "react";
import { normalizePhone } from "@/lib/customers";
import { readItem, writeItem } from "@/lib/auth-store";
import type { AccountFeedback, AccountProfile, AddressInput, SavedAddress } from "@/types/account";

export interface CustomerEdits {
  profile?: AccountProfile;
  /** Undefined until the customer first changes an address; the seed is used until then. */
  addresses?: SavedAddress[];
  /** Feedback submitted on this device, newest first. */
  feedback?: AccountFeedback[];
}

type Stored = Record<string, CustomerEdits>;

const KEY = "mz.account.v1";
const EMPTY: Stored = {};

let cache: Stored | undefined;
const listeners = new Set<() => void>();

function read(): Stored {
  if (cache === undefined) {
    try {
      const raw = readItem(KEY);
      const parsed = raw ? (JSON.parse(raw) as unknown) : {};
      cache = parsed && typeof parsed === "object" ? (parsed as Stored) : {};
    } catch {
      cache = {};
    }
  }
  return cache;
}

function write(next: Stored) {
  cache = next;
  writeItem(KEY, JSON.stringify(next));
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = undefined;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function update(customerId: string, fn: (current: CustomerEdits) => CustomerEdits) {
  const all = read();
  write({ ...all, [customerId]: fn(all[customerId] ?? {}) });
}

export function useAccountEdits(): Stored {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

/* ---------- Actions ---------- */

export function saveProfile(customerId: string, profile: AccountProfile) {
  update(customerId, (c) => ({
    ...c,
    profile: { name: profile.name.trim(), email: profile.email.trim(), phone: normalizePhone(profile.phone) },
  }));
}

const cleanAddress = (a: AddressInput): AddressInput => ({
  label: a.label,
  fullName: a.fullName.trim(),
  phone: normalizePhone(a.phone),
  addressLine: a.addressLine.trim(),
  city: a.city.trim(),
  district: a.district,
  postalCode: a.postalCode.trim(),
});

/** Adds a new address (id undefined) or replaces an existing one. The first address becomes the default. */
export function saveAddress(customerId: string, current: SavedAddress[], input: AddressInput, id?: string, makeDefault = false): string {
  const clean = cleanAddress(input);
  let list: SavedAddress[];
  let savedId = id;
  if (id) {
    list = current.map((a) => (a.id === id ? { ...a, ...clean } : a));
  } else {
    savedId = `addr-${Date.now().toString(36)}`;
    list = [...current, { ...clean, id: savedId, isDefault: current.length === 0 }];
  }
  if (makeDefault && savedId) list = list.map((a) => ({ ...a, isDefault: a.id === savedId }));
  update(customerId, (c) => ({ ...c, addresses: list }));
  return savedId as string;
}

/** Removes an address. If it was the default, the first remaining address becomes the default. */
export function deleteAddress(customerId: string, current: SavedAddress[], id: string) {
  const removed = current.find((a) => a.id === id);
  let list = current.filter((a) => a.id !== id);
  if (removed?.isDefault && list.length > 0 && !list.some((a) => a.isDefault)) {
    list = list.map((a, i) => ({ ...a, isDefault: i === 0 }));
  }
  update(customerId, (c) => ({ ...c, addresses: list }));
}

/** Only one address can be the default. */
export function setDefaultAddress(customerId: string, current: SavedAddress[], id: string) {
  update(customerId, (c) => ({ ...c, addresses: current.map((a) => ({ ...a, isDefault: a.id === id })) }));
}

export function addFeedback(customerId: string, entry: Omit<AccountFeedback, "id">): AccountFeedback {
  const saved: AccountFeedback = { ...entry, comment: entry.comment.trim(), id: `FBA-${customerId}-${Date.now().toString(36)}` };
  update(customerId, (c) => ({ ...c, feedback: [saved, ...(c.feedback ?? [])] }));
  return saved;
}
