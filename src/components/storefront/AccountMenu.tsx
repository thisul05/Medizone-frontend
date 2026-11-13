"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ButtonLink, Icon, useToast } from "@/components/shared";
import { useAuth } from "@/lib/auth";

const menuItem =
  "flex w-full items-center gap-2 px-4 py-2.5 text-left text-ink transition-colors duration-150 hover:bg-surface-hover focus-visible:bg-surface-hover";

/** Signed out: Sign in and Create account. Signed in: full-name account menu in the header right side. */
export function AccountMenu() {
  const { user, ready, signOut } = useAuth();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

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
          <Link href="/home" className={menuItem} onClick={() => setOpen(false)}>
            <Icon name="home" size={20} /> Go to home
          </Link>
          {user.role === "customer" && (
            <Link href="/orders" className={menuItem} onClick={() => setOpen(false)}>
              <Icon name="clipboard" size={20} /> My orders
            </Link>
          )}
          <Link href="/profile" className={menuItem} onClick={() => setOpen(false)}>
            <Icon name="user" size={20} /> Profile
          </Link>
          <button
            type="button"
            className={menuItem}
            onClick={() => {
              setOpen(false);
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
