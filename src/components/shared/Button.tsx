import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Icon, type IconName } from "./Icon";
import { cx } from "./cx";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success";
export type ButtonSize = "sm" | "md" | "lg";

interface StyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconRight?: IconName;
  block?: boolean;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-on hover:bg-primary-hover",
  secondary: "bg-surface-raised border border-line-strong text-primary-tint-ink hover:bg-primary-tint",
  ghost: "text-primary-tint-ink hover:bg-primary-tint",
  danger: "bg-danger-solid text-on-solid hover:opacity-90",
  success: "bg-success-solid text-on-solid hover:opacity-90",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-control-sm px-3 gap-1.5",
  md: "h-control-md px-4 gap-2",
  lg: "h-control-lg px-5 gap-2",
};

export function buttonClasses({ variant = "primary", size = "md", block }: StyleProps, extra?: string) {
  return cx(
    "inline-flex items-center justify-center rounded-md font-semibold text-label whitespace-nowrap",
    "transition-[background-color,color,opacity] duration-150 select-none",
    "disabled:bg-surface-sunken disabled:text-ink-disabled disabled:border-transparent disabled:cursor-not-allowed",
    "aria-disabled:bg-surface-sunken aria-disabled:text-ink-disabled aria-disabled:cursor-not-allowed",
    VARIANTS[variant],
    SIZES[size],
    block && "w-full",
    extra,
  );
}

function Inner({ icon, iconRight, loading, size = "md", children }: StyleProps & { loading?: boolean; children?: ReactNode }) {
  const iconSize = size === "sm" ? 16 : 20;
  return (
    <>
      {loading ? (
        <Icon name="loader" size={iconSize} className="animate-spin" />
      ) : (
        icon && <Icon name={icon} size={iconSize} />
      )}
      {children}
      {iconRight && <Icon name={iconRight} size={iconSize} />}
    </>
  );
}

export type ButtonProps = StyleProps & ComponentProps<"button"> & { loading?: boolean };

export function Button({ variant, size, icon, iconRight, loading, block, className, children, type = "button", disabled, ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, block }, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      <Inner icon={icon} iconRight={iconRight} loading={loading} size={size}>
        {children}
      </Inner>
    </button>
  );
}

export type ButtonLinkProps = StyleProps & ComponentProps<typeof Link>;

export function ButtonLink({ variant, size, icon, iconRight, block, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={buttonClasses({ variant, size, block }, className)} {...rest}>
      <Inner icon={icon} iconRight={iconRight} size={size}>
        {children}
      </Inner>
    </Link>
  );
}
