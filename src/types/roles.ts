// Roles, branches and modules shared by every module. Keep the six role ids stable:
// other modules depend on them. The real job title is a separate field on the account.
import type { IconName } from "@/components/shared/Icon";

export type Role =
  | "owner"
  | "senior_pharmacist"
  | "pharmacist_assistant"
  | "purchasing_manager"
  | "accountant"
  | "customer";

export type BranchId = "b1" | "b2" | "b3" | "b4" | "b5";

export type ModuleId =
  | "admin"
  | "inventory"
  | "orders"
  | "customers"
  | "suppliers"
  | "delivery"
  | "billing"
  | "staff"
  | "reports";

export const ROLE_LABELS: Record<Role, string> = {
  owner: "Owner",
  senior_pharmacist: "Senior pharmacist assistant",
  pharmacist_assistant: "Pharmacist assistant",
  purchasing_manager: "Purchasing manager",
  accountant: "Accountant",
  customer: "Customer",
};

export const STAFF_ROLES: Role[] = [
  "owner",
  "senior_pharmacist",
  "pharmacist_assistant",
  "purchasing_manager",
  "accountant",
];

// "*" means every module (exclusive to owner/admin).
export const access: Record<Role, (ModuleId | "*")[]> = {
  owner: ["*"],
  senior_pharmacist: [
    "inventory",
    "orders",
    "customers",
    "suppliers",
    "delivery",
    "billing",
    "staff",
    "reports",
  ],
  pharmacist_assistant: ["orders", "customers", "delivery", "billing"],
  purchasing_manager: ["inventory", "suppliers"],
  accountant: ["billing", "staff", "reports"],
  customer: ["orders"],
};

export interface ModuleInfo {
  id: ModuleId;
  label: string;
  href: string;
  icon: IconName;
  description: string;
}

export const MODULES: ModuleInfo[] = [
  { id: "admin", label: "Dashboard", href: "/admin", icon: "dashboard", description: "Sales, stock and branch performance at a glance." },
  { id: "inventory", label: "Inventory", href: "/inventory", icon: "package", description: "Products, stock levels, batches and expiry dates." },
  { id: "orders", label: "Prescriptions", href: "/orders", icon: "file-text", description: "Prescriptions and customer orders from receipt to collection." },
  { id: "customers", label: "Customers", href: "/customers", icon: "users", description: "Customer records, regular-customer discounts and loyalty points." },
  { id: "suppliers", label: "Suppliers", href: "/suppliers", icon: "building", description: "Suppliers, purchase orders and goods received." },
  { id: "delivery", label: "Delivery & warranty", href: "/delivery", icon: "truck", description: "Home deliveries, returns and device warranty claims." },
  { id: "billing", label: "Billing", href: "/billing", icon: "receipt", description: "Bills, payments and daily cash-up for each branch." },
  { id: "staff", label: "Staff & payroll", href: "/staff", icon: "id-card", description: "Staff records, attendance and monthly payroll." },
  { id: "reports", label: "Reports", href: "/reports", icon: "chart", description: "Sales, stock and demand reports with forecasts." },
];
