export type PayMethod = "cash" | "card" | "bank_transfer" | "cod" | "payhere";

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  loyaltyPoints: number;
  discountPercent: 0 | 3 | 5;
}

export interface BillLine {
  productId: string;
  productName: string;
  qty: number;
  unitPrice: number;
}

export interface Bill {
  id: string;
  branchId: string;
  branchName?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  date: string;
  lines: BillLine[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
  method: PayMethod;
  pointsEarned: number;
}

export interface BillTotals {
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
  pointsEarned: number;
}

/**
 * Pure calculation logic for bill totals, discounts, and loyalty points.
 * 1 loyalty point is awarded for every 100 LKR spent.
 */
export function billTotals(lines: BillLine[], discountPercent: number): BillTotals {
  const subtotal = lines.reduce((sum, line) => sum + line.qty * line.unitPrice, 0);
  const discountAmount = Number(((subtotal * discountPercent) / 100).toFixed(2));
  const total = Number((subtotal - discountAmount).toFixed(2));
  const pointsEarned = Math.floor(total / 100);

  return {
    subtotal: Number(subtotal.toFixed(2)),
    discountPercent,
    discountAmount,
    total,
    pointsEarned,
  };
}

// Module 3: Linked Catalog Products
export const mockCatalogProducts: ProductItem[] = [
  { id: "P001", name: "Panadol Extra 500mg (10s)", category: "Analgesics", price: 50.0, stock: 240, unit: "Strip" },
  { id: "P002", name: "Amoxicillin 250mg Capsules", category: "Antibiotics", price: 450.0, stock: 85, unit: "Box" },
  { id: "P003", name: "Omron Blood Pressure Monitor HEM-7120", category: "Medical Devices", price: 12500.0, stock: 12, unit: "Unit" },
  { id: "P004", name: "Accu-Chek Active Glucose Strips 50s", category: "Diagnostics", price: 4200.0, stock: 35, unit: "Pack" },
  { id: "P005", name: "Cebion Vitamin C 1000mg Effervescent", category: "Vitamins & Supplements", price: 850.0, stock: 110, unit: "Tube" },
  { id: "P006", name: "Metformin 500mg Tablets (100s)", category: "Diabetes", price: 650.0, stock: 95, unit: "Box" },
  { id: "P007", name: "Atorvastatin 20mg (30s)", category: "Cardiovascular", price: 1200.0, stock: 50, unit: "Box" },
  { id: "P008", name: "Cetirizine 10mg Tablets (10s)", category: "Antihistamines", price: 180.0, stock: 160, unit: "Strip" },
  { id: "P009", name: "Omeprazole 20mg Capsules (30s)", category: "Gastrointestinal", price: 540.0, stock: 75, unit: "Box" },
  { id: "P010", name: "Disinfectant Surgical Face Masks (50s)", category: "Personal Care", price: 750.0, stock: 200, unit: "Box" },
  { id: "P011", name: "Salbutamol Inhaler 100mcg", category: "Respiratory", price: 920.0, stock: 30, unit: "Inhaler" },
  { id: "P012", name: "Dettol Antiseptic Liquid 250ml", category: "First Aid", price: 480.0, stock: 90, unit: "Bottle" },
];

// Module 5: Linked Customers with Regular Loyalty Discounts (3% or 5%)
export const mockCustomersList: CustomerProfile[] = [
  { id: "CUST-01", name: "Sunil Perera", phone: "0712345678", loyaltyPoints: 245, discountPercent: 5 },
  { id: "CUST-02", name: "Nimali Silva", phone: "0779876543", loyaltyPoints: 120, discountPercent: 3 },
  { id: "CUST-03", name: "Kamal Gunaratne", phone: "0751122334", loyaltyPoints: 380, discountPercent: 5 },
  { id: "CUST-04", name: "Priya Fernando", phone: "0788899001", loyaltyPoints: 85, discountPercent: 3 },
  { id: "CUST-05", name: "Anura Wickramasinghe", phone: "0725566778", loyaltyPoints: 490, discountPercent: 5 },
  { id: "CUST-06", name: "Dilani Jayawardena", phone: "0764433221", loyaltyPoints: 60, discountPercent: 3 },
];

// Initial Mock Bills: 10 sample bills for daily reconciliation and invoice archives
export const initialBills: Bill[] = [
  {
    id: "BILL-1001",
    branchId: "b1",
    branchName: "Colombo Main Branch",
    customerId: "CUST-01",
    customerName: "Sunil Perera",
    customerPhone: "0712345678",
    date: "2026-11-12",
    lines: [
      { productId: "P001", productName: "Panadol Extra 500mg (10s)", qty: 2, unitPrice: 50.0 },
      { productId: "P002", productName: "Amoxicillin 250mg Capsules", qty: 1, unitPrice: 450.0 },
    ],
    subtotal: 550.0,
    discountPercent: 5,
    discountAmount: 27.5,
    total: 522.5,
    method: "cash",
    pointsEarned: 5,
  },
  {
    id: "BILL-1002",
    branchId: "b1",
    branchName: "Colombo Main Branch",
    customerId: "CUST-02",
    customerName: "Nimali Silva",
    customerPhone: "0779876543",
    date: "2026-11-12",
    lines: [
      { productId: "P004", productName: "Accu-Chek Active Glucose Strips 50s", qty: 1, unitPrice: 4200.0 },
      { productId: "P006", productName: "Metformin 500mg Tablets (100s)", qty: 2, unitPrice: 650.0 },
    ],
    subtotal: 5500.0,
    discountPercent: 3,
    discountAmount: 165.0,
    total: 5335.0,
    method: "card",
    pointsEarned: 53,
  },
  {
    id: "BILL-1003",
    branchId: "b1",
    branchName: "Colombo Main Branch",
    customerId: "CUST-03",
    customerName: "Kamal Gunaratne",
    customerPhone: "0751122334",
    date: "2026-11-12",
    lines: [
      { productId: "P003", productName: "Omron Blood Pressure Monitor HEM-7120", qty: 1, unitPrice: 12500.0 },
      { productId: "P005", productName: "Cebion Vitamin C 1000mg Effervescent", qty: 2, unitPrice: 850.0 },
    ],
    subtotal: 14200.0,
    discountPercent: 5,
    discountAmount: 710.0,
    total: 13490.0,
    method: "payhere",
    pointsEarned: 134,
  },
  {
    id: "BILL-1004",
    branchId: "b2",
    branchName: "Kandy Healthcare Branch",
    customerId: "CUST-04",
    customerName: "Priya Fernando",
    customerPhone: "0788899001",
    date: "2026-11-12",
    lines: [
      { productId: "P007", productName: "Atorvastatin 20mg (30s)", qty: 2, unitPrice: 1200.0 },
      { productId: "P009", productName: "Omeprazole 20mg Capsules (30s)", qty: 1, unitPrice: 540.0 },
    ],
    subtotal: 2940.0,
    discountPercent: 3,
    discountAmount: 88.2,
    total: 2851.8,
    method: "bank_transfer",
    pointsEarned: 28,
  },
  {
    id: "BILL-1005",
    branchId: "b1",
    branchName: "Colombo Main Branch",
    customerId: "CUST-05",
    customerName: "Anura Wickramasinghe",
    customerPhone: "0725566778",
    date: "2026-11-12",
    lines: [
      { productId: "P011", productName: "Salbutamol Inhaler 100mcg", qty: 2, unitPrice: 920.0 },
      { productId: "P010", productName: "Disinfectant Surgical Face Masks (50s)", qty: 2, unitPrice: 750.0 },
    ],
    subtotal: 3340.0,
    discountPercent: 5,
    discountAmount: 167.0,
    total: 3173.0,
    method: "cod",
    pointsEarned: 31,
  },
  {
    id: "BILL-1006",
    branchId: "b1",
    branchName: "Colombo Main Branch",
    customerName: "Walk-in Customer",
    date: "2026-11-12",
    lines: [
      { productId: "P001", productName: "Panadol Extra 500mg (10s)", qty: 4, unitPrice: 50.0 },
      { productId: "P008", productName: "Cetirizine 10mg Tablets (10s)", qty: 2, unitPrice: 180.0 },
    ],
    subtotal: 560.0,
    discountPercent: 0,
    discountAmount: 0.0,
    total: 560.0,
    method: "cash",
    pointsEarned: 5,
  },
  {
    id: "BILL-1007",
    branchId: "b2",
    branchName: "Kandy Healthcare Branch",
    customerId: "CUST-06",
    customerName: "Dilani Jayawardena",
    customerPhone: "0764433221",
    date: "2026-11-12",
    lines: [
      { productId: "P005", productName: "Cebion Vitamin C 1000mg Effervescent", qty: 3, unitPrice: 850.0 },
      { productId: "P012", productName: "Dettol Antiseptic Liquid 250ml", qty: 1, unitPrice: 480.0 },
    ],
    subtotal: 3030.0,
    discountPercent: 3,
    discountAmount: 90.9,
    total: 2939.1,
    method: "card",
    pointsEarned: 29,
  },
  {
    id: "BILL-1008",
    branchId: "b1",
    branchName: "Colombo Main Branch",
    customerName: "Walk-in Customer",
    date: "2026-11-12",
    lines: [
      { productId: "P002", productName: "Amoxicillin 250mg Capsules", qty: 2, unitPrice: 450.0 },
      { productId: "P009", productName: "Omeprazole 20mg Capsules (30s)", qty: 2, unitPrice: 540.0 },
    ],
    subtotal: 1980.0,
    discountPercent: 0,
    discountAmount: 0.0,
    total: 1980.0,
    method: "payhere",
    pointsEarned: 19,
  },
  {
    id: "BILL-1009",
    branchId: "b1",
    branchName: "Colombo Main Branch",
    customerName: "Walk-in Customer",
    date: "2026-11-12",
    lines: [
      { productId: "P010", productName: "Disinfectant Surgical Face Masks (50s)", qty: 1, unitPrice: 750.0 },
      { productId: "P012", productName: "Dettol Antiseptic Liquid 250ml", qty: 2, unitPrice: 480.0 },
    ],
    subtotal: 1710.0,
    discountPercent: 0,
    discountAmount: 0.0,
    total: 1710.0,
    method: "cash",
    pointsEarned: 17,
  },
  {
    id: "BILL-1010",
    branchId: "b2",
    branchName: "Kandy Healthcare Branch",
    customerId: "CUST-01",
    customerName: "Sunil Perera",
    customerPhone: "0712345678",
    date: "2026-11-12",
    lines: [
      { productId: "P006", productName: "Metformin 500mg Tablets (100s)", qty: 3, unitPrice: 650.0 },
      { productId: "P007", productName: "Atorvastatin 20mg (30s)", qty: 1, unitPrice: 1200.0 },
    ],
    subtotal: 3150.0,
    discountPercent: 5,
    discountAmount: 157.5,
    total: 2992.5,
    method: "bank_transfer",
    pointsEarned: 29,
  },
];
