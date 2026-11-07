"use client";

import { Icon, Select, TextField, cx } from "@/components/shared";
import { branches } from "@/data/branches";
import type { RegisterValues, StepProps } from "./register-validation";

const CHANNELS: { value: RegisterValues["contactChannel"]; label: string; icon: "message" | "mail" | "phone" }[] = [
  { value: "whatsapp", label: "WhatsApp", icon: "message" },
  { value: "sms", label: "SMS", icon: "mail" },
  { value: "call", label: "Phone call", icon: "phone" },
];

export function RegisterStepAddress({ values, set, err, blur }: StepProps) {
  return (
    <div className="flex flex-col gap-4">
      <TextField
        id="reg-addressLine"
        label="Address"
        optional
        size="lg"
        autoComplete="street-address"
        maxLength={120}
        hint="Needed for home delivery."
        value={values.addressLine}
        error={err("addressLine")}
        onChange={(e) => set("addressLine", e.target.value)}
        onBlur={() => blur("addressLine")}
      />
      <TextField
        id="reg-city"
        label="City or town"
        size="lg"
        autoComplete="address-level2"
        value={values.city}
        error={err("city")}
        onChange={(e) => set("city", e.target.value)}
        onBlur={() => blur("city")}
      />
      <Select
        id="reg-preferredBranchId"
        label="Preferred branch"
        size="lg"
        placeholder="Choose a branch"
        value={values.preferredBranchId}
        error={err("preferredBranchId")}
        onChange={(e) => set("preferredBranchId", e.target.value)}
        onBlur={() => blur("preferredBranchId")}
        options={branches.map((b) => ({ value: b.id, label: `${b.name}, ${b.area}` }))}
      />
      <fieldset id="reg-contactChannel" className="flex flex-col gap-2">
        <legend className="mb-1.5 text-label">Contact me by</legend>
        <div className="grid grid-cols-3 gap-2">
          {CHANNELS.map((c) => {
            const checked = values.contactChannel === c.value;
            return (
              <label
                key={c.value}
                className={cx(
                  "flex h-control-lg cursor-pointer items-center justify-center gap-2 rounded-md border px-2 text-label transition-colors duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-focus",
                  checked ? "border-primary bg-primary-tint text-primary-tint-ink" : "border-line-strong hover:bg-surface-hover",
                )}
              >
                <input
                  type="radio"
                  name="contactChannel"
                  value={c.value}
                  checked={checked}
                  onChange={() => set("contactChannel", c.value)}
                  className="sr-only"
                />
                <Icon name={c.icon} size={20} />
                {c.label}
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
