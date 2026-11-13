// Customer account (the signed-in customer's "My Account" pages on the public website).
// Orders and payments come from the shared orders store; everything here is account-only data.
import type { BranchId } from "./roles";

export type Rating = 1 | 2 | 3 | 4 | 5;

/** Contact details the customer can edit. Stored on this device only (prototype). */
export interface AccountProfile {
  name: string;
  email: string;
  /** "07XXXXXXXX". */
  phone: string;
}

export type AddressLabel = "Home" | "Work" | "Other";

export interface SavedAddress {
  id: string;
  label: AddressLabel;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  district: string;
  postalCode: string;
  isDefault: boolean;
}

export type AddressInput = Omit<SavedAddress, "id" | "isDefault">;

export interface AccountFeedback {
  id: string;
  /** ISO date. */
  date: string;
  rating: Rating;
  comment: string;
  branchId: BranchId;
}

export interface LoyaltyEntry {
  id: string;
  /** ISO date. */
  date: string;
  /** Online order the points belong to, when there is one. */
  orderId?: string;
  /** Shown instead of an order id, e.g. "In store". */
  reference?: string;
  description: string;
  earned: number;
  redeemed: number;
  /** Running balance after this entry. */
  balance: number;
}

/** A medicine taken regularly, bought at a branch. Seeds use days before today so the demo never goes stale. */
export interface RefillPurchase {
  id: string;
  medicine: string;
  /** ISO date. */
  purchaseDate: string;
  daysSupply: number;
  quantity: string;
  branchId: BranchId;
  prescriptionOnly: boolean;
}

export type RefillStatus = "overdue" | "due_soon" | "upcoming";

export interface RefillReminder extends RefillPurchase {
  /** purchase date + days supply. */
  refillDate: string;
  /** Negative once the refill date has passed. */
  daysRemaining: number;
  status: RefillStatus;
}

export interface PrescriptionMedicine {
  name: string;
  dosage: string;
  quantity: string;
}

export type AccountPrescriptionStatus = "under_review" | "dispensed" | "expired";

export interface AccountPrescription {
  /** "RX-2041". */
  id: string;
  /** ISO date received. */
  date: string;
  doctor: string;
  clinic: string;
  branchId: BranchId;
  medicines: PrescriptionMedicine[];
  status: AccountPrescriptionStatus;
  via: "whatsapp" | "branch" | "repeat";
  note?: string;
}

export type PaymentStatus = "paid" | "due_on_delivery" | "pay_at_counter" | "awaiting";

export interface AccountPayment {
  /** "PAY-0015", derived from the order id. */
  id: string;
  orderId: string;
  /** ISO date (and time when known). */
  date: string;
  method: string;
  status: PaymentStatus;
  subtotal: number;
  discount: number;
  discountPercent: 0 | 3 | 5;
  deliveryFee: number;
  total: number;
}

/** Account-only seed for one demo customer. */
export interface AccountSeed {
  addresses: Omit<SavedAddress, "id">[];
  feedback: AccountFeedback[];
  openingPoints: { date: string; points: number } | null;
  redemptions: { id: string; date: string; points: number; description: string }[];
  /** daysAgo is turned into a purchase date when the page loads. */
  refills: (Omit<RefillPurchase, "purchaseDate"> & { daysAgo: number })[];
  prescriptions: AccountPrescription[];
}
