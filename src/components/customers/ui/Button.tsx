import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "success" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap border font-semibold transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed disabled:border-transparent disabled:bg-(--surface-sunken) disabled:text-(--ink-disabled)";

// Pill-shaped, like the buttons on medizone.lk.
const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3.5 text-[13px] rounded-full",
  md: "h-10 px-5 text-sm rounded-full",
  lg: "h-12 px-6 text-[15px] rounded-full",
};

const variants: Record<ButtonVariant, string> = {
  primary: "border-transparent bg-(--primary) text-(--on-primary) hover:enabled:bg-(--primary-hover)",
  secondary:
    "border-(--border-strong) bg-(--surface-raised) text-(--primary-tint-ink) hover:enabled:bg-(--primary-tint)",
  ghost: "border-transparent bg-transparent text-(--primary-tint-ink) hover:enabled:bg-(--primary-tint)",
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
  const iconSize = size === "sm" ? 16 : 18;
  return (
    <button
      type={type}
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses(variant, size, `${block ? "w-full" : ""} ${className}`)}
    >
      {loading ? (
        <span
          className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          aria-hidden
        />
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
      {icon ? <Icon name={icon} size={size === "sm" ? 16 : 18} /> : null}
      {children}
    </Link>
  );
}
