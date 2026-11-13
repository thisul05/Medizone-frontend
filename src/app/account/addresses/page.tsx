import type { Metadata } from "next";
import { AddressesView } from "@/components/account/AddressesView";

// Customer account page: RouteGuard renders it only in the browser, after the session is read.
export const instant = false;

export const metadata: Metadata = { title: "My Addresses" };

export default function AddressesPage() {
  return <AddressesView />;
}
