"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { defaultRouteFor } from "@/components/auth/useRedirectIfSignedIn";

export function HomeView() {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login");
    } else {
      router.replace(defaultRouteFor(user.role));
    }
  }, [user, ready, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f7fa] text-xs text-gray-400">
      Redirecting…
    </div>
  );
}
