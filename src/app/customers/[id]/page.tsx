import type { Metadata } from "next";
import { Suspense } from "react";
import { CustomerProfile } from "@/components/customers/CustomerProfile";
import { ProfileSkeleton } from "@/components/customers/ProfileSkeleton";

export const metadata: Metadata = {
  title: "Customer profile · Medizone",
};

type Params = Promise<{ id: string }>;

async function ProfileLoader({ params }: { params: Params }) {
  const { id } = await params;
  return <CustomerProfile customerId={decodeURIComponent(id)} />;
}

export default function CustomerProfilePage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileLoader params={params} />
    </Suspense>
  );
}
