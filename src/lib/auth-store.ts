// Browser-only auth storage for the prototype. Not real security: passwords are plain text on purpose.
import { demoAccounts } from "@/data/auth";
import type { CustomerProfile, RegisterInput, SessionUser, UserAccount } from "@/types/auth";
import type { BranchId } from "@/types/roles";

export const KEYS = {
  session: "mz.session",
  accounts: "mz.accounts",
  profiles: "mz.customerProfiles",
} as const;

// ---------- Safe storage with an in-memory fallback ----------

const memory = new Map<string, string>();
type Kind = "local" | "session";

function store(kind: Kind): Storage | null {
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export function readItem(key: string, kind: Kind = "local"): string | null {
  try {
    const s = store(kind);
    if (s) return s.getItem(key);
  } catch {
    /* fall through */
  }
  return memory.get(`${kind}:${key}`) ?? null;
}

export function writeItem(key: string, value: string | null, kind: Kind = "local"): void {
  try {
    const s = store(kind);
    if (s) {
      if (value === null) s.removeItem(key);
      else s.setItem(key, value);
      return;
    }
  } catch {
    /* fall through */
  }
  if (value === null) memory.delete(`${kind}:${key}`);
  else memory.set(`${kind}:${key}`, value);
}

function readJSON<T>(key: string, fallback: T, kind: Kind = "local"): T {
  try {
    const raw = readItem(key, kind);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

// ---------- Session (a small external store for useSyncExternalStore) ----------

export type StoredSession = SessionUser & { activeBranchId: BranchId | "all" };

let sessionCache: StoredSession | null | undefined;
let signingOut = false;
const listeners = new Set<() => void>();

export function markSigningOut(): void {
  signingOut = true;
}

export function isSigningOut(): boolean {
  return signingOut;
}

export function clearSigningOut(): void {
  signingOut = false;
}

export function readSession(): StoredSession | null {
  if (sessionCache === undefined) {
    sessionCache = readJSON<StoredSession | null>(KEYS.session, null, "local") ?? readJSON<StoredSession | null>(KEYS.session, null, "session");
  }
  return sessionCache;
}

export function writeSession(session: StoredSession | null, remember?: boolean): void {
  if (session === null) {
    writeItem(KEYS.session, null, "local");
    writeItem(KEYS.session, null, "session");
  } else {
    signingOut = false;
    // Keep the session where it already lives unless told otherwise.
    const keepLocal = remember ?? readItem(KEYS.session, "local") !== null;
    const kind: Kind = keepLocal ? "local" : "session";
    writeItem(KEYS.session, null, kind === "local" ? "session" : "local");
    writeItem(KEYS.session, JSON.stringify(session), kind);
  }
  sessionCache = session;
  listeners.forEach((l) => l());
}

export function subscribeSession(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEYS.session) {
      sessionCache = undefined;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function toSessionUser(account: UserAccount): SessionUser {
  const { password: _password, ...user } = account;
  void _password;
  return user;
}

// ---------- Phones and passwords ----------

/** "+94 77 123-4567" -> "0771234567" */
export function normalisePhone(input: string): string {
  let digits = input.replace(/[\s-]/g, "");
  if (digits.startsWith("+94")) digits = "0" + digits.slice(3);
  else if (digits.startsWith("94") && digits.length === 11) digits = "0" + digits.slice(2);
  return digits;
}

export const isValidSLMobile = (phone: string) => /^07\d{8}$/.test(phone);

export { formatPhone } from "./format";

export const PASSWORD_RULES = [
  { id: "length", label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { id: "letter", label: "At least one letter", test: (p: string) => /\p{L}/u.test(p) },
  { id: "number", label: "At least one number", test: (p: string) => /\d/.test(p) },
] as const;

/** Returns the labels of the rules the password does not meet. */
export function validatePassword(password: string): string[] {
  return PASSWORD_RULES.filter((r) => !r.test(password)).map((r) => r.label);
}

// ---------- Accounts ----------

export function getStoredAccounts(): UserAccount[] {
  return readJSON<UserAccount[]>(KEYS.accounts, []);
}

export function getAllAccounts(): UserAccount[] {
  return [...demoAccounts, ...getStoredAccounts()];
}

export function getCustomerProfiles(): CustomerProfile[] {
  return readJSON<CustomerProfile[]>(KEYS.profiles, []);
}

export function getCustomerProfile(customerId: string): CustomerProfile | undefined {
  return getCustomerProfiles().find((p) => p.customerId === customerId);
}

export const isPhoneTaken = (phone: string) => getAllAccounts().some((a) => a.phone === normalisePhone(phone));
export const isEmailTaken = (email: string) => getAllAccounts().some((a) => clean(a.email) === clean(email));

export type FindResult = { account: UserAccount } | { account: null; message: string };

const clean = (s?: string) => (s ?? "").trim().toLowerCase();

/**
 * Finds any account (staff or customer, seeded or registered) by mobile number, email, username or staff id.
 * Case-insensitive and trimmed. The account decides the role.
 */
export function findAccount(identifier: string): FindResult {
  const id = clean(identifier);
  const phone = normalisePhone(identifier.trim());
  const account = id
    ? getAllAccounts().find(
        (a) =>
          (!!a.phone && a.phone === phone) ||
          clean(a.email) === id ||
          clean(a.username) === id ||
          clean(a.staffId) === id,
      )
    : undefined;
  if (account) return { account };
  return { account: null, message: "We couldn't find an account with that mobile number, email or username." };
}

export type RegisterResult =
  | { ok: true; account: UserAccount; profile: CustomerProfile }
  | { ok: false; errors: Partial<Record<"phone" | "email", string>> };

export function registerCustomer(input: RegisterInput): RegisterResult {
  const accounts = getAllAccounts();
  const phone = normalisePhone(input.phone);
  const email = input.email?.trim() || undefined;
  const errors: Partial<Record<"phone" | "email", string>> = {};
  if (accounts.some((a) => a.phone === phone)) errors.phone = "An account with this mobile number already exists. Sign in instead.";
  if (email && accounts.some((a) => clean(a.email) === clean(email))) errors.email = "An account with this email already exists. Sign in instead.";
  if (errors.phone || errors.email) return { ok: false, errors };

  const used = accounts.map((a) => Number(a.customerId?.replace(/^c/, "")) || 0);
  const customerId = `c${String(Math.max(100, ...used) + 1).padStart(3, "0")}`;
  const now = new Date().toISOString();

  const account: UserAccount = {
    id: `u-${customerId}`,
    name: input.fullName.trim(),
    role: "customer",
    jobTitle: "Customer (new)",
    branchId: input.preferredBranchId,
    phone,
    email,
    password: input.password,
    customerId,
    createdAt: now,
  };
  const profile: CustomerProfile = {
    customerId,
    fullName: account.name,
    phone,
    whatsapp: normalisePhone(input.whatsapp),
    email,
    dateOfBirth: input.dateOfBirth || undefined,
    gender: input.gender,
    addressLine: input.addressLine?.trim() || undefined,
    city: input.city.trim(),
    preferredBranchId: input.preferredBranchId,
    contactChannel: input.contactChannel,
    consents: { terms: true, storeHistory: input.storeHistory, reminders: input.reminders, promotions: input.promotions, at: now },
  };

  writeItem(KEYS.accounts, JSON.stringify([...getStoredAccounts(), account]));
  writeItem(KEYS.profiles, JSON.stringify([...getCustomerProfiles(), profile]));
  return { ok: true, account, profile };
}

/** Registered (self sign-up) customers in Module 5's customer shape. */
export function getRegisteredCustomers() {
  return getStoredAccounts()
    .filter((a) => a.role === "customer" && a.customerId)
    .map((a) => ({
      id: a.customerId as string,
      name: a.name,
      phone: a.phone ?? "",
      branchId: a.branchId as BranchId,
      isRegular: false,
      discountPercent: 0,
      loyaltyPoints: 0,
    }));
}
