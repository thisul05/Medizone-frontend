"use client";

import { ButtonLink, Icon } from "@/components/shared";
import { branchName } from "@/data/branches";
import { modulesFor } from "@/lib/access";
import { useAuth } from "@/lib/auth";
import { MODULES } from "@/types/roles";
import { greeting } from "./greeting";

export function StaffHome() {
  const { user, activeBranchId } = useAuth();
  if (!user) return null;
  const modules = modulesFor(user.role);
  const fullAccess = user.role === "owner";

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <div className="text-xs font-medium text-slate-500 mb-0.5">Staff / Workspace Overview</div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          {greeting()}, {user.name}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          {user.jobTitle} · {branchName(activeBranchId ?? user.branchId)}
        </p>
      </div>

      <section aria-labelledby="modules-title" className="flex flex-col gap-4">
        <h2 id="modules-title" className="mz-h2">Your modules</h2>
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => (
            <li key={m.id} className="flex flex-col gap-4 rounded-lg border border-line bg-surface-raised p-5 shadow-1">
              <span className="flex size-11 items-center justify-center rounded-pill bg-primary-tint text-primary-tint-ink">
                <Icon name={m.icon} />
              </span>
              <div className="flex flex-1 flex-col gap-1">
                <h3 className="mz-h3">{m.label}</h3>
                <p className="text-ink-muted">{m.description}</p>
              </div>
              <ButtonLink href={m.href} variant="secondary" iconRight="arrow-right" className="self-start">
                Open {m.label}
              </ButtonLink>
            </li>
          ))}
        </ul>
        {!fullAccess && (
          <p className="text-ink-muted">
            You can open {modules.length} of {MODULES.length} modules. Ask the owner if you need access to something else.
          </p>
        )}
      </section>
    </div>
  );
}
