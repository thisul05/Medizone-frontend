import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  /** The one primary action, top right. */
  action?: ReactNode;
  eyebrow?: ReactNode;
}

export function PageHeader({ title, description, action, eyebrow }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? <div className="mb-2">{eyebrow}</div> : null}
        <h1 className="text-[28px] leading-[34px] font-semibold text-(--ink)">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-(--ink-muted)">{description}</p> : null}
      </div>
      {action ? <div className="flex flex-none flex-wrap gap-3">{action}</div> : null}
    </header>
  );
}
