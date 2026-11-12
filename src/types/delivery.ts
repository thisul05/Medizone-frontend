export type DeliveryMethod = "own_driver" | "pickme_flash";
export type DeliveryStatus = "pending" | "out" | "delivered";
export type ReturnStatus = "requested" | "approved" | "rejected";
export type WarrantyStatus =
  | "received"
  | "sent_to_supplier"
  | "under_repair"
  | "replaced"
  | "returned";

export interface Delivery {
  id: string;
  orderId: string;
  branchId: string;
  customerName: string;
  phone: string;
  address: string;
  method: DeliveryMethod;
  status: DeliveryStatus;
  codAmount: number;
  codCollected: boolean;
  date: string;
}

export interface CustomerReturn {
  id: string;
  customerId: string;
  customerName: string;
  phone: string;
  productName: string;
  reason: string;
  status: ReturnStatus;
  requestedAt: string;
  branchId: string;
}

export interface WarrantyClaim {
  id: string;
  customerId: string;
  customerName: string;
  productName: string;
  serialNo: string;
  purchaseDate: string;
  warrantyMonths: number;
  status: WarrantyStatus;
  loanDevice: boolean;
  branchId: string;
}
