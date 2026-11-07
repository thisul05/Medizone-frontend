import Link from "next/link";
import { ButtonLink, Icon, cx, type IconName } from "@/components/shared";
import { site } from "@/data/site";
import { CONTAINER } from "./Section";

const BENEFITS: { icon: IconName; title: string; text: string }[] = [
  { icon: "gift", title: "Loyalty points", text: `Earn ${site.loyaltyRate} you spend, in store or online.` },
  { icon: "percent", title: "Regular-customer discount", text: "Save 3% or 5% once your branch marks you as a regular customer." },
  { icon: "bell", title: "Restock reminders", text: "We remind you before your usual products run out." },
  { icon: "clipboard", title: "Purchase history in one place", text: "Staff can see what you bought before and serve you faster." },
];

export function MembershipBand() {
  return (
    <section id="membership" aria-labelledby="membership-title" className="scroll-mt-40 bg-loyalty-bg py-12 lg:py-16">
      <div className={cx(CONTAINER, "flex flex-col gap-8")}>
        <div className="flex max-w-2xl flex-col gap-2">
          <h2 id="membership-title" className="mz-h1 text-loyalty-ink">Get more from every visit</h2>
          <p className="mz-body-lg text-ink">A free Medizone account works at all four branches and online.</p>
        </div>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((b) => (
            <li key={b.title} className="flex flex-col gap-3">
              <span className="flex size-11 items-center justify-center rounded-pill bg-surface-raised text-loyalty-ink">
                <Icon name={b.icon} />
              </span>
              <p className="mz-h3 text-ink">{b.title}</p>
              <p className="text-ink-muted">{b.text}</p>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center gap-4">
          <ButtonLink href="/register" size="lg">Create account</ButtonLink>
          <p className="text-ink">
            Already a member?{" "}
            <Link href="/login" className="font-semibold text-link hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
