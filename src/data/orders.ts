// Module 4 mock data: orders, prescriptions received and POS bills.
// Customers come from Module 5 (cus-01 …) and the demo customer accounts (c1, c2).
// ord-01 to ord-08 are the orders Module 7's deliveries point to (same customer, address and method).
import type { OrderItem, Order, OrderStatus, PosBill, Prescription, StatusStep } from "@/types/orders";

/* ---------- Medicines that staff dispense (unit prices in LKR) ---------- */

export const MEDICINES = [
  { name: "Metformin 500 mg tablets", price: 8 },
  { name: "Atorvastatin 20 mg tablets", price: 28 },
  { name: "Losartan potassium 50 mg tablets", price: 22 },
  { name: "Amlodipine 5 mg tablets", price: 12 },
  { name: "Gliclazide 80 mg tablets", price: 10 },
  { name: "Levothyroxine 50 mcg tablets", price: 9 },
  { name: "Clopidogrel 75 mg tablets", price: 30 },
  { name: "Aspirin 75 mg tablets", price: 3 },
  { name: "Omeprazole 20 mg capsules", price: 15 },
  { name: "Amoxicillin 500 mg capsules", price: 18 },
  { name: "Cetirizine 10 mg tablets", price: 6 },
  { name: "Insulin glargine 100 IU/mL pen", price: 3450 },
  { name: "Paracetamol 500 mg tablets", price: 4 },
  { name: "Vitamin C 500 mg tablets", price: 7 },
];

const price = (name: string) => MEDICINES.find((m) => m.name.startsWith(name))?.price ?? 0;
const fullName = (name: string) => MEDICINES.find((m) => m.name.startsWith(name))?.name ?? name;

/** A medicine with label instructions: med("Metformin", 60, "1 tablet", 2, 30, "after_meals"). */
function med(name: string, qty: number, dose: string, timesPerDay: number, days: number, when: OrderItem["when"]): OrderItem {
  return { name: fullName(name), qty, unitPrice: price(name), needsLabel: true, dose, timesPerDay, days, when };
}

/** An item that needs no label. */
function plain(name: string, qty: number, unitPrice: number, productId?: string): OrderItem {
  return { name, qty, unitPrice, productId, needsLabel: false };
}

/** Status history up to `status`, one step per time given. */
function steps(status: OrderStatus, times: string[], by = "Nimali Perera"): StatusStep[] {
  const last: OrderStatus = status === "out_for_delivery" ? "out_for_delivery" : "collected";
  const flow: OrderStatus[] = ["received", "preparing", "ready", last];
  const upTo = flow.indexOf(status);
  return flow.slice(0, upTo + 1).map((s, i) => ({ status: s, at: times[i] ?? times[times.length - 1], by: i === 0 ? "System" : by }));
}

/* ---------- Orders ---------- */

export const orders: Order[] = [
  // Linked to Module 7 deliveries
  {
    id: "ord-01", source: "whatsapp", customerId: "cus-01", customerName: "Sunil Perera", phone: "0771234567", branchId: "b1",
    receivedAt: "2026-11-04T09:10", status: "ready", history: steps("ready", ["2026-11-04T09:10", "2026-11-04T09:40", "2026-11-04T11:05"]),
    items: [med("Metformin", 60, "1 tablet", 2, 30, "after_meals"), med("Atorvastatin", 30, "1 tablet", 1, 30, "at_night")],
    fulfilment: "own_driver", address: "45/3 Horana Road, Piliyandala", payMethod: "cod", paymentState: "pending",
    discountPercent: 5, deliveryFee: 350, prescriptionId: "RX-1101", notified: true,
  },
  {
    id: "ord-02", source: "online", customerId: "cus-02", customerName: "Kamani Fernando", phone: "0712345678", branchId: "b1",
    receivedAt: "2026-11-03T19:20", status: "out_for_delivery", history: steps("out_for_delivery", ["2026-11-03T19:20", "2026-11-04T08:30", "2026-11-04T09:15", "2026-11-04T10:00"]),
    items: [plain("Glucose test strips, 50 pack", 1, 3900, "p11")],
    fulfilment: "pickme_flash", address: "78 Kalutara Road, Piliyandala", payMethod: "card", paymentState: "paid",
    discountPercent: 3, deliveryFee: 0, notified: true,
  },
  {
    id: "ord-03", source: "whatsapp", customerId: "cus-03", customerName: "Nuwan Rajapaksa", phone: "0754321098", branchId: "b2",
    receivedAt: "2026-11-04T08:45", status: "ready", history: steps("ready", ["2026-11-04T08:45", "2026-11-04T09:20", "2026-11-04T10:10"], "Kasun Fernando"),
    items: [med("Amoxicillin", 21, "1 capsule", 3, 7, "after_meals"), med("Paracetamol", 10, "1 tablet", 3, 3, "after_meals")],
    fulfilment: "own_driver", address: "12/A Moratuwa Road, Piliyandala", payMethod: "cod", paymentState: "pending",
    discountPercent: 0, deliveryFee: 350, prescriptionId: "RX-1102", notified: true,
  },
  {
    id: "ord-04", source: "online", customerId: "cus-04", customerName: "Dilrukshi Silva", phone: "0769876543", branchId: "b2",
    receivedAt: "2026-11-03T21:05", status: "out_for_delivery", history: steps("out_for_delivery", ["2026-11-03T21:05", "2026-11-04T08:40", "2026-11-04T09:30", "2026-11-04T11:00"], "Kasun Fernando"),
    items: [plain("Daily moisturising lotion 200 ml", 1, 1850, "p19"), plain("Face masks, box of 50", 1, 750, "p24")],
    fulfilment: "pickme_flash", address: "23 Koswatta Road, Battaramulla", payMethod: "card", paymentState: "paid",
    discountPercent: 0, deliveryFee: 0, notified: true,
  },
  {
    id: "ord-05", source: "repeat", customerId: "cus-05", customerName: "Pradeep Jayawardena", phone: "0785551234", branchId: "b1",
    receivedAt: "2026-11-04T07:30", status: "out_for_delivery", history: steps("out_for_delivery", ["2026-11-04T07:30", "2026-11-04T08:15", "2026-11-04T09:00", "2026-11-04T10:30"]),
    items: [med("Clopidogrel", 30, "1 tablet", 1, 30, "after_meals"), med("Aspirin", 30, "1 tablet", 1, 30, "after_meals"), med("Atorvastatin", 30, "1 tablet", 1, 30, "at_night")],
    fulfilment: "own_driver", address: "56 High Level Road, Nugegoda", payMethod: "cod", paymentState: "pending",
    discountPercent: 5, deliveryFee: 350, prescriptionId: "RX-1103", notified: true,
  },
  {
    id: "ord-06", source: "online", customerId: "cus-06", customerName: "Sanduni Wijesinghe", phone: "0712223344", branchId: "b3",
    receivedAt: "2026-11-05T10:20", status: "ready", history: steps("ready", ["2026-11-05T10:20", "2026-11-05T10:50", "2026-11-05T11:30"], "Dilini Jayasinghe"),
    items: [plain("Fingertip pulse oximeter", 1, 4500, "p09")],
    fulfilment: "pickme_flash", address: "89 Nawala Road, Nawala", payMethod: "bank_transfer", paymentState: "paid",
    discountPercent: 0, deliveryFee: 0, notified: false,
  },
  {
    id: "ord-07", source: "repeat", customerId: "cus-07", customerName: "Lasith Mendis", phone: "0774433221", branchId: "b1",
    receivedAt: "2026-11-02T08:00", status: "out_for_delivery", history: steps("out_for_delivery", ["2026-11-02T08:00", "2026-11-02T09:00", "2026-11-02T10:00", "2026-11-03T09:30"]),
    items: [med("Gliclazide", 7, "1 tablet", 1, 7, "before_meals"), med("Metformin", 14, "1 tablet", 2, 7, "after_meals")],
    fulfilment: "own_driver", address: "34 Maharagama Road, Maharagama", payMethod: "cod", paymentState: "paid",
    discountPercent: 3, deliveryFee: 350, prescriptionId: "RX-1104", notified: true,
  },
  {
    id: "ord-08", source: "whatsapp", customerId: "cus-08", customerName: "Chamari Athapaththu", phone: "0769988776", branchId: "b4",
    receivedAt: "2026-11-04T12:10", status: "ready", history: steps("ready", ["2026-11-04T12:10", "2026-11-04T12:40", "2026-11-04T13:30"], "Ruwan Silva"),
    items: [med("Omeprazole", 14, "1 capsule", 1, 14, "before_meals")],
    fulfilment: "pickme_flash", address: "67 Station Road, Piliyandala", payMethod: "bank_transfer", paymentState: "pending",
    discountPercent: 0, deliveryFee: 0, prescriptionId: "RX-1105", notified: false,
  },

  // Collected at a branch
  {
    id: "ord-09", source: "whatsapp", customerId: "cus-09", customerName: "Mohamed Rizwan", phone: "0775678901", branchId: "b3",
    receivedAt: "2026-11-06T10:15", status: "received", history: steps("received", ["2026-11-06T10:15"]),
    items: [med("Insulin glargine", 2, "18 units", 1, 30, "at_night")],
    fulfilment: "collect", readyBy: "2026-11-06T16:00", payMethod: "pay_at_counter", paymentState: "pending",
    discountPercent: 3, deliveryFee: 0, prescriptionId: "RX-1106", notified: false, note: "Keep the pens in the fridge until collection.",
  },
  {
    id: "ord-10", source: "online", customerId: "cus-10", customerName: "Tharushi Gunasekara", phone: "0706789012", branchId: "b2",
    receivedAt: "2026-11-06T10:42", status: "received", history: steps("received", ["2026-11-06T10:42"]),
    items: [plain("Vidafast nutrition powder 400 g", 1, 5830, "p01"), plain("Baby diaper rash cream 50 g", 1, 950, "p20")],
    fulfilment: "collect", readyBy: "2026-11-06T13:00", payMethod: "card", paymentState: "paid",
    discountPercent: 0, deliveryFee: 0, notified: false,
  },
  {
    id: "ord-11", source: "whatsapp", customerId: "cus-11", customerName: "Ruwan Bandara", phone: "0787890123", branchId: "b4",
    receivedAt: "2026-11-06T09:30", status: "preparing", history: steps("preparing", ["2026-11-06T09:30", "2026-11-06T09:48"], "Ruwan Silva"),
    items: [med("Losartan", 30, "1 tablet", 1, 30, "after_meals"), med("Metformin", 60, "1 tablet", 2, 30, "after_meals"), plain("Paracetamol 500 mg tablets", 10, 4)],
    fulfilment: "collect", readyBy: "2026-11-06T12:00", payMethod: "pay_at_counter", paymentState: "pending",
    discountPercent: 5, deliveryFee: 0, prescriptionId: "RX-1107", notified: false, note: "Customer will come around 12 noon.",
  },
  {
    id: "ord-12", source: "branch", customerId: "cus-12", customerName: "Fathima Nazeer", phone: "0718901234", branchId: "b3",
    receivedAt: "2026-11-05T16:20", status: "ready", history: steps("ready", ["2026-11-05T16:20", "2026-11-06T08:30", "2026-11-06T09:40"], "Dilini Jayasinghe"),
    items: [med("Levothyroxine", 30, "1 tablet", 1, 30, "before_meals")],
    fulfilment: "collect", payMethod: "pay_at_counter", paymentState: "pending",
    discountPercent: 0, deliveryFee: 0, prescriptionId: "RX-1108", notified: true,
  },
  {
    id: "ord-13", source: "whatsapp", customerId: "cus-14", customerName: "Isuru Dissanayake", phone: "0765544332", branchId: "b1",
    receivedAt: "2026-11-05T08:50", status: "collected", history: steps("collected", ["2026-11-05T08:50", "2026-11-05T09:10", "2026-11-05T09:45", "2026-11-05T17:20"]),
    items: [med("Omeprazole", 14, "1 capsule", 1, 14, "before_meals")],
    fulfilment: "collect", payMethod: "cash", paymentState: "paid",
    discountPercent: 0, deliveryFee: 0, prescriptionId: "RX-1109", notified: true,
  },
  {
    id: "ord-14", source: "repeat", customerId: "cus-02", customerName: "Kamani Fernando", phone: "0712345678", branchId: "b1",
    receivedAt: "2026-11-06T07:00", status: "received", history: steps("received", ["2026-11-06T07:00"]),
    items: [med("Losartan", 30, "1 tablet", 1, 30, "after_meals"), med("Amlodipine", 30, "1 tablet", 1, 30, "after_meals")],
    fulfilment: "collect", readyBy: "2026-11-06T17:00", payMethod: "pay_at_counter", paymentState: "pending",
    discountPercent: 3, deliveryFee: 0, prescriptionId: "RX-1110", notified: false,
  },

  // Placed on the website by the demo customer accounts (My Orders)
  {
    id: "ord-15", source: "online", customerId: "c1", customerName: "Anura Senanayake", phone: "0771234567", branchId: "b1",
    receivedAt: "2026-11-05T20:52", status: "preparing", history: steps("preparing", ["2026-11-05T20:52", "2026-11-06T08:30"]),
    items: [plain("Vidafast nutrition powder 400 g", 1, 5830, "p01"), plain("Digital thermometer", 1, 1250, "p10"), plain("Baby diaper rash cream 50 g", 1, 950, "p20")],
    fulfilment: "own_driver", address: "45/2 Temple Road, Piliyandala", payMethod: "card", paymentState: "paid",
    discountPercent: 5, deliveryFee: 350, notified: false,
  },
  {
    id: "ord-16", source: "online", customerId: "c1", customerName: "Anura Senanayake", phone: "0771234567", branchId: "b1",
    receivedAt: "2026-10-28T18:10", status: "collected", history: steps("collected", ["2026-10-28T18:10", "2026-10-29T08:30", "2026-10-29T09:15", "2026-10-29T16:40"]),
    items: [plain("Face masks, box of 50", 1, 750, "p24"), plain("Paracetamol 500 mg tablets, strip of 10", 2, 60, "p14")],
    fulfilment: "collect", payMethod: "pay_at_counter", paymentState: "paid",
    discountPercent: 5, deliveryFee: 0, notified: true,
  },
  {
    id: "ord-17", source: "online", customerId: "c1", customerName: "Anura Senanayake", phone: "0771234567", branchId: "b1",
    receivedAt: "2026-10-20T11:30", status: "out_for_delivery", history: steps("out_for_delivery", ["2026-10-20T11:30", "2026-10-20T13:00", "2026-10-20T14:10", "2026-10-21T09:40"]),
    items: [plain("OMRON HEM-7121J blood pressure monitor", 1, 15500, "p05")],
    fulfilment: "own_driver", address: "45/2 Temple Road, Piliyandala", payMethod: "cod", paymentState: "paid",
    discountPercent: 5, deliveryFee: 350, notified: true,
  },
  {
    id: "ord-18", source: "online", customerId: "c2", customerName: "Priyanka Herath", phone: "0712345678", branchId: "b2",
    receivedAt: "2026-11-05T15:05", status: "ready", history: steps("ready", ["2026-11-05T15:05", "2026-11-06T08:45", "2026-11-06T09:20"], "Kasun Fernando"),
    items: [plain("Beautine hair, skin and nail supplement", 1, 3500, "p17")],
    fulfilment: "collect", payMethod: "pay_at_counter", paymentState: "pending",
    discountPercent: 3, deliveryFee: 0, notified: true,
  },
];

/* ---------- Prescriptions received ---------- */

const rx = (p: Omit<Prescription, "imageUrl">): Prescription => ({ ...p, imageUrl: `/prescriptions/${p.id.toLowerCase()}.jpg` });

export const prescriptions: Prescription[] = [
  rx({ id: "RX-1110", customerId: "cus-02", customerName: "Kamani Fernando", phone: "0712345678", branchId: "b1", doctor: "Dr. S. Wickramaratne", clinic: "Lanka Hospitals, Colombo 5", receivedOn: "2026-11-06", via: "repeat", orderId: "ord-14", repeat: { every: "month", lastDate: "2026-11-06", nextDate: "2026-12-06" } }),
  rx({ id: "RX-1107", customerId: "cus-11", customerName: "Ruwan Bandara", phone: "0787890123", branchId: "b4", doctor: "Dr. L. Rathnayake", clinic: "Kalubowila Teaching Hospital", receivedOn: "2026-11-06", via: "whatsapp", orderId: "ord-11" }),
  rx({ id: "RX-1106", customerId: "cus-09", customerName: "Mohamed Rizwan", phone: "0775678901", branchId: "b3", doctor: "Dr. F. Marikar", clinic: "Durdans Hospital", receivedOn: "2026-11-06", via: "whatsapp", orderId: "ord-09" }),
  rx({ id: "RX-1108", customerId: "cus-12", customerName: "Fathima Nazeer", phone: "0718901234", branchId: "b3", doctor: "Dr. N. Senanayake", clinic: "Asiri Hospital, Kirula Road", receivedOn: "2026-11-05", via: "branch", orderId: "ord-12" }),
  rx({ id: "RX-1109", customerId: "cus-14", customerName: "Isuru Dissanayake", phone: "0765544332", branchId: "b1", doctor: "Dr. P. Kodikara", clinic: "Piliyandala Medical Centre", receivedOn: "2026-11-05", via: "whatsapp", orderId: "ord-13" }),
  rx({ id: "RX-1101", customerId: "cus-01", customerName: "Sunil Perera", phone: "0771234567", branchId: "b1", doctor: "Dr. A. Gunawardena", clinic: "Colombo South Teaching Hospital", receivedOn: "2026-11-04", via: "whatsapp", orderId: "ord-01" }),
  rx({ id: "RX-1102", customerId: "cus-03", customerName: "Nuwan Rajapaksa", phone: "0754321098", branchId: "b2", doctor: "Dr. P. Kodikara", clinic: "Piliyandala Medical Centre", receivedOn: "2026-11-04", via: "whatsapp", orderId: "ord-03" }),
  rx({ id: "RX-1103", customerId: "cus-05", customerName: "Pradeep Jayawardena", phone: "0785551234", branchId: "b1", doctor: "Dr. R. Abeysekera", clinic: "Sri Jayewardenepura General Hospital", receivedOn: "2026-11-04", via: "repeat", orderId: "ord-05", repeat: { every: "month", lastDate: "2026-11-04", nextDate: "2026-12-04" } }),
  rx({ id: "RX-1105", customerId: "cus-08", customerName: "Chamari Athapaththu", phone: "0769988776", branchId: "b4", doctor: "Dr. M. Fernando", clinic: "Nawaloka Hospital", receivedOn: "2026-11-04", via: "whatsapp", orderId: "ord-08" }),
  rx({ id: "RX-1104", customerId: "cus-07", customerName: "Lasith Mendis", phone: "0774433221", branchId: "b1", doctor: "Dr. K. Jayasuriya", clinic: "Colombo South Teaching Hospital", receivedOn: "2026-11-02", via: "repeat", orderId: "ord-07", repeat: { every: "week", lastDate: "2026-11-02", nextDate: "2026-11-09" } }),
  rx({ id: "RX-1099", customerId: "cus-13", customerName: "Shanthi Rajendran", phone: "0779988776", branchId: "b4", doctor: "Dr. V. Shanmugam", clinic: "Kings Hospital, Colombo 5", receivedOn: "2026-10-02", via: "repeat", repeat: { every: "month", lastDate: "2026-10-02", nextDate: "2026-11-02", paused: true } }),
];

/* ---------- Bills from the existing POS system (for labels) ---------- */

export const posBills: PosBill[] = [
  {
    id: "POS-30871", branchId: "b1", payMethod: "cash", customerName: "Walk-in customer", date: "2026-11-06T09:20",
    items: [med("Amoxicillin", 21, "1 capsule", 3, 7, "after_meals"), med("Cetirizine", 10, "1 tablet", 1, 10, "at_night"), plain("Baby wipes, 80 pack", 1, 450)],
  },
  {
    id: "POS-30866", branchId: "b1", payMethod: "card", customerName: "Lasith Mendis", date: "2026-11-06T08:58",
    items: [med("Gliclazide", 30, "1 tablet", 1, 30, "before_meals"), plain("Glucose test strips, 50 pack", 1, 3900)],
  },
  {
    id: "POS-30860", branchId: "b1", payMethod: "cash", customerName: "Walk-in customer", date: "2026-11-06T08:41",
    items: [plain("Paracetamol 500 mg tablets, strip of 10", 1, 60), plain("Oral rehydration salts, 5 sachets", 1, 250)],
  },
];
