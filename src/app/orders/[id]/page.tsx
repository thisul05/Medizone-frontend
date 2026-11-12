import { Suspense } from "react";
import { OrderDetail } from "@/components/orders/OrderDetail";
import { OrdersShell } from "@/components/orders/OrdersShell";

type Params = Promise<{ id: string }>;

async function DetailLoader({ params }: { params: Params }) {
  const { id } = await params;
  return <OrderDetail orderId={decodeURIComponent(id)} />;
}

export default function OrderDetailPage({ params }: { params: Params }) {
  return (
    <Suspense>
      <OrdersShell>
        <Suspense>
          <DetailLoader params={params} />
        </Suspense>
      </OrdersShell>
    </Suspense>
  );
}
