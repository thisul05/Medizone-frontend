import { Suspense } from "react";
import { OrderTracking } from "@/components/orders/customer/OrderTracking";
import { OrderDetail } from "@/components/orders/OrderDetail";
import { OrdersRoleSwitch } from "@/components/orders/OrdersRoleSwitch";
import { OrdersShell } from "@/components/orders/OrdersShell";
import { StorefrontShell } from "@/components/storefront/StorefrontShell";

type Params = Promise<{ id: string }>;
type Search = Promise<{ placed?: string }>;

async function DetailLoader({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { id } = await params;
  const { placed } = await searchParams;
  const orderId = decodeURIComponent(id);
  return (
    <OrdersRoleSwitch
      customer={
        <StorefrontShell>
          <OrderTracking orderId={orderId} placed={placed === "1"} />
        </StorefrontShell>
      }
      staff={
        <OrdersShell>
          <OrderDetail orderId={orderId} />
        </OrdersShell>
      }
    />
  );
}

// Staff see the order detail page; a customer sees the tracking page for their own order.
export default function OrderDetailPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  return (
    <Suspense>
      <DetailLoader params={params} searchParams={searchParams} />
    </Suspense>
  );
}
