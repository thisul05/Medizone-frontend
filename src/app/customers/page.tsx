import type { Metadata } from "next";
import { CustomersView } from "@/components/customers/CustomersView";

export const metadata: Metadata = {
  title: "Customers · Medizone",
};

export default function CustomersPage() {
  return <CustomersView />;
}
