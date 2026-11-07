// Demo accounts for the prototype. Plain-text passwords are intentional: this is not real security.
// All names are fictional except the owner. Module 5 reuses customer ids c1 to c3.
// Everyone signs in on the same /login form. The full list is in demo_details.md at the project root.
import type { UserAccount } from "@/types/auth";
import type { BranchId, Role } from "@/types/roles";

type StaffRow = [string, string, Role, BranchId | "all", string, string, string, string];

const staffRows: StaffRow[] = [
  ["Mr. Yohan", "Owner", "owner", "all", "yohan", "yohan@medizone.lk", "MZ-001", "Owner@2026"],
  ["Nimali Perera", "Senior pharmacist assistant", "senior_pharmacist", "b1", "senior.b1", "nimali@medizone.lk", "MZ-011", "Senior@2026"],
  ["Kasun Fernando", "Senior pharmacist assistant", "senior_pharmacist", "b2", "senior.b2", "kasun@medizone.lk", "MZ-012", "Senior@2026"],
  ["Dilini Jayasinghe", "Senior pharmacist assistant", "senior_pharmacist", "b3", "senior.b3", "dilini@medizone.lk", "MZ-013", "Senior@2026"],
  ["Ruwan Silva", "Senior pharmacist assistant", "senior_pharmacist", "b4", "senior.b4", "ruwan@medizone.lk", "MZ-014", "Senior@2026"],
  ["Tharindu Wickramasinghe", "Pharmacist assistant", "pharmacist_assistant", "b1", "assistant.b1", "tharindu@medizone.lk", "MZ-021", "Assist@2026"],
  ["Sanduni Rathnayake", "Pharmacist assistant", "pharmacist_assistant", "b2", "assistant.b2", "sanduni@medizone.lk", "MZ-022", "Assist@2026"],
  ["Hasini Gunawardena", "Trainee pharmacist assistant", "pharmacist_assistant", "b3", "trainee.b3", "hasini@medizone.lk", "MZ-031", "Trainee@2026"],
  ["Chamara Bandara", "Purchasing manager", "purchasing_manager", "all", "purchasing", "chamara@medizone.lk", "MZ-041", "Purchase@2026"],
  ["Ishara Dissanayake", "Accountant clerk", "accountant", "all", "accounts", "ishara@medizone.lk", "MZ-051", "Accounts@2026"],
  ["Mahesh Kumara", "Part-time accountant", "accountant", "all", "accounts.pt", "mahesh@medizone.lk", "MZ-052", "PartTime@2026"],
];

type CustomerRow = [string, string, BranchId, string, string, string, string];

const customerRows: CustomerRow[] = [
  ["Anura Senanayake", "Customer (regular, 5%)", "b1", "0771234567", "anura@example.com", "c1", "Customer@123"],
  ["Priyanka Herath", "Customer (regular, 3%)", "b2", "0712345678", "priyanka@example.com", "c2", "Customer@123"],
  ["Fathima Rizna", "Customer (new)", "b1", "0759876543", "fathima@example.com", "c3", "Customer@123"],
];

const SEEDED_AT = "2026-01-15T09:00:00.000Z";

export const demoAccounts: UserAccount[] = [
  ...staffRows.map(([name, jobTitle, role, branchId, username, email, staffId, password]) => ({
    id: `u-${staffId.toLowerCase()}`,
    name, jobTitle, role, branchId, username, email, staffId, password,
    createdAt: SEEDED_AT,
  })),
  ...customerRows.map(([name, jobTitle, branchId, phone, email, customerId, password]) => ({
    id: `u-${customerId}`,
    name, jobTitle, role: "customer" as const, branchId, phone, email, customerId, password,
    createdAt: SEEDED_AT,
  })),
];
