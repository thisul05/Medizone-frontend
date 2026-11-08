"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { canOpen } from "@/lib/access";
import { useAuth } from "@/lib/auth";
import { isSafeNext, moduleForPath } from "@/lib/routes";
import type { Role } from "@/types/roles";

/** Where to go after sign-in: `next` when it is safe and the role may open it, otherwise /home. */
export function destinationFor(role: Role, next: string | null): string {
  if (!isSafeNext(next)) return "/home";
  const path = next.split(/[?#]/)[0];
  if (path === "/login" || path === "/register") return "/home";
  const mod = moduleForPath(path);
  if (mod && !canOpen(role, mod)) return "/home";
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
    if (ready && user && !handledRef.current) router.replace("/home");
  }, [ready, user, router]);

  return handledRef;
}
