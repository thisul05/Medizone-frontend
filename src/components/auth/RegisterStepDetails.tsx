"use client";

import { Checkbox, Select, TextField } from "@/components/shared";
import type { StepProps } from "./register-validation";

export function RegisterStepDetails({ values, set, err, blur }: StepProps) {
  return (
    <div className="flex flex-col gap-4">
      <TextField
        id="reg-fullName"
        label="Full name"
        size="lg"
        autoComplete="name"
        value={values.fullName}
        error={err("fullName")}
        onChange={(e) => set("fullName", e.target.value)}
        onBlur={() => blur("fullName")}
      />
      <TextField
        id="reg-phone"
        label="Mobile number"
        size="lg"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="077 123 4567"
        hint="We'll use this for order updates and your regular-customer discount at the counter."
        value={values.phone}
        error={err("phone")}
        onChange={(e) => set("phone", e.target.value)}
        onBlur={() => blur("phone")}
      />
      <Checkbox
        label="Use this number for WhatsApp"
        checked={values.sameWhatsapp}
        onChange={(e) => set("sameWhatsapp", e.target.checked)}
      />
      {!values.sameWhatsapp && (
        <TextField
          id="reg-whatsapp"
          label="WhatsApp number"
          size="lg"
          type="tel"
          inputMode="tel"
          placeholder="077 123 4567"
          value={values.whatsapp}
          error={err("whatsapp")}
          onChange={(e) => set("whatsapp", e.target.value)}
          onBlur={() => blur("whatsapp")}
        />
      )}
      <TextField
        id="reg-email"
        label="Email"
        optional
        size="lg"
        type="email"
        autoComplete="email"
        placeholder="name@example.com"
        hint="Optional. You can sign in with it too."
        value={values.email}
        error={err("email")}
        onChange={(e) => set("email", e.target.value)}
        onBlur={() => blur("email")}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="reg-dateOfBirth"
          label="Date of birth"
          optional
          size="lg"
          type="date"
          autoComplete="bday"
          value={values.dateOfBirth}
          error={err("dateOfBirth")}
          onChange={(e) => set("dateOfBirth", e.target.value)}
          onBlur={() => blur("dateOfBirth")}
        />
        <Select
          id="reg-gender"
          label="Gender"
          optional
          size="lg"
          placeholder="Choose one"
          value={values.gender}
          onChange={(e) => set("gender", e.target.value as StepProps["values"]["gender"])}
          options={[
            { value: "female", label: "Female" },
            { value: "male", label: "Male" },
            { value: "prefer_not", label: "Prefer not to say" },
          ]}
        />
      </div>
    </div>
  );
}
