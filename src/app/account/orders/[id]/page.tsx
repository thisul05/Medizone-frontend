import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderDetailView } from "@/components/account/OrderDetailView";

export const instant = false;

export const metadata: Metadata = { title: "Order details" };

type Params = Promise<{ id: string }>;

async function DetailLoader({ params }: { params: Params }) {
  const { id } = await params;
  return <OrderDetailView orderId={decodeURIComponent(id)} />;
}

export default function AccountOrderDetailPage({ params }: { params: Params }) {
  return (
    <Suspense>
      <DetailLoader params={params} />
    </Suspense>
  );
}
