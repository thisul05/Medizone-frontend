"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { branches, branchName } from "@/data/branches";
import { useAuth } from "@/lib/auth";
import type { BranchId } from "@/types/roles";
import { buttonClasses } from "./Button";
import { Icon } from "./Icon";
import { Logo } from "./Logo";
import { Select } from "./Select";
import { useToast } from "./Toast";
import { cx } from "./cx";

const navButton = cx(
  "inline-flex h-control-md items-center gap-2 rounded-md px-3 mz-label text-nav-ink",
  "transition-colors duration-150 hover:bg-nav-active",
);

/** Navy top bar for signed-in pages: logo, branch, name, Profile and Sign out. */
export function StaffTopBar() {
  const { user, activeBranchId, setActiveBranch, signOut } = useAuth();
  const router = useRouter();
  const toast = useToast();
  if (!user) return null;

  const allBranches = user.branchId === "all";
  const onSignOut = () => {
    signOut();
    toast({ tone: "info", title: "You're signed out" });
    router.push("/login");
  };

  return (
    <header className="bg-surface-nav text-nav-ink mz-on-nav">
      <div className="mx-auto flex max-w-content flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 lg:px-8">
        <Link href="/home" className="rounded-md" aria-label="Medizone Pharmacy, go to home">
          <Logo height={32} />
        </Link>

        <div className="flex items-center gap-2 mz-body-sm text-nav-muted">
          <Icon name="store" size={20} />
          {allBranches ? (
            <Select
              label="Branch"
              labelHidden
              tone="nav"
              size="sm"
              value={activeBranchId ?? "all"}
              onChange={(e) => setActiveBranch(e.target.value as BranchId | "all")}
              options={[{ value: "all", label: "All branches" }, ...branches.map((b) => ({ value: b.id, label: `${b.name}, ${b.area}` }))]}
              className="w-56 max-w-[60vw]"
            />
          ) : (
            <span className="mz-label text-nav-ink">{branchName(user.branchId)}</span>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden text-right sm:block">
            <p className="mz-label text-nav-ink">{user.name}</p>
            <p className="mz-caption text-nav-muted">{user.jobTitle}</p>
          </div>
          <Link href="/profile" className={navButton}>
            <Icon name="user" size={20} />
            Profile
          </Link>
          <button
            type="button"
            onClick={onSignOut}
            className={cx(buttonClasses({ variant: "ghost" }), "text-nav-ink hover:bg-nav-active")}
          >
            <Icon name="logout" size={20} />
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
