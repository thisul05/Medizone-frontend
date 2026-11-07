"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Badge, Button, useToast } from "@/components/shared";
import { branchName } from "@/data/branches";
import { useAuth } from "@/lib/auth";
import { getCustomerProfile } from "@/lib/auth-store";
import { formatDate, formatPhone } from "@/lib/format";
import { ROLE_LABELS } from "@/types/roles";
import { SignedInShell } from "./SignedInShell";

const GENDER = { female: "Female", male: "Male", prefer_not: "Prefer not to say" };
const CHANNEL = { whatsapp: "WhatsApp", sms: "SMS", call: "Phone call" };

function Row({ label, children, mono }: { label: string; children: ReactNode; mono?: boolean }) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[200px_1fr] sm:gap-4">
      <dt className="text-label text-ink-muted">{label}</dt>
      <dd className={mono ? "font-mono text-body" : "text-body"}>{children}</dd>
    </div>
  );
}

const card = "rounded-lg border border-line bg-surface-raised p-5 shadow-1";

export function ProfileView() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const toast = useToast();
  if (!user) return null;
  const profile = user.customerId ? getCustomerProfile(user.customerId) : undefined;
  const isCustomer = user.role === "customer";
  const yesNo = (on: boolean) => <Badge tone={on ? "success" : "neutral"} icon={on ? "check" : "x"}>{on ? "Yes" : "No"}</Badge>;

  return (
    <SignedInShell>
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-h1">{user.name}</h1>
            <p className="text-body-lg text-ink-muted">
              {user.jobTitle}
              {!isCustomer && ` · ${ROLE_LABELS[user.role]} role`}
            </p>
          </div>
          <Button
            variant="secondary"
            icon="logout"
            onClick={() => {
              signOut();
              toast({ tone: "info", title: "You're signed out" });
              router.push("/login");
            }}
          >
            Sign out
          </Button>
        </div>

        <section aria-labelledby="account-title" className={card}>
          <h2 id="account-title" className="text-h3">Account</h2>
          <dl className="mt-2 divide-y divide-line">
            <Row label={isCustomer ? "Preferred branch" : "Branch"}>{branchName(user.branchId)}</Row>
            {user.username && <Row label="Username" mono>{user.username}</Row>}
            {user.staffId && <Row label="Staff id" mono>{user.staffId}</Row>}
            {user.customerId && <Row label="Customer id" mono>{user.customerId}</Row>}
            {user.phone && <Row label="Mobile number">{formatPhone(user.phone)}</Row>}
            {user.email && <Row label="Email">{user.email}</Row>}
            <Row label="Member since">{formatDate(user.createdAt)}</Row>
          </dl>
        </section>

        {profile && (
          <section aria-labelledby="reg-title" className={card}>
            <h2 id="reg-title" className="text-h3">Registration details</h2>
            <dl className="mt-2 divide-y divide-line">
              <Row label="WhatsApp number">{formatPhone(profile.whatsapp)}</Row>
              {profile.dateOfBirth && <Row label="Date of birth">{formatDate(profile.dateOfBirth)}</Row>}
              {profile.gender && <Row label="Gender">{GENDER[profile.gender]}</Row>}
              {profile.addressLine && <Row label="Address">{profile.addressLine}</Row>}
              <Row label="City or town">{profile.city}</Row>
              <Row label="Contact by">{CHANNEL[profile.contactChannel]}</Row>
            </dl>
            <h3 className="mt-6 text-label">Consents</h3>
            <dl className="mt-1 divide-y divide-line">
              <Row label="Terms and privacy">{yesNo(true)}</Row>
              <Row label="Save purchase history">{yesNo(profile.consents.storeHistory)}</Row>
              <Row label="Reminders and updates">{yesNo(profile.consents.reminders)}</Row>
              <Row label="Offers and health tips">{yesNo(profile.consents.promotions)}</Row>
              <Row label="Given on">{formatDate(profile.consents.at)}</Row>
            </dl>
            <p className="mt-4 text-body-sm text-ink-muted">To change these details, call us or ask at any branch.</p>
          </section>
        )}
      </div>
    </SignedInShell>
  );
}
