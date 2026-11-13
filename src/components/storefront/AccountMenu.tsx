"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/account/ui";
import { ButtonLink, Icon, useToast } from "@/components/shared";
import { useCustomerLogout } from "@/lib/account/logout";
import { useAccount } from "@/lib/account/use-account";
import { useAuth } from "@/lib/auth";

const menuItem =
  "flex w-full items-center gap-2 px-4 py-2.5 text-left text-ink transition-colors duration-150 hover:bg-surface-hover focus-visible:bg-surface-hover";

/** Close on outside click. */
function useOutsideClose(open: boolean, close: () => void) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, close]);
  return root;
}

/**
 * Signed out: Sign in and Create account.
 * Signed in as a customer: avatar, "Hi, <first name>" and a My Account / Logout dropdown.
 * Signed in as staff: full-name menu with Go to home, Profile and Sign out.
 */
export function AccountMenu() {
  const { user, ready, signOut } = useAuth();
  const account = useAccount();
  const logout = useCustomerLogout();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const root = useOutsideClose(open, close);

  if (!ready || !user) {
    return (
      <div className="hidden flex-col items-end gap-0.5 lg:flex">
        <div className="flex items-center gap-2">
          <ButtonLink href="/login" variant="ghost" size="md">Sign in</ButtonLink>
          <ButtonLink href="/register" variant="secondary" size="md">Create account</ButtonLink>
        </div>
        <p className="mz-body-sm text-ink-muted">Members earn loyalty points</p>
      </div>
    );
  }

  if (account) {
    return (
      <div
        ref={root}
        className="relative hidden sm:block"
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
      >
        <button
          type="button"
          aria-expanded={open}
          aria-controls="account-menu"
          aria-haspopup="menu"
          onClick={() => setOpen((o) => !o)}
          className="flex h-control-lg items-center gap-2.5 rounded-md px-2 text-left transition-colors duration-150 hover:bg-primary-tint"
        >
          <Avatar initials={account.initials} size={36} />
          <span className="flex flex-col leading-tight">
            <span className="max-w-[160px] truncate mz-label text-primary-tint-ink">Hi, {account.firstName}</span>
            <span className="mz-caption text-ink-muted">My Account</span>
          </span>
          <Icon name="chevron-down" size={16} className={open ? "rotate-180 text-ink-subtle transition-transform" : "text-ink-subtle transition-transform"} />
        </button>
        {open && (
          <div id="account-menu" role="menu" className="absolute right-0 top-full z-50 mt-1 w-56 overflow-hidden rounded-md border border-line bg-surface-raised py-1 shadow-2">
            <div className="border-b border-line px-4 py-2.5">
              <p className="truncate mz-label text-ink">{account.name}</p>
              <p className="truncate mz-caption text-ink-muted">{account.statusLabel}</p>
            </div>
            <Link href="/account" role="menuitem" className={menuItem} onClick={close}>
              <Icon name="user" size={20} /> My Account
            </Link>
            <button
              type="button"
              role="menuitem"
              className={menuItem}
              onClick={() => {
                close();
                logout();
              }}
            >
              <Icon name="logout" size={20} /> Logout
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={root}
      className="relative hidden sm:block"
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls="account-menu"
        onClick={() => setOpen((o) => !o)}
        className="flex h-control-lg items-center gap-2 rounded-md px-3 mz-label text-primary-tint-ink transition-colors duration-150 hover:bg-primary-tint"
      >
        <Icon name="account" />
        <span className="max-w-[180px] truncate lg:max-w-[240px]">{user.name}</span>
        <Icon name="chevron-down" size={16} />
      </button>
      {open && (
        <div id="account-menu" className="absolute right-0 top-full z-50 mt-1 w-60 overflow-hidden rounded-md border border-line bg-surface-raised py-1 shadow-2">
          <div className="border-b border-line px-4 py-2.5">
            <p className="truncate mz-label text-ink">{user.name}</p>
            <p className="truncate mz-caption text-ink-muted">{user.jobTitle}</p>
          </div>
          <Link href="/home" className={menuItem} onClick={close}>
            <Icon name="home" size={20} /> Go to home
          </Link>
          <Link href="/profile" className={menuItem} onClick={close}>
            <Icon name="user" size={20} /> Profile
          </Link>
          <button
            type="button"
            className={menuItem}
            onClick={() => {
              close();
              signOut();
              toast({ tone: "info", title: "You're signed out" });
            }}
          >
            <Icon name="logout" size={20} /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
