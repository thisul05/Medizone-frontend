import type { Metadata } from "next";
import { OverviewView } from "@/components/account/OverviewView";

// Customer account page: RouteGuard renders it only in the browser, after the session is read.
export const instant = false;

export const metadata: Metadata = { title: "My Account" };

export default function OverviewPage() {
  return <OverviewView />;
}
