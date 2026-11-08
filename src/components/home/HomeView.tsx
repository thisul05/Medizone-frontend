"use client";

import { useAuth } from "@/lib/auth";
import { CustomerHome } from "./CustomerHome";
import { SignedInShell } from "./SignedInShell";
import { StaffHome } from "./StaffHome";

export function HomeView() {
  const { user } = useAuth();
  return <SignedInShell>{user?.role === "customer" ? <CustomerHome /> : <StaffHome />}</SignedInShell>;
}
