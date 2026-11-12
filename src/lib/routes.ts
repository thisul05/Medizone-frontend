import type { ModuleId } from "@/types/roles";

/** Open to everyone. */
export const PUBLIC_ROUTES = ["/", "/shop", "/login", "/register", "/modules"];

/** Any signed-in user. */
export const SIGNED_IN_ROUTES = ["/home", "/profile", "/access-denied"];

export const MODULE_ROUTES: Record<string, ModuleId> = {
  "/admin": "admin",
  "/inventory": "inventory",
  "/orders": "orders",
  "/customers": "customers",
  "/suppliers": "suppliers",
  "/delivery": "delivery",
  "/billing": "billing",
  "/staff": "staff",
  "/reports": "reports",
};

const matches = (pathname: string, route: string) =>
  route === "/" ? pathname === "/" : pathname === route || pathname.startsWith(route + "/");

export const isPublicRoute = (pathname: string) => PUBLIC_ROUTES.some((r) => matches(pathname, r));

/** "/inventory/new" -> "inventory". Null for non-module paths. */
export function moduleForPath(pathname: string): ModuleId | null {
  for (const [route, id] of Object.entries(MODULE_ROUTES)) {
    if (matches(pathname, route)) return id;
  }
  return null;
}

/** A path that is safe to redirect to after sign-in: internal, not protocol-relative. */
export function isSafeNext(next: string | null | undefined): next is string {
  return !!next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\");
}
