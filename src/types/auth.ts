import type { BranchId, Role } from "./roles";

export interface UserAccount {
  id: string;
  name: string;
  role: Role;
  jobTitle: string;
  branchId: BranchId | "all";
  username?: string;
  email?: string;
  /** Sri Lankan mobile, stored as "07XXXXXXXX". */
  phone?: string;
  /** Prototype only: plain text on purpose. Not real security. */
  password: string;
  staffId?: string;
  customerId?: string;
  createdAt: string;
}

export type SessionUser = Omit<UserAccount, "password">;

export interface CustomerProfile {
  customerId: string;
  fullName: string;
  phone: string;
  whatsapp: string;
  email?: string;
  dateOfBirth?: string;
  gender?: "female" | "male" | "prefer_not";
  addressLine?: string;
  city: string;
  preferredBranchId: BranchId;
  contactChannel: "whatsapp" | "sms" | "call";
  consents: {
    terms: true;
    storeHistory: boolean;
    reminders: boolean;
    promotions: boolean;
    at: string;
  };
}

/** Input collected by the registration form. */
export interface RegisterInput {
  fullName: string;
  phone: string;
  whatsapp: string;
  email?: string;
  dateOfBirth?: string;
  gender?: CustomerProfile["gender"];
  addressLine?: string;
  city: string;
  preferredBranchId: BranchId;
  contactChannel: CustomerProfile["contactChannel"];
  password: string;
  storeHistory: boolean;
  reminders: boolean;
  promotions: boolean;
}
