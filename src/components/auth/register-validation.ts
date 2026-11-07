import { isEmailTaken, isPhoneTaken, isValidSLMobile, normalisePhone, validatePassword } from "@/lib/auth-store";

export interface RegisterValues {
  fullName: string;
  phone: string;
  sameWhatsapp: boolean;
  whatsapp: string;
  email: string;
  dateOfBirth: string;
  gender: "" | "female" | "male" | "prefer_not";
  addressLine: string;
  city: string;
  preferredBranchId: string;
  contactChannel: "whatsapp" | "sms" | "call";
  password: string;
  confirm: string;
  terms: boolean;
  storeHistory: boolean;
  reminders: boolean;
  promotions: boolean;
}

export type FieldName = keyof RegisterValues;
export type RegisterErrors = Partial<Record<FieldName, string>>;

export const INITIAL_VALUES: RegisterValues = {
  fullName: "", phone: "", sameWhatsapp: true, whatsapp: "", email: "", dateOfBirth: "", gender: "",
  addressLine: "", city: "", preferredBranchId: "", contactChannel: "whatsapp",
  password: "", confirm: "", terms: false, storeHistory: true, reminders: true, promotions: false,
};

export const STEPS = ["Your details", "Address and branch", "Password and consent"];

/** Fields on each step, in screen order (used to focus the first invalid one). */
export const STEP_FIELDS: FieldName[][] = [
  ["fullName", "phone", "whatsapp", "email", "dateOfBirth", "gender"],
  ["addressLine", "city", "preferredBranchId", "contactChannel"],
  ["password", "confirm", "terms"],
];

const NAME_RE = /^[\p{L}\p{M}\s.'-]+$/u;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function mobileError(value: string, emptyMessage: string): string | undefined {
  if (!value.trim()) return emptyMessage;
  if (!isValidSLMobile(normalisePhone(value))) return "Enter a 10-digit mobile number, like 077 123 4567";
  return undefined;
}

function ageOn(dob: Date, today: Date): number {
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

export function validateStep(step: number, v: RegisterValues): RegisterErrors {
  const e: RegisterErrors = {};
  if (step === 0) {
    const name = v.fullName.trim();
    if (!name) e.fullName = "Enter your full name";
    else if (name.length < 2 || name.length > 80) e.fullName = "Enter between 2 and 80 characters";
    else if (!NAME_RE.test(name)) e.fullName = "Use letters, spaces, full stops, apostrophes or hyphens only";

    e.phone = mobileError(v.phone, "Enter your mobile number");
    if (!e.phone && isPhoneTaken(v.phone)) e.phone = "An account with this mobile number already exists. Sign in instead.";

    if (!v.sameWhatsapp) e.whatsapp = mobileError(v.whatsapp, "Enter your WhatsApp number");

    const email = v.email.trim();
    if (email && !EMAIL_RE.test(email)) e.email = "Enter an email address like name@example.com";
    else if (email && isEmailTaken(email)) e.email = "An account with this email already exists. Sign in instead.";

    if (v.dateOfBirth) {
      const dob = new Date(v.dateOfBirth);
      const today = new Date();
      if (Number.isNaN(dob.getTime())) e.dateOfBirth = "Enter a valid date";
      else if (dob > today) e.dateOfBirth = "Date of birth can't be in the future";
      else if (ageOn(dob, today) < 16) e.dateOfBirth = "You must be 16 or older to create an account";
    }
  }
  if (step === 1) {
    if (v.addressLine.length > 120) e.addressLine = "Keep the address under 120 characters";
    if (!v.city.trim()) e.city = "Enter your city or town";
    if (!v.preferredBranchId) e.preferredBranchId = "Choose your preferred branch";
  }
  if (step === 2) {
    const unmet = validatePassword(v.password);
    if (!v.password) e.password = "Create a password";
    else if (unmet.length) e.password = "Your password doesn't meet all the rules below";
    if (!v.confirm) e.confirm = "Enter your password again";
    else if (v.confirm !== v.password) e.confirm = "Passwords do not match";
    if (!v.terms) e.terms = "Accept the terms to continue";
  }
  for (const k of Object.keys(e) as FieldName[]) if (!e[k]) delete e[k];
  return e;
}

export interface StepProps {
  values: RegisterValues;
  set: <K extends FieldName>(field: K, value: RegisterValues[K]) => void;
  /** Visible error for a field (after blur or Continue). */
  err: (field: FieldName) => string | undefined;
  blur: (field: FieldName) => void;
}
