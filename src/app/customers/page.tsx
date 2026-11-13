import type { Metadata } from "next";
import { CustomersView } from "@/components/customers/CustomersView";

// Signed-in page: RouteGuard renders it only in the browser, after the session is read.
export const instant = false;

export const metadata: Metadata = {
  title: "Customers · Medizone",
};

export default function CustomersPage() {
  return <CustomersView />;
}
