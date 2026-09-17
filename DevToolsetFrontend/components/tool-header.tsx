"use client";

import { useEffect } from "react";
import type { LucideIcon } from "lucide-react";

type ToolHeaderProps = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export function ToolHeader({ title, description, icon: Icon }: ToolHeaderProps) {
  useEffect(() => {
    document.title = `${title} — DevToolset`;
  }, [title]);

  return (
    <div className="min-w-0">
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-panel">
          <Icon className="h-4 w-4 text-accent" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h1>
          <p className="mt-1 text-sm text-secondary">{description}</p>
        </div>
      </div>
    </div>
  );
}
