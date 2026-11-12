"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { canOpen } from "@/lib/access";
import {
  findAccount, markSigningOut, readSession, registerCustomer, subscribeSession, toSessionUser, writeSession, type RegisterResult,
} from "@/lib/auth-store";
import type { RegisterInput, SessionUser } from "@/types/auth";
import type { BranchId, ModuleId } from "@/types/roles";

export type SignInResult =
  | { ok: true; user: SessionUser }
  | { ok: false; field?: "identifier" | "password"; message: string };

interface AuthContextValue {
  user: SessionUser | null;
  /** False until browser storage has been read. Render nothing user-specific before then. */
  ready: boolean;
  activeBranchId: BranchId | "all" | null;
  /** Only for users with access to all branches. */
  setActiveBranch: (id: BranchId | "all") => void;
  signIn: (identifier: string, password: string, remember: boolean) => Promise<SignInResult>;
  register: (input: RegisterInput) => Promise<RegisterResult>;
  signOut: () => void;
  can: (module: ModuleId) => boolean;
  /** Timestamp (ms) until which sign-in is locked after 5 failures in a row, or null. */
  lockedUntil: number | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const MAX_FAILURES = 5;
const LOCK_MS = 30_000;
const DELAY_MS = 400;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const noopSubscribe = () => () => {};

export function AuthProvider({ children }: { children: ReactNode }) {
  const session = useSyncExternalStore(subscribeSession, readSession, () => null);
  const ready = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [failures, setFailures] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  const user = useMemo<SessionUser | null>(() => {
    if (!session) return null;
    const { activeBranchId: _branch, ...rest } = session;
    void _branch;
    return rest;
  }, [session]);

  const fail = useCallback(
    (result: Extract<SignInResult, { ok: false }>): SignInResult => {
      const next = failures + 1;
      if (next >= MAX_FAILURES) {
        setFailures(0);
        setLockedUntil(Date.now() + LOCK_MS);
      } else {
        setFailures(next);
      }
      return result;
    },
    [failures],
  );

  const signIn = useCallback<AuthContextValue["signIn"]>(
    async (identifier, password, remember) => {
      await wait(DELAY_MS);
      if (lockedUntil && Date.now() < lockedUntil) {
        return { ok: false, message: "Too many attempts. Wait a moment and try again." };
      }
      const found = findAccount(identifier);
      if (!found.account) return fail({ ok: false, field: "identifier", message: found.message });
      if (found.account.password !== password) {
        return fail({ ok: false, field: "password", message: "Wrong password. Check it and try again." });
      }
      setFailures(0);
      setLockedUntil(null);
      const sessionUser = toSessionUser(found.account);
      writeSession({ ...sessionUser, activeBranchId: sessionUser.branchId }, remember);
      return { ok: true, user: sessionUser };
    },
    [fail, lockedUntil],
  );

  const register = useCallback<AuthContextValue["register"]>(async (input) => {
    await wait(DELAY_MS);
    const result = registerCustomer(input);
    if (result.ok) {
      const sessionUser = toSessionUser(result.account);
      writeSession({ ...sessionUser, activeBranchId: sessionUser.branchId }, false);
    }
    return result;
  }, []);

  const signOut = useCallback(() => {
    markSigningOut();
    writeSession(null);
  }, []);

  const setActiveBranch = useCallback(
    (id: BranchId | "all") => {
      if (!session || session.branchId !== "all") return;
      writeSession({ ...session, activeBranchId: id });
    },
    [session],
  );

  const can = useCallback((module: ModuleId) => (user ? canOpen(user.role, module) : false), [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      activeBranchId: session?.activeBranchId ?? null,
      setActiveBranch,
      signIn,
      register,
      signOut,
      can,
      lockedUntil,
    }),
    [user, ready, session, setActiveBranch, signIn, register, signOut, can, lockedUntil],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
