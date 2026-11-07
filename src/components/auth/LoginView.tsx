"use client";

import { useSearchParams } from "next/navigation";
import { Icon } from "@/components/shared";
import { site } from "@/data/site";
import { AuthShell } from "./AuthShell";
import { LoginForm } from "./LoginForm";
import { useRedirectIfSignedIn } from "./useRedirectIfSignedIn";

const POINTS = [
  { icon: "truck" as const, text: "Islandwide delivery, or collect at any of our four branches" },
  { icon: "gift" as const, text: "Loyalty points on every bill, plus 3% or 5% off for regular customers" },
  { icon: "clipboard" as const, text: "Your orders and purchase history in one place" },
];

function SignInHelp() {
  return (
    <div className="flex flex-col gap-1 text-body-sm text-nav-muted">
      <p className="flex flex-wrap items-center gap-1.5">
        <Icon name="phone" size={16} />
        Need help signing in? Call
        <a href={site.phoneHref} className="rounded-sm font-semibold text-nav-ink underline-offset-2 hover:underline">
          {site.phone}
        </a>
      </p>
      {site.openingHours && (
        <p className="flex items-center gap-1.5">
          <Icon name="clock" size={16} />
          {site.openingHours}
        </p>
      )}
    </div>
  );
}

/** Reads ?next=. Must be rendered inside <Suspense>. */
export function LoginView() {
  const params = useSearchParams();
  const handledRef = useRedirectIfSignedIn();

  return (
    <AuthShell
      heading="Welcome back to Medizone Pharmacy"
      subline="Sign in to shop, track your orders and use your loyalty points."
      points={POINTS}
      footer={<SignInHelp />}
    >
      <LoginForm next={params.get("next")} handledRef={handledRef} />
    </AuthShell>
  );
}
