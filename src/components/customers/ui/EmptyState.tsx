import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

interface EmptyStateProps {
  title: ReactNode;
  description?: ReactNode;
  icon?: IconName;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon = "package", action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <span className="mb-2 grid size-14 place-items-center rounded-full bg-(--primary-tint) text-(--primary-tint-ink)">
        <Icon name={icon} size={28} />
      </span>
      <p className="text-lg leading-6 font-semibold text-(--ink)">{title}</p>
      {description ? <p className="max-w-[380px] text-(--ink-muted)">{description}</p> : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
