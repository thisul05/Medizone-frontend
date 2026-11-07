import { Icon } from "@/components/shared";
import { branches } from "@/data/branches";
import { site } from "@/data/site";
import { Section } from "./Section";

const FAQS = [
  {
    q: "Do you deliver, and how much does it cost?",
    a: "Yes. We deliver islandwide. The delivery fee depends on where you live, and we confirm it when we call you about your order.",
  },
  {
    q: "Can I collect my order from a branch?",
    a: `Yes. Choose "Collect from a branch" at checkout and pick one of our ${branches.length} branches. We call you when your order is ready.`,
  },
  {
    q: "How can I pay?",
    a: "Cash, card or bank transfer for collection orders. For home delivery you can also pay cash on delivery.",
  },
  {
    q: "How do loyalty points work?",
    a: `Members earn ${site.loyaltyRate} spent on every bill, in store or online. Create a free account and give your mobile number at the counter.`,
  },
  {
    q: "How do I become a regular customer?",
    a: "Shop with us often and ask the staff at your branch. Regular customers get 3% or 5% off their bills, set by the branch.",
  },
  {
    q: "Can I buy prescription medicines on this website?",
    a: "No. In line with NMRA rules, prescription medicines are only dispensed at our branches after a pharmacist checks your prescription. Please visit or call your nearest branch.",
  },
];

/** Accessible accordion built on native details and summary. */
export function FaqSection() {
  return (
    <Section id="faq" title="Questions and answers">
      <div className="flex max-w-3xl flex-col divide-y divide-line rounded-lg border border-line bg-surface-raised shadow-1">
        {FAQS.map((f) => (
          <details key={f.q} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 mz-label text-ink transition-colors duration-150 hover:bg-surface-hover [&::-webkit-details-marker]:hidden">
              <span>{f.q}</span>
              <Icon name="chevron-down" className="text-ink-subtle group-open:rotate-180" />
            </summary>
            <p className="px-5 pb-5 text-ink-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
