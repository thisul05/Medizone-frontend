"use client";

import { ButtonLink } from "@/components/shared";
import { EmptyState, PANEL } from "./ui";

/** Unknown address under /account. */
export function AccountNotFound() {
  return (
    <div className={PANEL}>
      <EmptyState icon="search" title="Page not found" action={<ButtonLink href="/account" icon="arrow-left">Back to My Account</ButtonLink>}>
        This page doesn&apos;t exist in your account. Use the menu to find what you&apos;re looking for.
      </EmptyState>
    </div>
  );
}
