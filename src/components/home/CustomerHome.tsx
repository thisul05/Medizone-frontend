"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Badge, Icon, type IconName } from "@/components/shared";
import { branchName, getBranch } from "@/data/branches";
import { site } from "@/data/site";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { greeting } from "./greeting";

const cardClass =
  "flex h-full w-full flex-col items-start gap-3 rounded-lg border border-line bg-surface-raised p-5 text-left shadow-1 transition-shadow duration-150 hover:shadow-2";

function CardBody({ title, text }: { icon?: IconName; title: string; text: ReactNode }) {
  return (
    <>
      <span className="mz-h3 text-ink">{title}</span>
      <span className="text-ink-muted">{text}</span>
    </>
  );
}

export function CustomerHome() {
  const { user } = useAuth();
  const { count, setOpen } = useCart();
  if (!user) return null;
  const firstName = user.name.split(/\s+/)[0];
  const branch = user.branchId === "all" ? undefined : getBranch(user.branchId);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-start gap-3">
        <h1 className="mz-display">
          {greeting()}, {firstName}
        </h1>
        <Badge tone="loyalty" icon="gift">0 points</Badge>
      </div>

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <li>
          <Link href="/shop" className={cardClass}>
            <CardBody icon="bag" title="Continue shopping" text="Vitamins, skincare, mom and baby care and health devices." />
          </Link>
        </li>
        <li>
          <button type="button" onClick={() => setOpen(true)} className={cardClass}>
            <CardBody icon="cart" title="My cart" text={count === 0 ? "Your cart is empty." : `${count} item${count === 1 ? "" : "s"} in your cart.`} />
          </button>
        </li>
        <li>
          <Link href="/shop?offers=1" className={cardClass}>
            <CardBody icon="tag" title="Offers this week" text="Savings on devices, vitamins and baby care." />
          </Link>
        </li>
        <li>
          <Link href="/profile" className={cardClass}>
            <CardBody icon="user" title="My profile" text="Your details, preferences and consents." />
          </Link>
        </li>
      </ul>

      <section aria-labelledby="contact-title" className="flex flex-col gap-4 rounded-lg border border-line bg-surface-raised p-5 shadow-1 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <h2 id="contact-title" className="mz-h3">Need help with an order?</h2>
          <p className="text-ink-muted">
            Your preferred branch: {branchName(user.branchId)}
            {branch?.confirmed ? `, ${branch.area}` : ""}
          </p>
        </div>
        <a href={site.phoneHref} className="flex items-center gap-2 mz-h3 text-link hover:underline">
          <Icon name="phone" />
          {site.phone}
        </a>
      </section>
    </div>
  );
}
