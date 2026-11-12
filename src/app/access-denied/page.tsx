import type { Metadata } from "next";
import { Suspense } from "react";
import { AccessDeniedView } from "@/components/home/AccessDeniedView";

// Signed-in page: RouteGuard renders it only in the browser, after the session is read.
export const instant = false;

export const metadata: Metadata = { title: "No access" };

export default function AccessDeniedPage() {
  return (
    <Suspense>
      <AccessDeniedView />
    </Suspense>
  );
}
