"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { canOpen } from "@/lib/access";
import { useAuth } from "@/lib/auth";
import { isPublicRoute, moduleForPath } from "@/lib/routes";
import type { ModuleId } from "@/types/roles";
import { Logo } from "./Logo";

function FullPageLoader() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-surface-page" role="status">
      <Logo height={36} />
      <p className="text-ink-muted">Loading…</p>
    </div>
  );
}

type GuardState = "ok" | "loading" | "signin" | "denied";

function useGuard(module: ModuleId | null, enabled: boolean): GuardState {
  const { user, ready } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  let state: GuardState = "ok";
  if (enabled) {
    if (!ready) state = "loading";
    else if (!user) state = "signin";
    else if (module && !canOpen(user.role, module)) state = "denied";
  }

  useEffect(() => {
    if (state === "signin") {
      const here = pathname + (typeof window !== "undefined" ? window.location.search : "");
      router.replace("/login?next=" + encodeURIComponent(here));
    } else if (state === "denied" && module) {
      router.replace("/access-denied?module=" + module);
    }
  }, [state, module, pathname, router]);

  return state;
}

/** Wraps the whole app once, in the root layout. Protects every non-public route. */
export function RouteGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPublic = isPublicRoute(pathname);
  const state = useGuard(moduleForPath(pathname), !isPublic);
  return state === "ok" ? <>{children}</> : <FullPageLoader />;
}

/** Protects one page or section by module, with the same rules as RouteGuard. */
export function AccessGuard({ module, children }: { module: ModuleId; children: ReactNode }) {
  const state = useGuard(module, true);
  return state === "ok" ? <>{children}</> : <FullPageLoader />;
}
