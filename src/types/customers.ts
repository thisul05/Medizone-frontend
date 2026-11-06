// Module 5: Customers, loyalty and feedback.
// These types are the customer master record for the whole prototype.
// Orders, Delivery and Billing can import Customer and refer to customers by `id` (e.g. "cus-01").

export type BranchId = "b1" | "b2" | "b3" | "b4";

export interface Branch {
  id: BranchId;
  /** "Branch 1" to "Branch 4" until the owner confirms branch names. */
  name: string;
  isMain?: boolean;
}

/** Regular customers get 3% or 5% off; everyone else gets 0%. */
export type DiscountPercent = 0 | 3 | 5;

export type CustomerType = "regular" | "non_regular";

export interface Customer {
  id: string;
  name: string;
  /** Sri Lankan mobile number, digits only: "0771234567". */
  phone: string;
  email?: string;
  address: string;
  /** Home branch. */
  branchId: BranchId;
  isRegular: boolean;
  discountPercent: DiscountPercent;
  /** Current balance; always equals the sum of the customer's loyalty transactions. */
  loyaltyPoints: number;
  /** ISO date. */
  joinedOn: string;
}

/** Values match the design system's `payMethod` status kind. */
export type PaymentMethod = "cash" | "card" | "bank_transfer";

export interface PurchaseItem {
  medicine: string;
  quantity: number;
  /** LKR per unit. */
  unitPrice: number;
  /** How many days this quantity lasts. Only set for medicines taken regularly. */
  daysSupply?: number;
}

export interface Purchase {
  id: string;
  customerId: string;
  branchId: BranchId;
  /** ISO date. */
  date: string;
  items: PurchaseItem[];
  /** All amounts in LKR. */
  subtotal: number;
  discountPercent: DiscountPercent;
  discountAmount: number;
  /** Amount paid after the regular-customer discount. */
  total: number;
  /** Math.floor(total / 100). */
  pointsEarned: number;
  paymentMethod: PaymentMethod;
}

export type PrescriptionStatus = "active" | "expired";

export interface StoredPrescription {
  id: string;
  customerId: string;
  doctorName: string;
  hospital: string;
  issuedOn: string;
  validUntil: string;
  medicines: string[];
  notes?: string;
}

export type LoyaltyTransactionType = "earned" | "redeemed" | "adjusted";

export interface LoyaltyTransaction {
  id: string;
  customerId: string;
  date: string;
  type: LoyaltyTransactionType;
  /** Signed: positive when earned, negative when redeemed. */
  points: number;
  purchaseId?: string;
  description: string;
}

export type Rating = 1 | 2 | 3 | 4 | 5;

export interface CustomerFeedback {
  id: string;
  customerId: string;
  branchId: BranchId;
  date: string;
  rating: Rating;
  comment: string;
}

export type ReminderStatus = "overdue" | "due_soon" | "upcoming" | "sent";

/** Built from purchases by the rule: expected refill date = purchase date + days of supply. */
export interface RefillReminder {
  id: string;
  customerId: string;
  purchaseId: string;
  medicine: string;
  purchaseDate: string;
  daysSupply: number;
  expectedRefillDate: string;
  /** Negative when the refill date has passed. */
  daysUntilRefill: number;
  status: ReminderStatus;
  sentOn?: string;
}

/** What the Add customer / Edit details form collects. */
export interface CustomerInput {
  name: string;
  phone: string;
  email?: string;
  address: string;
  branchId: BranchId;
  isRegular: boolean;
  discountPercent: DiscountPercent;
}

export interface FeedbackInput {
  customerId: string;
  branchId: BranchId;
  rating: Rating;
  comment: string;
}
