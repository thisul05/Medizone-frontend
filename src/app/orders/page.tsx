import { Suspense } from "react";
import { MyOrders } from "@/components/orders/customer/MyOrders";
import { OrdersRoleSwitch } from "@/components/orders/OrdersRoleSwitch";
import { StaffOrders } from "@/components/orders/StaffOrders";
import { StorefrontShell } from "@/components/storefront/StorefrontShell";

// Module 4: Prescriptions and orders. Staff see the Orders page; customers see My orders.
export default function OrdersPage() {
  return (
    <Suspense>
      <OrdersRoleSwitch
        customer={
          <StorefrontShell>
            <MyOrders />
          </StorefrontShell>
        }
        staff={<StaffOrders />}
      />
    </Suspense>
  );
}
