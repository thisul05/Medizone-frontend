"use client";

import { useState } from "react";
import { Checkbox, Icon, PasswordField, cx } from "@/components/shared";
import { PASSWORD_RULES } from "@/lib/auth-store";
import type { StepProps } from "./register-validation";

export function RegisterStepPassword({ values, set, err, blur }: StepProps) {
  const [showTerms, setShowTerms] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <PasswordField
        id="reg-password"
        label="Password"
        size="lg"
        autoComplete="new-password"
        value={values.password}
        error={err("password")}
        onChange={(e) => set("password", e.target.value)}
        onBlur={() => blur("password")}
      />
      <ul className="-mt-1 flex flex-col gap-1" aria-label="Password rules">
        {PASSWORD_RULES.map((r) => {
          const met = r.test(values.password);
          return (
            <li key={r.id} className={cx("flex items-center gap-2 mz-body-sm", met ? "text-success-ink" : "text-ink-muted")}>
              <Icon name={met ? "circle-check" : "x"} size={16} />
              {r.label}
              <span className="sr-only">{met ? "(met)" : "(not met yet)"}</span>
            </li>
          );
        })}
      </ul>
      <PasswordField
        id="reg-confirm"
        label="Confirm password"
        size="lg"
        autoComplete="new-password"
        value={values.confirm}
        error={err("confirm")}
        onChange={(e) => set("confirm", e.target.value)}
        onBlur={() => blur("confirm")}
      />

      <div className="flex flex-col gap-4 border-t border-line pt-4">
        <Checkbox
          id="reg-terms"
          label="I accept the terms of use and privacy policy"
          checked={values.terms}
          error={err("terms")}
          onChange={(e) => set("terms", e.target.checked)}
        />
        <div className="ml-8">
          <button type="button" aria-expanded={showTerms} onClick={() => setShowTerms((s) => !s)} className="rounded-sm mz-label text-link hover:underline">
            {showTerms ? "Hide the terms" : "Read the terms"}
          </button>
          {showTerms && (
            <p className="mt-2 mz-body-sm text-ink-muted">
              We use your details only to serve you at Medizone: to manage orders, deliveries, loyalty points and discounts.
              We never sell your data. You can ask any branch to correct or delete your details at any time.
            </p>
          )}
        </div>
        <Checkbox
          label="Save my purchase history"
          description="So staff can serve you faster. You can ask us to delete it at any time (Personal Data Protection Act No. 9 of 2022)."
          checked={values.storeHistory}
          onChange={(e) => set("storeHistory", e.target.checked)}
        />
        <Checkbox
          label="Send me restock reminders and order updates"
          checked={values.reminders}
          onChange={(e) => set("reminders", e.target.checked)}
        />
        <Checkbox
          label="Send me offers and health tips"
          checked={values.promotions}
          onChange={(e) => set("promotions", e.target.checked)}
        />
      </div>
    </div>
  );
}
