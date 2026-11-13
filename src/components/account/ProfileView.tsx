"use client";

import { Badge, ButtonLink, cx } from "@/components/shared";
import { branchName } from "@/data/branches";
import { formatDate, formatPhone } from "@/lib/format";
import { useAccount } from "@/lib/account/use-account";
import type { SavedAddress } from "@/types/account";
import { Avatar, DetailList, PANEL, PageTitle, Panel } from "./ui";

export function formatAddress(a: Pick<SavedAddress, "addressLine" | "city" | "district" | "postalCode">): string {
  const district = a.district ? `${a.district} District` : "";
  return [a.addressLine, a.city, district, a.postalCode].filter(Boolean).join(", ");
}

export function ProfileView() {
  const account = useAccount();
  if (!account) return null;
  const { profile, defaultAddress } = account;

  return (
    <>
      <PageTitle
        title="My Profile"
        description="Your personal and contact details."
        actions={<ButtonLink href="/account/profile/edit" icon="user">Edit Profile</ButtonLink>}
      />

      <section aria-label="Profile summary" className={cx(PANEL, "flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center")}>
        <Avatar initials={account.initials} size={72} />
        <div className="flex min-w-0 flex-col gap-1.5">
          <p className="mz-h2 text-primary-tint-ink">{profile.name}</p>
          <div className="flex flex-wrap gap-2">
            <Badge tone="success" icon="circle-check">Active account</Badge>
            <Badge tone={account.isRegular ? "loyalty" : "neutral"} icon={account.isRegular ? "badge-check" : undefined}>{account.statusLabel}</Badge>
            {account.isRegular && <Badge tone="brand" icon="percent">{account.discount}% discount</Badge>}
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Personal details">
          <DetailList
            rows={[
              ["Full name", profile.name],
              ["Email", profile.email || <span className="text-ink-muted">Not added</span>],
              ["Phone number", profile.phone ? formatPhone(profile.phone) : <span className="text-ink-muted">Not added</span>],
              ["Customer ID", <span key="id" className="mz-code">{account.customerId}</span>],
            ]}
          />
        </Panel>

        <Panel title="Account">
          <DetailList
            rows={[
              ["Account status", <Badge key="s" tone="success" dot>Active</Badge>],
              ["Customer type", account.statusLabel],
              ["Discount", account.isRegular ? `${account.discount}% off every purchase` : "No regular-customer discount yet"],
              ["Loyalty points", `${account.loyalty.balance.toLocaleString("en-LK")} points`],
              ["Preferred branch", branchName(account.branchId)],
              ["Member since", formatDate(account.memberSince)],
            ]}
          />
        </Panel>
      </div>

      <Panel
        title="Default delivery address"
        action={<ButtonLink href="/account/addresses" size="sm" variant="ghost" iconRight="arrow-right">Manage addresses</ButtonLink>}
      >
        {defaultAddress ? (
          <div className="flex flex-col gap-1">
            <p className="flex items-center gap-2 mz-label">
              {defaultAddress.label}
              <Badge tone="brand">Default</Badge>
            </p>
            <p>{defaultAddress.fullName} · {formatPhone(defaultAddress.phone)}</p>
            <p className="text-ink-muted">{formatAddress(defaultAddress)}</p>
          </div>
        ) : (
          <p className="text-ink-muted">You have not saved a delivery address yet. Add one when you edit your profile or on My Addresses.</p>
        )}
      </Panel>

      <p className="mz-body-sm text-ink-muted">
        Your customer ID and loyalty balance are managed by Medizone and can&apos;t be changed here. Demo: profile changes are saved in this browser only.
      </p>
    </>
  );
}
