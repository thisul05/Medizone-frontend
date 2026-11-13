// Customer account mock data for the demo customer accounts c1 to c3 (src/data/auth.ts).
// Orders and payments are NOT here: they come from the shared orders store (src/data/orders.ts,
// ord-15 to ord-18), so order ids, totals and statuses stay the same in every module.
// Prescription ids use the RX-2xxx range so they never clash with Module 4's RX-1xxx ids.
import type { AccountSeed } from "@/types/account";

const EMPTY: AccountSeed = {
  addresses: [],
  feedback: [],
  openingPoints: null,
  redemptions: [],
  refills: [],
  prescriptions: [],
};

export const SRI_LANKA_DISTRICTS = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha", "Hambantota", "Jaffna",
  "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Monaragala",
  "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya",
];

const seeds: Record<string, AccountSeed> = {
  // Anura Senanayake: regular customer, 5%, home branch Miriswaththa
  c1: {
    addresses: [
      { label: "Home", fullName: "Anura Senanayake", phone: "0771234567", addressLine: "45/2 Temple Road", city: "Piliyandala", district: "Colombo", postalCode: "10300", isDefault: true },
      { label: "Work", fullName: "Anura Senanayake", phone: "0771234567", addressLine: "Level 3, 120 Galle Road", city: "Colombo 03", district: "Colombo", postalCode: "00300", isDefault: false },
    ],
    feedback: [
      { id: "FBA-c1-02", date: "2026-10-30", rating: 5, comment: "Order ORD-16 was ready to collect the next morning and the pharmacist checked every item with me. Very smooth.", branchId: "b1" },
      { id: "FBA-c1-01", date: "2026-10-22", rating: 4, comment: "The blood pressure monitor was delivered the day after I ordered. The driver called ahead, which I appreciated.", branchId: "b1" },
    ],
    openingPoints: { date: "2026-07-01", points: 450 },
    redemptions: [
      { id: "RED-c1-01", date: "2026-09-18", points: 200, description: "Points redeemed at the Miriswaththa counter" },
    ],
    refills: [
      { id: "rf-c1-1", medicine: "Losartan potassium 50 mg tablets", quantity: "30 tablets", daysAgo: 26, daysSupply: 30, branchId: "b1", prescriptionOnly: true },
      { id: "rf-c1-2", medicine: "Atorvastatin 20 mg tablets", quantity: "30 tablets", daysAgo: 12, daysSupply: 30, branchId: "b1", prescriptionOnly: true },
      { id: "rf-c1-3", medicine: "Metformin 500 mg tablets", quantity: "60 tablets", daysAgo: 32, daysSupply: 30, branchId: "b1", prescriptionOnly: true },
      { id: "rf-c1-4", medicine: "Vitamin C 500 mg tablets", quantity: "60 tablets", daysAgo: 20, daysSupply: 60, branchId: "b1", prescriptionOnly: false },
    ],
    prescriptions: [
      {
        id: "RX-2058", date: "2026-11-05", doctor: "Dr. A. Gunawardena", clinic: "Colombo South Teaching Hospital", branchId: "b1", via: "whatsapp", status: "under_review",
        medicines: [
          { name: "Losartan potassium 50 mg tablets", dosage: "1 tablet once a day after breakfast", quantity: "30 tablets" },
          { name: "Metformin 500 mg tablets", dosage: "1 tablet twice a day after meals", quantity: "60 tablets" },
        ],
        note: "A pharmacist is checking this prescription. We will message you on WhatsApp when it is ready.",
      },
      {
        id: "RX-2041", date: "2026-10-12", doctor: "Dr. A. Gunawardena", clinic: "Colombo South Teaching Hospital", branchId: "b1", via: "branch", status: "dispensed",
        medicines: [
          { name: "Losartan potassium 50 mg tablets", dosage: "1 tablet once a day after breakfast", quantity: "30 tablets" },
          { name: "Atorvastatin 20 mg tablets", dosage: "1 tablet at night", quantity: "30 tablets" },
        ],
      },
      {
        id: "RX-2017", date: "2026-04-03", doctor: "Dr. L. Rathnayake", clinic: "Kalubowila Teaching Hospital", branchId: "b1", via: "branch", status: "expired",
        medicines: [{ name: "Metformin 500 mg tablets", dosage: "1 tablet twice a day after meals", quantity: "60 tablets" }],
        note: "This prescription has expired. Bring a renewed prescription for further refills.",
      },
    ],
  },

  // Priyanka Herath: regular customer, 3%, home branch Piliyandala
  c2: {
    addresses: [
      { label: "Home", fullName: "Priyanka Herath", phone: "0712345678", addressLine: "17/4 Kesbewa Road", city: "Piliyandala", district: "Colombo", postalCode: "10300", isDefault: true },
    ],
    feedback: [
      { id: "FBA-c2-01", date: "2026-10-15", rating: 4, comment: "Friendly staff at the Piliyandala branch. It would help to have more parking nearby.", branchId: "b2" },
    ],
    openingPoints: { date: "2026-07-01", points: 120 },
    redemptions: [],
    refills: [
      { id: "rf-c2-1", medicine: "Levothyroxine 50 mcg tablets", quantity: "30 tablets", daysAgo: 20, daysSupply: 30, branchId: "b2", prescriptionOnly: true },
      { id: "rf-c2-2", medicine: "Amlodipine 5 mg tablets", quantity: "30 tablets", daysAgo: 27, daysSupply: 30, branchId: "b2", prescriptionOnly: true },
    ],
    prescriptions: [
      {
        id: "RX-2049", date: "2026-10-18", doctor: "Dr. N. Senanayake", clinic: "Asiri Hospital, Kirula Road", branchId: "b2", via: "whatsapp", status: "dispensed",
        medicines: [
          { name: "Levothyroxine 50 mcg tablets", dosage: "1 tablet before breakfast", quantity: "30 tablets" },
          { name: "Amlodipine 5 mg tablets", dosage: "1 tablet once a day", quantity: "30 tablets" },
        ],
      },
    ],
  },

  // Fathima Rizna: new customer, no discount yet
  c3: {
    ...EMPTY,
    addresses: [
      { label: "Home", fullName: "Fathima Rizna", phone: "0759876543", addressLine: "22 Mosque Lane", city: "Kesbewa", district: "Colombo", postalCode: "10240", isDefault: true },
    ],
    refills: [
      { id: "rf-c3-1", medicine: "Omeprazole 20 mg capsules", quantity: "14 capsules", daysAgo: 10, daysSupply: 14, branchId: "b1", prescriptionOnly: true },
    ],
  },
};

/** Account seed for a customer id. Customers who registered on the website start empty. */
export function getAccountSeed(customerId: string): AccountSeed {
  return seeds[customerId] ?? EMPTY;
}
