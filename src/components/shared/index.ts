// Shared components for every module. Import from "@/components/shared".
export { Icon, type IconName, type IconProps } from "./Icon";
export { Button, ButtonLink, buttonClasses, type ButtonProps, type ButtonLinkProps, type ButtonVariant, type ButtonSize } from "./Button";
export { TextField, type TextFieldProps } from "./TextField";
export { PasswordField, type PasswordFieldProps } from "./PasswordField";
export { Select, type SelectProps, type SelectOption } from "./Select";
export { Checkbox, type CheckboxProps } from "./Checkbox";
export { Alert, type Tone } from "./Alert";
export { Badge, type BadgeTone, type BadgeVariant } from "./Badge";
export { Tabs, type TabItem } from "./Tabs";
export { ToastProvider, useToast, type ToastInput } from "./Toast";
export { Logo } from "./Logo";
export { ProductCard, PRODUCT_GRID, type ProductCardProps, type ProductStock } from "./ProductCard";
export { StaffTopBar } from "./StaffTopBar";
export { RouteGuard, AccessGuard } from "./RouteGuard";
export { AppSidebar } from "./AppSidebar";
export { AppShell } from "./AppShell";
export { cx } from "./cx";

/** Card recipe from the design system. */
export const CARD = "bg-surface-raised border border-line rounded-lg shadow-1 p-5";
