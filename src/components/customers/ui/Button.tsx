import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

/**
 * primary: navy (Add Customer, Mark as Sent). secondary: white with a border (Cancel, Close).
 * soft: light grey with navy text (Preview Reminder, View History, the eye button). ghost: text only.
 */
export type ButtonVariant = "primary" | "secondary" | "soft" | "ghost" | "success" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap border font-semibold transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed disabled:border-transparent disabled:bg-(--soft-bg) disabled:text-(--ink-disabled)";

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs rounded-[6px]",
  md: "h-10 px-5 text-sm rounded-md",
  lg: "h-12 px-6 text-[15px] rounded-md",
};

const variants: Record<ButtonVariant, string> = {
  primary: "border-transparent bg-(--primary) text-(--on-primary) hover:enabled:bg-(--primary-hover) [a&]:hover:bg-(--primary-hover)",
  secondary: "border-(--border) bg-(--surface-raised) text-(--heading) hover:enabled:bg-(--surface-hover) [a&]:hover:bg-(--surface-hover)",
  soft: "border-transparent bg-(--soft-bg) text-(--heading) hover:enabled:bg-(--soft-bg-hover) [a&]:hover:bg-(--soft-bg-hover)",
  ghost: "border-transparent bg-transparent text-(--heading) hover:enabled:bg-(--primary-tint) [a&]:hover:bg-(--primary-tint)",
  success: "border-transparent bg-(--success-solid) text-(--on-solid) hover:enabled:brightness-90",
  danger: "border-transparent bg-(--danger-solid) text-(--on-solid) hover:enabled:brightness-90",
};

export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", extra = "") {
  return `${base} ${sizes[size]} ${variants[variant]} ${extra}`;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  loading?: boolean;
  block?: boolean;
  children?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  icon,
  loading,
  block,
  className = "",
  children,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  const iconSize = size === "sm" ? 15 : 18;
  return (
    <button
      type={type}
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses(variant, size, `${block ? "w-full" : ""} ${className}`)}
    >
      {loading ? (
        <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden />
      ) : icon ? (
        <Icon name={icon} size={iconSize} />
      ) : null}
      {children}
    </button>
  );
}

interface ButtonLinkProps extends ComponentProps<typeof Link> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
}

export function ButtonLink({ variant = "secondary", size = "md", icon, className = "", children, ...rest }: ButtonLinkProps) {
  return (
    <Link {...rest} className={buttonClasses(variant, size, className)}>
      {icon ? <Icon name={icon} size={size === "sm" ? 15 : 18} /> : null}
      {children}
    </Link>
  );
}

/** Square icon-only button, e.g. the eye "View profile" action in the customer table. */
export function IconButtonLink({ href, icon, label }: { href: string; icon: IconName; label: string }) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="grid size-8 place-items-center rounded-[6px] bg-(--soft-bg) text-(--heading) transition-colors hover:bg-(--soft-bg-hover)"
    >
      <Icon name={icon} size={18} />
    </Link>
  );
}
