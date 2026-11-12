"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth";

/** Customers and staff share the /orders addresses but see different pages. */
export function OrdersRoleSwitch({ customer, staff }: { customer: ReactNode; staff: ReactNode }) {
  const { user, ready } = useAuth();
  if (!ready || !user) return null;
  return <>{user.role === "customer" ? customer : staff}</>;
}
