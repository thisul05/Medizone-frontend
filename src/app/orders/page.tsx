import { Suspense } from "react";
import { GoToAccountOrders } from "@/components/orders/customer/GoToAccountOrders";
import { OrdersRoleSwitch } from "@/components/orders/OrdersRoleSwitch";
import { StaffOrders } from "@/components/orders/StaffOrders";

// Module 4: Prescriptions and orders. Staff see the Orders page; customers go to My Orders inside My Account.
export default function OrdersPage() {
  return (
    <Suspense>
      <OrdersRoleSwitch
        customer={<GoToAccountOrders />}
        staff={<StaffOrders />}
      />
    </Suspense>
  );
}
