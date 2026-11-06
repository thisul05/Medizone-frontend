// Module 5 mock data: customers, purchases, prescriptions, loyalty points and feedback.
// Customers cus-01 to cus-08 use the same ids, names, phone numbers and branches as the
// Delivery module's mock data (src/data/delivery.ts), so both modules point at the same people.
// All dates are ISO, all money is LKR, and "today" is PROTOTYPE_TODAY (6 Nov 2026).

import { calculateLoyaltyPoints, calculatePurchaseTotals } from "@/lib/customers";
import type {
  Branch,
  BranchId,
  Customer,
  CustomerFeedback,
  LoyaltyTransaction,
  PaymentMethod,
  Purchase,
  PurchaseItem,
  StoredPrescription,
} from "@/types/customers";

/** Public contact details, as shown on www.medizone.lk. */
export const PHARMACY_CONTACT = {
  name: "Medizone Pharmacy",
  phone: "0701855855",
  email: "hello@medizone.lk",
  website: "www.medizone.lk",
  address: "238 1/B, Horana Road, Miriswaththa, Piliyandala",
};

export const branches: Branch[] = [
  { id: "b1", name: "Branch 1", isMain: true },
  { id: "b2", name: "Branch 2" },
  { id: "b3", name: "Branch 3" },
  { id: "b4", name: "Branch 4" },
];

/* ---------- Customers (loyaltyPoints is filled in from the transactions below) ---------- */

const baseCustomers: Omit<Customer, "loyaltyPoints">[] = [
  { id: "cus-01", name: "Sunil Perera", phone: "0771234567", email: "sunil.perera@gmail.com", address: "45/3 Horana Road, Piliyandala", branchId: "b1", isRegular: true, discountPercent: 5, joinedOn: "2023-02-14" },
  { id: "cus-02", name: "Kamani Fernando", phone: "0712345678", email: "kamani.f@yahoo.com", address: "78 Kalutara Road, Piliyandala", branchId: "b1", isRegular: true, discountPercent: 3, joinedOn: "2023-08-02" },
  { id: "cus-03", name: "Nuwan Rajapaksa", phone: "0754321098", address: "12/A Moratuwa Road, Piliyandala", branchId: "b2", isRegular: false, discountPercent: 0, joinedOn: "2025-03-19" },
  { id: "cus-04", name: "Dilrukshi Silva", phone: "0769876543", email: "dilrukshi.silva@gmail.com", address: "23 Koswatta Road, Battaramulla", branchId: "b2", isRegular: false, discountPercent: 0, joinedOn: "2025-11-07" },
  { id: "cus-05", name: "Pradeep Jayawardena", phone: "0785551234", email: "pradeepj@slt.lk", address: "56 High Level Road, Nugegoda", branchId: "b1", isRegular: true, discountPercent: 5, joinedOn: "2022-10-21" },
  { id: "cus-06", name: "Sanduni Wijesinghe", phone: "0712223344", email: "sanduni.w@gmail.com", address: "89 Nawala Road, Nawala", branchId: "b3", isRegular: false, discountPercent: 0, joinedOn: "2024-06-11" },
  { id: "cus-07", name: "Lasith Mendis", phone: "0774433221", address: "34 Maharagama Road, Maharagama", branchId: "b1", isRegular: true, discountPercent: 3, joinedOn: "2024-01-08" },
  { id: "cus-08", name: "Chamari Athapaththu", phone: "0769988776", address: "67 Station Road, Piliyandala", branchId: "b4", isRegular: false, discountPercent: 0, joinedOn: "2026-10-30" },
  { id: "cus-09", name: "Mohamed Rizwan", phone: "0775678901", email: "rizwan.m@gmail.com", address: "14 Mosque Lane, Kesbewa", branchId: "b3", isRegular: true, discountPercent: 3, joinedOn: "2023-05-27" },
  { id: "cus-10", name: "Tharushi Gunasekara", phone: "0706789012", address: "9/2 Temple Road, Bokundara", branchId: "b2", isRegular: false, discountPercent: 0, joinedOn: "2026-04-15" },
  { id: "cus-11", name: "Ruwan Bandara", phone: "0787890123", email: "ruwan.bandara@hotmail.com", address: "102 Dehiwala Road, Boralesgamuwa", branchId: "b4", isRegular: true, discountPercent: 5, joinedOn: "2022-07-03" },
  { id: "cus-12", name: "Fathima Nazeer", phone: "0718901234", address: "27 Old Road, Madapatha", branchId: "b3", isRegular: false, discountPercent: 0, joinedOn: "2025-09-30" },
  { id: "cus-13", name: "Shanthi Rajendran", phone: "0779988776", email: "shanthi.r@gmail.com", address: "5 Hill Street, Dehiwala", branchId: "b4", isRegular: true, discountPercent: 5, joinedOn: "2023-11-12" },
  { id: "cus-14", name: "Isuru Dissanayake", phone: "0765544332", address: "71 Suwarapola Road, Piliyandala", branchId: "b1", isRegular: false, discountPercent: 0, joinedOn: "2026-01-22" },
];

/* ---------- Medicines used in the mock purchases (unit prices in LKR) ---------- */

const MED = {
  metformin: { name: "Metformin 500 mg tablets", price: 8 },
  losartan: { name: "Losartan potassium 50 mg tablets", price: 22 },
  atorvastatin: { name: "Atorvastatin 20 mg tablets", price: 28 },
  amlodipine: { name: "Amlodipine 5 mg tablets", price: 12 },
  gliclazide: { name: "Gliclazide 80 mg tablets", price: 10 },
  thyroxine: { name: "Levothyroxine 50 mcg tablets", price: 9 },
  clopidogrel: { name: "Clopidogrel 75 mg tablets", price: 30 },
  aspirin: { name: "Aspirin 75 mg tablets", price: 3 },
  omeprazole: { name: "Omeprazole 20 mg capsules", price: 15 },
  salbutamol: { name: "Salbutamol 100 mcg inhaler", price: 1150 },
  insulin: { name: "Insulin glargine 100 IU/mL pen", price: 3450 },
  paracetamol: { name: "Paracetamol 500 mg tablets", price: 4 },
  amoxicillin: { name: "Amoxicillin 500 mg capsules", price: 18 },
  cetirizine: { name: "Cetirizine 10 mg tablets", price: 6 },
  vitaminC: { name: "Vitamin C 500 mg tablets", price: 7 },
  ors: { name: "Oral rehydration salts sachet", price: 45 },
} as const;

type MedKey = keyof typeof MED;

function item(key: MedKey, quantity: number, daysSupply?: number): PurchaseItem {
  return { medicine: MED[key].name, quantity, unitPrice: MED[key].price, daysSupply };
}

const rawPurchases: {
  id: string;
  customerId: string;
  date: string;
  paymentMethod: PaymentMethod;
  items: PurchaseItem[];
  branchId?: BranchId;
}[] = [
  // Sunil Perera: diabetes and cholesterol, monthly
  { id: "INV-1001", customerId: "cus-01", date: "2026-08-12", paymentMethod: "cash", items: [item("metformin", 60, 30), item("atorvastatin", 30, 30)] },
  { id: "INV-1014", customerId: "cus-01", date: "2026-09-10", paymentMethod: "card", items: [item("metformin", 60, 30), item("atorvastatin", 30, 30), item("paracetamol", 20)] },
  { id: "INV-1033", customerId: "cus-01", date: "2026-10-10", paymentMethod: "card", items: [item("metformin", 60, 30), item("atorvastatin", 30, 30)] },
  // Kamani Fernando: blood pressure, monthly
  { id: "INV-1016", customerId: "cus-02", date: "2026-09-12", paymentMethod: "cash", items: [item("losartan", 30, 30), item("amlodipine", 30, 30)] },
  { id: "INV-1037", customerId: "cus-02", date: "2026-10-14", paymentMethod: "cash", items: [item("losartan", 30, 30), item("amlodipine", 30, 30)] },
  { id: "INV-1048", customerId: "cus-02", date: "2026-10-28", paymentMethod: "cash", items: [item("paracetamol", 20), item("vitaminC", 30)] },
  // Nuwan Rajapaksa: thyroid
  { id: "INV-1027", customerId: "cus-03", date: "2026-10-02", paymentMethod: "cash", items: [item("thyroxine", 30, 30)] },
  { id: "INV-1043", customerId: "cus-03", date: "2026-10-20", paymentMethod: "cash", items: [item("amoxicillin", 21), item("paracetamol", 10)] },
  // Dilrukshi Silva: occasional
  { id: "INV-1010", customerId: "cus-04", date: "2026-09-02", paymentMethod: "card", items: [item("cetirizine", 10), item("vitaminC", 30)] },
  { id: "INV-1045", customerId: "cus-04", date: "2026-10-22", paymentMethod: "card", items: [item("cetirizine", 10), item("paracetamol", 10)] },
  // Pradeep Jayawardena: heart medicines, monthly
  { id: "INV-1003", customerId: "cus-05", date: "2026-08-08", paymentMethod: "bank_transfer", items: [item("clopidogrel", 30, 30), item("aspirin", 30, 30), item("atorvastatin", 30, 30)] },
  { id: "INV-1012", customerId: "cus-05", date: "2026-09-08", paymentMethod: "bank_transfer", items: [item("clopidogrel", 30, 30), item("aspirin", 30, 30), item("atorvastatin", 30, 30)] },
  { id: "INV-1031", customerId: "cus-05", date: "2026-10-08", paymentMethod: "card", items: [item("clopidogrel", 30, 30), item("aspirin", 30, 30), item("atorvastatin", 30, 30)] },
  // Sanduni Wijesinghe: asthma
  { id: "INV-1020", customerId: "cus-06", date: "2026-09-21", paymentMethod: "card", items: [item("cetirizine", 10)] },
  { id: "INV-1041", customerId: "cus-06", date: "2026-10-18", paymentMethod: "card", items: [item("salbutamol", 1, 60)] },
  // Lasith Mendis: diabetes, monthly
  { id: "INV-1023", customerId: "cus-07", date: "2026-09-26", paymentMethod: "cash", items: [item("gliclazide", 60, 30), item("metformin", 60, 30)] },
  { id: "INV-1047", customerId: "cus-07", date: "2026-10-27", paymentMethod: "cash", items: [item("gliclazide", 60, 30), item("metformin", 60, 30)] },
  // Chamari Athapaththu: new customer
  { id: "INV-1052", customerId: "cus-08", date: "2026-11-02", paymentMethod: "cash", items: [item("paracetamol", 20), item("ors", 5)] },
  // Mohamed Rizwan: insulin
  { id: "INV-1015", customerId: "cus-09", date: "2026-09-12", paymentMethod: "card", items: [item("insulin", 2, 30)] },
  { id: "INV-1035", customerId: "cus-09", date: "2026-10-12", paymentMethod: "card", items: [item("insulin", 2, 30), item("vitaminC", 30)] },
  // Tharushi Gunasekara: occasional
  { id: "INV-1050", customerId: "cus-10", date: "2026-10-30", paymentMethod: "cash", items: [item("amoxicillin", 15), item("cetirizine", 10)] },
  // Ruwan Bandara: blood pressure and diabetes, monthly
  { id: "INV-1011", customerId: "cus-11", date: "2026-09-06", paymentMethod: "cash", items: [item("losartan", 30, 30), item("metformin", 60, 30)] },
  { id: "INV-1030", customerId: "cus-11", date: "2026-10-07", paymentMethod: "cash", items: [item("losartan", 30, 30), item("metformin", 60, 30), item("omeprazole", 14)] },
  // Fathima Nazeer: thyroid
  { id: "INV-1028", customerId: "cus-12", date: "2026-10-05", paymentMethod: "cash", items: [item("thyroxine", 30, 30)] },
  // Shanthi Rajendran: blood pressure and cholesterol
  { id: "INV-1018", customerId: "cus-13", date: "2026-09-16", paymentMethod: "bank_transfer", items: [item("amlodipine", 30, 30), item("atorvastatin", 30, 30)] },
  { id: "INV-1039", customerId: "cus-13", date: "2026-10-16", paymentMethod: "bank_transfer", items: [item("amlodipine", 30, 30), item("atorvastatin", 30, 30), item("vitaminC", 30)] },
  // Isuru Dissanayake: gastritis course
  { id: "INV-1046", customerId: "cus-14", date: "2026-10-24", paymentMethod: "cash", items: [item("omeprazole", 14, 14)] },
];

const customerById = new Map(baseCustomers.map((c) => [c.id, c]));

export const purchases: Purchase[] = rawPurchases
  .map((p) => {
    const customer = customerById.get(p.customerId);
    if (!customer) throw new Error(`Unknown customer ${p.customerId}`);
    const discountPercent = customer.isRegular ? customer.discountPercent : 0;
    return {
      id: p.id,
      customerId: p.customerId,
      branchId: p.branchId ?? customer.branchId,
      date: p.date,
      items: p.items,
      discountPercent,
      paymentMethod: p.paymentMethod,
      ...calculatePurchaseTotals(p.items, discountPercent),
    };
  })
  .sort((a, b) => b.date.localeCompare(a.date));

/* ---------- Loyalty points ---------- */

// Balances carried over from the paper loyalty cards when the system started.
const openingBalances: Record<string, number> = {
  "cus-01": 640, "cus-02": 410, "cus-03": 85, "cus-04": 30, "cus-05": 920, "cus-06": 60, "cus-07": 350,
  "cus-08": 0, "cus-09": 520, "cus-10": 15, "cus-11": 780, "cus-12": 45, "cus-13": 690, "cus-14": 20,
};

const redemptions: Omit<LoyaltyTransaction, "id" | "type">[] = [
  { customerId: "cus-05", date: "2026-09-08", points: -500, purchaseId: "INV-1012", description: "Redeemed against bill" },
  { customerId: "cus-01", date: "2026-10-10", points: -300, purchaseId: "INV-1033", description: "Redeemed against bill" },
  { customerId: "cus-11", date: "2026-10-07", points: -200, purchaseId: "INV-1030", description: "Redeemed against bill" },
  { customerId: "cus-13", date: "2026-10-16", points: -250, purchaseId: "INV-1039", description: "Redeemed against bill" },
];

const unsortedTransactions: Omit<LoyaltyTransaction, "id">[] = [
  ...Object.entries(openingBalances)
    .filter(([, points]) => points > 0)
    .map(([customerId, points]) => ({
      customerId,
      date: "2026-07-01",
      type: "adjusted" as const,
      points,
      description: "Opening balance from paper loyalty card",
    })),
  ...purchases
    .filter((p) => p.pointsEarned > 0)
    .map((p) => ({
      customerId: p.customerId,
      date: p.date,
      type: "earned" as const,
      points: calculateLoyaltyPoints(p.total),
      purchaseId: p.id,
      description: "Earned on purchase",
    })),
  ...redemptions.map((r) => ({ ...r, type: "redeemed" as const })),
];

export const loyaltyTransactions: LoyaltyTransaction[] = unsortedTransactions
  .sort((a, b) => a.date.localeCompare(b.date) || a.customerId.localeCompare(b.customerId))
  .map((t, i) => ({ ...t, id: `LT-${String(i + 1).padStart(4, "0")}` }))
  .reverse();

export const customers: Customer[] = baseCustomers.map((c) => ({
  ...c,
  loyaltyPoints: loyaltyTransactions
    .filter((t) => t.customerId === c.id)
    .reduce((sum, t) => sum + t.points, 0),
}));

/* ---------- Stored prescriptions ---------- */

export const prescriptions: StoredPrescription[] = [
  { id: "RX-1042", customerId: "cus-01", doctorName: "Dr. A. Gunawardena", hospital: "Colombo South Teaching Hospital", issuedOn: "2026-06-18", validUntil: "2026-12-18", medicines: [MED.metformin.name, MED.atorvastatin.name], notes: "Metformin twice daily after meals. Review HbA1c in December." },
  { id: "RX-0987", customerId: "cus-01", doctorName: "Dr. A. Gunawardena", hospital: "Colombo South Teaching Hospital", issuedOn: "2025-12-10", validUntil: "2026-06-10", medicines: [MED.metformin.name, MED.atorvastatin.name] },
  { id: "RX-1056", customerId: "cus-02", doctorName: "Dr. S. Wickramaratne", hospital: "Lanka Hospitals, Colombo 5", issuedOn: "2026-08-30", validUntil: "2027-02-28", medicines: [MED.losartan.name, MED.amlodipine.name], notes: "Check blood pressure monthly at the pharmacy." },
  { id: "RX-1061", customerId: "cus-03", doctorName: "Dr. N. Senanayake", hospital: "Asiri Hospital, Kirula Road", issuedOn: "2026-09-25", validUntil: "2027-03-25", medicines: [MED.thyroxine.name], notes: "Take on an empty stomach, 30 minutes before breakfast." },
  { id: "RX-1071", customerId: "cus-03", doctorName: "Dr. P. Kodikara", hospital: "Piliyandala Medical Centre", issuedOn: "2026-10-20", validUntil: "2026-10-27", medicines: [MED.amoxicillin.name, MED.paracetamol.name], notes: "7-day course. Complete all capsules." },
  { id: "RX-1034", customerId: "cus-05", doctorName: "Dr. R. Abeysekera", hospital: "Sri Jayewardenepura General Hospital", issuedOn: "2026-05-12", validUntil: "2026-11-12", medicines: [MED.clopidogrel.name, MED.aspirin.name, MED.atorvastatin.name], notes: "Cardiology clinic follow-up due in November." },
  { id: "RX-1066", customerId: "cus-06", doctorName: "Dr. M. Fernando", hospital: "Nawaloka Hospital", issuedOn: "2026-10-15", validUntil: "2027-04-15", medicines: [MED.salbutamol.name], notes: "Use 2 puffs when needed. Return if used more than 3 times a week." },
  { id: "RX-1049", customerId: "cus-07", doctorName: "Dr. K. Jayasuriya", hospital: "Colombo South Teaching Hospital", issuedOn: "2026-07-22", validUntil: "2027-01-22", medicines: [MED.gliclazide.name, MED.metformin.name] },
  { id: "RX-1052", customerId: "cus-09", doctorName: "Dr. F. Marikar", hospital: "Durdans Hospital", issuedOn: "2026-08-05", validUntil: "2027-02-05", medicines: [MED.insulin.name], notes: "Store pens in the refrigerator. 18 units at night." },
  { id: "RX-1029", customerId: "cus-11", doctorName: "Dr. L. Rathnayake", hospital: "Kalubowila Teaching Hospital", issuedOn: "2026-04-02", validUntil: "2026-10-02", medicines: [MED.losartan.name, MED.metformin.name], notes: "Prescription expired. Ask the customer for a renewed prescription." },
  { id: "RX-1063", customerId: "cus-12", doctorName: "Dr. N. Senanayake", hospital: "Asiri Hospital, Kirula Road", issuedOn: "2026-10-01", validUntil: "2027-04-01", medicines: [MED.thyroxine.name] },
  { id: "RX-1058", customerId: "cus-13", doctorName: "Dr. V. Shanmugam", hospital: "Kings Hospital, Colombo 5", issuedOn: "2026-09-10", validUntil: "2027-03-10", medicines: [MED.amlodipine.name, MED.atorvastatin.name] },
  { id: "RX-1068", customerId: "cus-14", doctorName: "Dr. P. Kodikara", hospital: "Piliyandala Medical Centre", issuedOn: "2026-10-24", validUntil: "2026-11-24", medicines: [MED.omeprazole.name], notes: "14-day course before meals." },
];

/* ---------- Customer feedback ---------- */

export const feedback: CustomerFeedback[] = [
  { id: "FB-018", customerId: "cus-08", branchId: "b4", date: "2026-11-02", rating: 5, comment: "First visit and the pharmacist explained how to use the rehydration salts for my son. Very kind." },
  { id: "FB-017", customerId: "cus-14", branchId: "b1", date: "2026-10-31", rating: 4, comment: "Got my medicine quickly. The queue was a bit long in the evening." },
  { id: "FB-016", customerId: "cus-10", branchId: "b2", date: "2026-10-30", rating: 3, comment: "Staff were helpful but the antibiotic was out of stock and I had to come back the next day." },
  { id: "FB-015", customerId: "cus-07", branchId: "b1", date: "2026-10-27", rating: 5, comment: "They remembered my usual diabetes tablets and had them ready. Saves me time every month." },
  { id: "FB-014", customerId: "cus-06", branchId: "b3", date: "2026-10-18", rating: 4, comment: "Pharmacist showed me the correct inhaler technique. Would like a spacer to be available." },
  { id: "FB-013", customerId: "cus-13", branchId: "b4", date: "2026-10-16", rating: 5, comment: "The 5% regular discount and loyalty points really help with monthly costs. Thank you." },
  { id: "FB-012", customerId: "cus-09", branchId: "b3", date: "2026-10-12", rating: 4, comment: "Insulin pens are always kept cold and packed well. Parking near the branch is difficult." },
  { id: "FB-011", customerId: "cus-01", branchId: "b1", date: "2026-10-10", rating: 5, comment: "Excellent service as always. The refill reminder last month was very useful." },
  { id: "FB-010", customerId: "cus-05", branchId: "b1", date: "2026-10-08", rating: 4, comment: "Good service. Would be nice to pay by QR code as well." },
  { id: "FB-009", customerId: "cus-11", branchId: "b4", date: "2026-10-07", rating: 2, comment: "Waited almost 25 minutes on Saturday morning. Only one staff member at the counter." },
  { id: "FB-008", customerId: "cus-12", branchId: "b3", date: "2026-10-05", rating: 5, comment: "Very clean pharmacy and the staff speak Tamil, which makes it easy for my mother." },
  { id: "FB-007", customerId: "cus-03", branchId: "b2", date: "2026-10-02", rating: 4, comment: "Clear instructions on when to take the thyroid tablet. Friendly team." },
  { id: "FB-006", customerId: "cus-02", branchId: "b1", date: "2026-09-12", rating: 5, comment: "Free blood pressure check with my monthly medicine. Great idea." },
  { id: "FB-005", customerId: "cus-04", branchId: "b2", date: "2026-09-02", rating: 3, comment: "Prices are fair, but the bill printer was not working so I had no receipt." },
  { id: "FB-004", customerId: "cus-06", branchId: "b3", date: "2026-08-21", rating: 1, comment: "I was given the wrong strength of cetirizine syrup. It was corrected, but please double-check." },
  { id: "FB-003", customerId: "cus-05", branchId: "b1", date: "2026-08-08", rating: 5, comment: "The pharmacist called my doctor to confirm a dose. Very professional." },
  { id: "FB-002", customerId: "cus-13", branchId: "b4", date: "2026-07-30", rating: 4, comment: "Helpful staff. The branch closes too early on Sundays." },
  { id: "FB-001", customerId: "cus-11", branchId: "b4", date: "2026-07-18", rating: 4, comment: "Reliable stock of my blood pressure tablets every month." },
];

/* ---------- Refill reminders already sent (reminder id → date sent) ---------- */

export const sentReminders: Record<string, string> = {
  "rem-INV-1028-1": "2026-11-03",
};

export function getBranchName(branchId: BranchId): string {
  const branch = branches.find((b) => b.id === branchId);
  if (!branch) return branchId;
  return branch.isMain ? `${branch.name} (main)` : branch.name;
}
