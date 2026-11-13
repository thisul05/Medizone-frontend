import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

interface EmptyStateProps {
  title: ReactNode;
  description?: ReactNode;
  icon?: IconName;
  action?: ReactNode;
  compact?: boolean;
}

export function EmptyState({ title, description, icon = "package", action, compact }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center gap-1.5 px-6 text-center ${compact ? "py-8" : "py-12"}`}>
      <span className="mb-2 grid size-12 place-items-center rounded-full bg-(--soft-bg) text-(--heading)">
        <Icon name={icon} size={24} />
      </span>
      <p className="text-base leading-6 font-bold text-(--heading)">{title}</p>
      {description ? <p className="max-w-[420px] text-sm leading-5 text-(--ink-muted)">{description}</p> : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
