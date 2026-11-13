"use client";

// Customer logout from the website: go to the public homepage, then sign out with the existing
// auth signOut(). Signing out while still on /account would make RouteGuard send the user to
// /login instead, so on protected pages the sign-out waits until the homepage has opened.
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { useToast } from "@/components/shared";
import { useAuth } from "@/lib/auth";
import { isPublicRoute } from "@/lib/routes";

let pending = false;

export function useCustomerLogout() {
  const { signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();

  // Finishes a logout started on a protected page once the homepage is showing.
  useEffect(() => {
    if (pending && pathname === "/") {
      pending = false;
      signOut();
      toast({ tone: "info", title: "You're signed out", description: "Come back soon." });
    }
  }, [pathname, signOut, toast]);

  return useCallback(() => {
    if (pathname === "/" || isPublicRoute(pathname)) {
      signOut();
      toast({ tone: "info", title: "You're signed out", description: "Come back soon." });
      if (pathname !== "/") router.push("/");
      return;
    }
    pending = true;
    router.replace("/");
  }, [pathname, router, signOut, toast]);
}
