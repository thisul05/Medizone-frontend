import Image from "next/image";
import { cx } from "./cx";

const RATIO = 2168 / 463;

interface LogoProps {
  /** Height in px. Never below 28. */
  height?: number;
  priority?: boolean;
  className?: string;
}

/** The Medizone logo. Never recolour or redraw it. */
export function Logo({ height = 36, priority, className }: LogoProps) {
  const h = Math.max(28, height);
  const w = Math.round(h * RATIO);
  return (
    <Image
      src="/brand/medizone-logo.png"
      alt="Medizone Pharmacy"
      width={w}
      height={h}
      priority={priority}
      className={cx("h-auto shrink-0", className)}
      style={{ width: w, height: h }}
    />
  );
}
