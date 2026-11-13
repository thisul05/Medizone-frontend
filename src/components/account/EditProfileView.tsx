"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Alert, Button, ButtonLink, Select, TextField, useToast } from "@/components/shared";
import { SRI_LANKA_DISTRICTS } from "@/data/account";
import { formatPhone } from "@/lib/format";
import { validateAddress, validateProfile } from "@/lib/account/rules";
import { saveAddress, saveProfile } from "@/lib/account/store";
import { useAccount, type AccountData } from "@/lib/account/use-account";
import { PageTitle, Panel } from "./ui";

type Form = { name: string; email: string; phone: string; addressLine: string; city: string; district: string; postalCode: string };
type Errors = Partial<Record<keyof Form, string>>;

const DISTRICT_OPTIONS = SRI_LANKA_DISTRICTS.map((d) => ({ value: d, label: d }));

function EditForm({ account }: { account: AccountData }) {
  const router = useRouter();
  const toast = useToast();
  const a = account.defaultAddress;
  const [form, setForm] = useState<Form>({
    name: account.profile.name,
    email: account.profile.email,
    phone: account.profile.phone ? formatPhone(account.profile.phone) : "",
    addressLine: a?.addressLine ?? "",
    city: a?.city ?? "",
    district: a?.district ?? "",
    postalCode: a?.postalCode ?? "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const check = (f: Form): Errors => {
    const address = validateAddress({ label: "Home", fullName: f.name, phone: f.phone, addressLine: f.addressLine, city: f.city, district: f.district, postalCode: f.postalCode });
    return {
      ...validateProfile(f),
      addressLine: address.addressLine,
      city: address.city,
      district: address.district,
      postalCode: address.postalCode,
    };
  };

  const set = (key: keyof Form) => (value: string) => {
    const next = { ...form, [key]: value };
    setForm(next);
    if (submitted) setErrors(check(next));
  };

  const errorCount = Object.values(errors).filter(Boolean).length;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const found = check(form);
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;
    setSaving(true);
    window.setTimeout(() => {
      saveProfile(account.customerId, { name: form.name, email: form.email, phone: form.phone });
      const addressInput = {
        label: a?.label ?? ("Home" as const),
        fullName: a?.fullName ?? form.name.trim(),
        phone: a?.phone || form.phone,
        addressLine: form.addressLine,
        city: form.city,
        district: form.district,
        postalCode: form.postalCode,
      };
      saveAddress(account.customerId, account.addresses, addressInput, a?.id, true);
      setSaving(false);
      toast({ tone: "success", title: "Profile updated", description: "Your changes have been saved." });
      router.push("/account/profile");
    }, 500);
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      {submitted && errorCount > 0 && (
        <Alert tone="danger" title={`Please check ${errorCount} field${errorCount === 1 ? "" : "s"}`}>
          Fix the highlighted fields below, then save again.
        </Alert>
      )}

      <Panel title="Personal details">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="Full name" value={form.name} onChange={(e) => set("name")(e.target.value)} error={errors.name} autoComplete="name" required fieldClassName="md:col-span-2" />
          <TextField label="Email" type="email" value={form.email} onChange={(e) => set("email")(e.target.value)} error={errors.email} autoComplete="email" icon="mail" required />
          <TextField label="Mobile number" type="tel" value={form.phone} onChange={(e) => set("phone")(e.target.value)} error={errors.phone} autoComplete="tel" icon="phone" placeholder="077 123 4567" hint="Sri Lankan mobile, starting with 07" required />
          <TextField label="Customer ID" value={account.customerId} readOnly disabled hint="Assigned by Medizone. Can't be changed." />
          <TextField label="Loyalty points" value={`${account.loyalty.balance.toLocaleString("en-LK")} points`} readOnly disabled hint="Updated automatically from your purchases." />
        </div>
      </Panel>

      <Panel title="Default delivery address">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="Address line" value={form.addressLine} onChange={(e) => set("addressLine")(e.target.value)} error={errors.addressLine} autoComplete="street-address" placeholder="45/2 Temple Road" required fieldClassName="md:col-span-2" />
          <TextField label="City" value={form.city} onChange={(e) => set("city")(e.target.value)} error={errors.city} autoComplete="address-level2" placeholder="Piliyandala" required />
          <Select label="District" value={form.district} onChange={(e) => set("district")(e.target.value)} error={errors.district} options={DISTRICT_OPTIONS} placeholder="Choose a district" required />
          <TextField label="Postal code" value={form.postalCode} onChange={(e) => set("postalCode")(e.target.value)} error={errors.postalCode} autoComplete="postal-code" inputMode="numeric" maxLength={5} placeholder="10300" required />
        </div>
      </Panel>

      <p className="mz-body-sm text-ink-muted">Demo: changes are saved in this browser only. Your sign-in details stay the same.</p>

      <div className="flex flex-wrap justify-end gap-2">
        <ButtonLink href="/account/profile" variant="secondary">Cancel</ButtonLink>
        <Button type="submit" icon="check" loading={saving}>Save Changes</Button>
      </div>
    </form>
  );
}

export function EditProfileView() {
  const account = useAccount();
  if (!account) return null;
  return (
    <>
      <PageTitle title="Edit Profile" description="Update your name, contact details and default delivery address." />
      <EditForm account={account} />
    </>
  );
}
