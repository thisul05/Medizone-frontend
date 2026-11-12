"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { canOpen } from "@/lib/access";
import { useAuth } from "@/lib/auth";
import { isSafeNext, moduleForPath } from "@/lib/routes";
import type { Role } from "@/types/roles";

/** Default landing route after sign-in: owner goes to /admin, customers go to /shop, staff go to /home. */
export function defaultRouteFor(role: Role): string {
  if (role === "owner") return "/admin";
  return role === "customer" ? "/shop" : "/home";
}

/** Where to go after sign-in: `next` when safe and appropriate for the role, otherwise /shop (customers) or /home (staff). */
export function destinationFor(role: Role, next: string | null): string {
  const fallback = defaultRouteFor(role);
  if (!isSafeNext(next)) return fallback;
  const path = next.split(/[?#]/)[0];
  if (path === "/login" || path === "/register") return fallback;
  if (role === "customer" && (path === "/profile" || path === "/home")) return fallback;
  const mod = moduleForPath(path);
  if (mod && !canOpen(role, mod)) return fallback;
  return next;
}

/**
 * Sends signed-in users away from /login and /register.
 * Set `handledRef.current = true` before signing in so the form can choose the destination itself.
 */
export function useRedirectIfSignedIn() {
  const { user, ready } = useAuth();
  const router = useRouter();
  const handledRef = useRef(false);

  useEffect(() => {
    if (ready && user && !handledRef.current) router.replace(defaultRouteFor(user.role));
  }, [ready, user, router]);

  return handledRef;
}
