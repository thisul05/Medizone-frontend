"use client";

import { useRef, useState, type FormEvent } from "react";
import { Icon, cx, useToast } from "@/components/shared";
import { CONTAINER, NAV_FOCUS } from "./Section";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function NewsletterBand() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const value = email.trim();
    const message = !value ? "Enter your email address" : !EMAIL_RE.test(value) ? "Enter an email address like name@example.com" : null;
    setError(message);
    if (message) {
      input.current?.focus();
      return;
    }
    setEmail("");
    toast({ tone: "success", title: "Thanks. You're on the list." });
  }

  return (
    <section aria-labelledby="newsletter-title" className={cx("bg-surface-nav py-12 text-nav-ink lg:py-16", NAV_FOCUS)}>
      <div className={cx(CONTAINER, "flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between")}>
        <div className="flex flex-col gap-1">
          <h2 id="newsletter-title" className="text-h1">Health tips and offers, once a month</h2>
          <p className="text-body-lg text-nav-muted">You can unsubscribe at any time.</p>
        </div>
        <form onSubmit={onSubmit} noValidate className="flex w-full flex-col gap-2 lg:max-w-md">
          <label htmlFor="newsletter-email" className="text-label">Email address</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              ref={input}
              id="newsletter-email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "newsletter-error" : undefined}
              className={cx(
                "h-control-lg min-w-0 flex-1 rounded-md border bg-surface-raised px-3 text-body text-ink placeholder:text-ink-subtle",
                error ? "border-danger-solid" : "border-transparent",
              )}
            />
            <button type="submit" className="h-control-lg rounded-md bg-surface-raised px-5 text-label text-primary-tint-ink transition-colors duration-150 hover:bg-primary-tint">
              Subscribe
            </button>
          </div>
          {error && (
            <p id="newsletter-error" className="flex items-center gap-1.5 rounded-sm bg-danger-bg px-2 py-1 text-body-sm text-danger-ink">
              <Icon name="alert-circle" size={16} />
              {error}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
