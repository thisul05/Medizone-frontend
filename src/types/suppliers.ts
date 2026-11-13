export type PaymentStage = "cash_on_delivery" | "post_dated_cheque" | "credit";

export type PurchaseOrderStatus = "draft" | "sent" | "received" | "partial";

export type ExpiryTagColor = "red" | "orange" | "yellow";

export type ReturnCreditStatus = "to_return" | "sent_to_supplier" | "credit_received";

export type PaymentDueStatus = "due" | "overdue" | "paid";

export interface Supplier {
  id: string;
  name: string;
  repName: string;
  repPhone?: string;
  repEmail?: string;
  distributorName?: string;
  paymentStage: PaymentStage;
  creditDays: number; // 0 for COD, 7-10 for Cheque, 30-35 for Credit
  returnWindowMonths: number; // e.g. 2, 3, 6 months
}

export interface POLineItem {
  id: string;
  productId: string;
  productName: string;
  qty: number;
  receivedQty: number;
  damagedQty: number;
  unitCost: number; // LKR
}

export interface PurchaseOrder {
  id: string; // e.g. "PO-0042"
  supplierId: string;
  supplierName: string;
  branchId: string; // "Branch 1", "Branch 2", etc.
  date: string; // ISO date "2026-11-04"
  status: PurchaseOrderStatus;
  lines: POLineItem[];
  paymentStage: PaymentStage;
  paymentDueDate: string;
  notes?: string;
}

export interface ReturnNote {
  id: string; // e.g. "RN-0003"
  poId?: string;
  supplierId: string;
  supplierName: string;
  date: string;
  reason: "Damaged" | "Short-dated" | "Wrong item";
  items: {
    productName: string;
    qty: number;
    reason: string;
    batchNo?: string;
  }[];
}

export interface ShortExpiryItem {
  id: string;
  productId: string;
  productName: string;
  batchNo: string;
  supplierId: string;
  supplierName: string;
  expiryDate: string; // "2026-12-15"
  monthsRemaining: number;
  expiryTag: ExpiryTagColor;
  returnDeadline: string; // "2026-06-15"
  isDeadlinePassed: boolean;
  quantity: number;
  creditStatus: ReturnCreditStatus;
  selected?: boolean;
}

export interface PaymentDueItem {
  id: string;
  poId: string;
  supplierId: string;
  supplierName: string;
  paymentStage: PaymentStage;
  creditDays: number;
  orderDate: string;
  dueDate: string;
  amount: number; // LKR
  status: PaymentDueStatus;
}

