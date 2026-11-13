import type { Metadata } from "next";
import { OrdersView } from "@/components/account/OrdersView";

// Customer account page: RouteGuard renders it only in the browser, after the session is read.
export const instant = false;

export const metadata: Metadata = { title: "My Orders" };

export default function OrdersPage() {
  return <OrdersView />;
}
