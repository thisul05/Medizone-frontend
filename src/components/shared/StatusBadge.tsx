import { getStatus, type StatusKind, type Tone } from "@/lib/status";

/**
 * The one way to show a status. See docs/UI-STYLE-GUIDE.md.
 *
 * Status is never colour alone, so the badge always prints the word. A dot in
 * the tone's solid colour gives a second, non-textual cue.
 */

const TONE_CLASS: Record<Tone, string> = {
  neutral: "bg-neutral-bg text-neutral-ink",
  info: "bg-info-bg text-info-ink",
  success: "bg-success-bg text-success-ink",
  warning: "bg-warning-bg text-warning-ink",
  danger: "bg-danger-bg text-danger-ink",
  transit: "bg-transit-bg text-transit-ink",
};

const DOT_CLASS: Record<Tone, string> = {
  neutral: "bg-neutral-solid",
  info: "bg-info-solid",
  success: "bg-success-solid",
  warning: "bg-warning-solid",
  danger: "bg-danger-solid",
  transit: "bg-transit-solid",
};

interface Props {
  kind: StatusKind;
  status: string;
  /** Hide the leading dot when the badge sits next to an icon already. */
  dot?: boolean;
}

export default function StatusBadge({ kind, status, dot = true }: Props) {
  const { label, tone } = getStatus(kind, status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 ${TONE_CLASS[tone]}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${DOT_CLASS[tone]}`} aria-hidden="true" />}
      {label}
    </span>
  );
}
