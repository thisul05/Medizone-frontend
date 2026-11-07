"use client";

import { useSearchParams } from "next/navigation";
import { ButtonLink, Icon } from "@/components/shared";
import { useAuth } from "@/lib/auth";
import { MODULES, ROLE_LABELS } from "@/types/roles";
import { SignedInShell } from "./SignedInShell";

/** Reads ?module=. Must be rendered inside <Suspense>. */
export function AccessDeniedView() {
  const params = useSearchParams();
  const { user } = useAuth();
  const mod = MODULES.find((m) => m.id === params.get("module"));
  const role = user ? ROLE_LABELS[user.role] : "Your role";

  return (
    <SignedInShell>
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 py-12 text-center">
        <span className="flex size-14 items-center justify-center rounded-pill bg-danger-bg text-danger-ink">
          <Icon name="lock" size={28} />
        </span>
        <h1 className="mz-h1">You don&apos;t have access to this page</h1>
        <p className="mz-body-lg text-ink-muted">
          Your role ({role}) can&apos;t open {mod ? mod.label : "this module"}. Ask the owner if you need access.
        </p>
        <ButtonLink href="/home" icon="home" className="mt-2">
          Go to home
        </ButtonLink>
      </div>
    </SignedInShell>
  );
}
