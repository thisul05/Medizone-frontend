"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Customers keep one "My Orders" list: the one inside My Account (Module 5), which reads these same orders. */
export function GoToAccountOrders() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/account/orders");
  }, [router]);
  return null;
}
